import crypto from "crypto";
import { cookies } from "next/headers";

const INTENT_COOKIE = "nimki_esewa_intent";
const INTENT_SECRET = process.env.NEXTAUTH_SECRET!;
const INTENT_MAX_AGE_SECONDS = 15 * 60;

export interface CheckoutIntentItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface CheckoutIntent {
  userId: string;
  addressId: string;
  notes: string | null;
  transactionUuid: string;
  items: CheckoutIntentItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  expiresAt: number;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", INTENT_SECRET).update(payload).digest("hex");
}

export function setCheckoutIntent(intent: CheckoutIntent) {
  const payload = Buffer.from(JSON.stringify(intent)).toString("base64");
  const signature = sign(payload);
  cookies().set(INTENT_COOKIE, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: INTENT_MAX_AGE_SECONDS,
    path: "/",
  });
}

export function getCheckoutIntent(): CheckoutIntent | null {
  try {
    const raw = cookies().get(INTENT_COOKIE)?.value;
    if (!raw) return null;

    const [payload, signature] = raw.split(".");
    if (!payload || !signature) return null;
    if (sign(payload) !== signature) return null;

    const intent: CheckoutIntent = JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
    if (intent.expiresAt < Date.now()) return null;

    return intent;
  } catch (error) {
    console.error("[checkout-intent] getCheckoutIntent failed:", error);
    return null;
  }
}

export function clearCheckoutIntent() {
  cookies().delete(INTENT_COOKIE);
}