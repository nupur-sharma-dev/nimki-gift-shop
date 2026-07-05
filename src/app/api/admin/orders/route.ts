import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminOrders } from "@/services/admin-order.service";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const status = (searchParams.get("status") as OrderStatus | null) || undefined;
  const paymentStatus = (searchParams.get("paymentStatus") as PaymentStatus | null) || undefined;
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  const result = await getAdminOrders({ search, status, paymentStatus, page, limit });
  return NextResponse.json({ success: true, ...result });
}