/**
 * Signed admin session (works in the Edge middleware and in Node route handlers —
 * uses only Web Crypto). The cookie value is `<expiry>.<nonce>.<signature>`, where the
 * signature is HMAC-SHA256(ADMIN_SESSION_SECRET). It can't be forged or extended
 * without the secret, unlike a plain "logged in = 1" cookie.
 */
export const ADMIN_COOKIE = "ahm_admin_session";
export const SESSION_SECONDS = 60 * 60 * 8; // 8 hours

const enc = new TextEncoder();

function secret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...Array.from(new Uint8Array(buf)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function sign(data: string, key: string) {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", k, enc.encode(data)));
}

/** Constant-time string comparison (avoids leaking how many characters matched). */
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const key = secret();
  if (!key) throw new Error("ADMIN_SESSION_SECRET is missing or too short");
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const nonce = b64url(crypto.getRandomValues(new Uint8Array(16)).buffer);
  const body = `${exp}.${nonce}`;
  return `${body}.${await sign(body, key)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const key = secret();
  if (!key || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [exp, nonce, sig] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, await sign(`${exp}.${nonce}`, key));
}
