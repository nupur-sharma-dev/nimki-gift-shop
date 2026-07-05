import crypto from "crypto";
import { APP_URL } from "@/constants";

const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE!;
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY!;
const ESEWA_BASE_URL = process.env.NEXT_PUBLIC_ESEWA_URL!;

export const ESEWA_FORM_URL = `${ESEWA_BASE_URL}/api/epay/main/v2/form`;
export const ESEWA_STATUS_CHECK_URL = `${ESEWA_BASE_URL.replace(
  "rc-epay",
  "rc"
)}/api/epay/transaction/status/`;

export const ESEWA_SUCCESS_URL = `${APP_URL}/api/checkout/esewa/success`;
export const ESEWA_FAILURE_URL = `${APP_URL}/api/checkout/esewa/failure`;

function sign(message: string): string {
  return crypto.createHmac("sha256", ESEWA_SECRET_KEY).update(message).digest("base64");
}

export function generateTransactionUuid(): string {
  return `NMK-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

interface EsewaFormParams {
  amount: number;
  taxAmount: number;
  productServiceCharge: number;
  productDeliveryCharge: number;
  totalAmount: number;
  transactionUuid: string;
}

export function buildEsewaFormFields(params: EsewaFormParams) {
  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const message = `total_amount=${params.totalAmount},transaction_uuid=${params.transactionUuid},product_code=${ESEWA_MERCHANT_CODE}`;
  const signature = sign(message);

  return {
    amount: String(params.amount),
    tax_amount: String(params.taxAmount),
    total_amount: String(params.totalAmount),
    transaction_uuid: params.transactionUuid,
    product_code: ESEWA_MERCHANT_CODE,
    product_service_charge: String(params.productServiceCharge),
    product_delivery_charge: String(params.productDeliveryCharge),
    success_url: ESEWA_SUCCESS_URL,
    failure_url: ESEWA_FAILURE_URL,
    signed_field_names: signedFieldNames,
    signature,
  };
}

export interface EsewaCallbackData {
  transaction_code: string;
  status: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  signed_field_names: string;
  signature: string;
  [key: string]: string;
}

export function decodeEsewaData(raw: string): EsewaCallbackData | null {
  try {
    const json = Buffer.from(raw, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch (error) {
    console.error("[esewa] decodeEsewaData failed:", error);
    return null;
  }
}

export function verifyEsewaSignature(data: EsewaCallbackData): boolean {
  try {
    const fields = data.signed_field_names.split(",");
    const message = fields.map((f) => `${f}=${data[f]}`).join(",");
    const expected = sign(message);
    return expected === data.signature;
  } catch (error) {
    console.error("[esewa] verifyEsewaSignature failed:", error);
    return false;
  }
}

export async function checkEsewaStatus(params: {
  productCode: string;
  totalAmount: string;
  transactionUuid: string;
}): Promise<{ status: string } | null> {
  try {
    const url = `${ESEWA_STATUS_CHECK_URL}?product_code=${params.productCode}&total_amount=${params.totalAmount}&transaction_uuid=${params.transactionUuid}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("[esewa] checkEsewaStatus failed:", error);
    return null;
  }
}