import { NextRequest, NextResponse } from "next/server";
import { getCheckoutIntent, clearCheckoutIntent } from "@/lib/checkout-intent";
import { decodeEsewaData, verifyEsewaSignature, checkEsewaStatus } from "@/lib/esewa";
import { createEsewaOrder } from "@/services/order.service";
import { APP_URL } from "@/constants";

export async function GET(req: NextRequest) {
  const dataParam = req.nextUrl.searchParams.get("data");

  const failRedirect = (reason: string) => {
    clearCheckoutIntent();
    return NextResponse.redirect(`${APP_URL}/checkout?error=${reason}`);
  };

  if (!dataParam) return failRedirect("payment_failed");

  const esewaData = decodeEsewaData(dataParam);
  if (!esewaData) return failRedirect("payment_failed");

  if (!verifyEsewaSignature(esewaData)) {
    console.error("[esewa/success] signature mismatch");
    return failRedirect("payment_verification_failed");
  }

  const intent = getCheckoutIntent();
  if (!intent) return failRedirect("session_expired");

  if (esewaData.transaction_uuid !== intent.transactionUuid) {
    return failRedirect("payment_verification_failed");
  }
  if (Number(esewaData.total_amount) !== intent.total) {
    return failRedirect("payment_verification_failed");
  }
  if (esewaData.status !== "COMPLETE") {
    return failRedirect("payment_failed");
  }

  const statusCheck = await checkEsewaStatus({
    productCode: esewaData.product_code,
    totalAmount: esewaData.total_amount,
    transactionUuid: esewaData.transaction_uuid,
  });
  if (!statusCheck || statusCheck.status !== "COMPLETE") {
    return failRedirect("payment_verification_failed");
  }

  const result = await createEsewaOrder(intent, esewaData);
  clearCheckoutIntent();

  if (!result.success) {
    return NextResponse.redirect(`${APP_URL}/checkout?error=order_creation_failed`);
  }

  return NextResponse.redirect(`${APP_URL}/orders/${result.orderId}/success`);
}