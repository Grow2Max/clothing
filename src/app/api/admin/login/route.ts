import { NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_SECONDS, createSessionToken, safeEqual } from "@/lib/admin-session";

export const runtime = "nodejs";

// Simple brute-force protection: at most 5 wrong passwords per 15 minutes per IP.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
const fails = new Map<string, { count: number; until: number }>();

function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
}

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: "Admin login is not configured on the server." }, { status: 503 });
  }

  const ip = clientIp(req);
  const now = Date.now();
  const rec = fails.get(ip);
  if (rec && rec.until > now && rec.count >= MAX_FAILS) {
    const mins = Math.ceil((rec.until - now) / 60000);
    return NextResponse.json({ error: `Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.` }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const password = typeof body?.password === "string" ? body.password : "";
  // Compare fixed-length hashes in constant time.
  const ok = safeEqual(await sha256(password), await sha256(expected));
  if (!ok) {
    const r = rec && rec.until > now ? rec : { count: 0, until: now + WINDOW_MS };
    r.count += 1;
    fails.set(ip, r);
    await new Promise((res) => setTimeout(res, 400)); // slow down guessing
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  fails.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  res.cookies.delete("admin_auth"); // old insecure cookie
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
