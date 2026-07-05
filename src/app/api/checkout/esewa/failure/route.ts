import { NextResponse } from "next/server";
import { clearCheckoutIntent } from "@/lib/checkout-intent";
import { APP_URL } from "@/constants";

export async function GET() {
  clearCheckoutIntent();
  return NextResponse.redirect(`${APP_URL}/checkout?error=payment_cancelled`);
}