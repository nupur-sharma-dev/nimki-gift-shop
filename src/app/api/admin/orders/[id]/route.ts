import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAdminOrderById,
  updateOrderStatus,
  updatePaymentStatus,
} from "@/services/admin-order.service";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const order = await getAdminOrderById(params.id);
  if (!order) {
    return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: order });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { status, paymentStatus, cancelReason } = body as {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    cancelReason?: string;
  };

  if (!status && !paymentStatus) {
    return NextResponse.json(
      { success: false, error: "No changes provided." },
      { status: 400 }
    );
  }

  if (status) {
    const result = await updateOrderStatus(params.id, status, cancelReason);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  }

  if (paymentStatus) {
    const result = await updatePaymentStatus(params.id, paymentStatus);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  }

  const updated = await getAdminOrderById(params.id);
  return NextResponse.json({ success: true, data: updated });
}