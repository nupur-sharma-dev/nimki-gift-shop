import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCodOrder } from "@/services/order.service";
import { ORDER_NOTES_MAX_LENGTH } from "@/constants";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { addressId, paymentMethod, notes } = body;

  if (!addressId || typeof addressId !== "string") {
    return NextResponse.json(
      { success: false, error: "Please select a delivery address." },
      { status: 400 }
    );
  }
  if (paymentMethod !== "CASH_ON_DELIVERY") {
    return NextResponse.json(
      { success: false, error: "Use the eSewa flow for eSewa payments." },
      { status: 400 }
    );
  }
  if (notes !== undefined && (typeof notes !== "string" || notes.length > ORDER_NOTES_MAX_LENGTH)) {
    return NextResponse.json({ success: false, error: "Notes are too long." }, { status: 400 });
  }

  const result = await createCodOrder(session.user.id, addressId, notes ?? null);

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data: { orderId: result.orderId, orderNumber: result.orderNumber },
  });
}