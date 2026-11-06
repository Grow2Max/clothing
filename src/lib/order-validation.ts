// Shared by the checkout form (instant feedback) and the orders API (the real check).

/** Indian mobile: 10 digits starting 6–9; spaces, dashes and a +91 / 0 prefix are allowed. */
export function normalizeIndianMobile(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

/** "+919876543210" → "+91 98765 43210" for display. */
export function formatIndianMobile(e164: string): string {
  const m = /^\+91(\d{5})(\d{5})$/.exec(e164);
  return m ? `+91 ${m[1]} ${m[2]}` : e164;
}

export type CheckoutFields = { customerName: string; phone: string; address: string };
export type CheckoutErrors = Partial<Record<keyof CheckoutFields, string>>;

export function validateCheckout(f: CheckoutFields): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const name = f.customerName.trim();
  if (!name) errors.customerName = "Please enter your name.";
  // at least two letters (Latin or Tamil script); digits/symbols alone don't count
  else if ((name.match(/[A-Za-z\u0B80-\u0BFF]/g) ?? []).length < 2) errors.customerName = "Please enter your full name.";
  else if (name.length > 80) errors.customerName = "Name is too long.";
  if (!f.phone.trim()) errors.phone = "Please enter your mobile number.";
  else if (!normalizeIndianMobile(f.phone)) errors.phone = "Please enter a valid 10-digit mobile number.";
  if (f.address.length > 500) errors.address = "Address is too long (500 characters max).";
  return errors;
}
