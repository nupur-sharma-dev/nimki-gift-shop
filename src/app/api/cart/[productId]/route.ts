import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateCartItemQuantity, removeFromCart } from "@/services/cart.service";
import { MAX_CART_QUANTITY } from "@/constants";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { quantity } = await req.json();
  if (typeof quantity !== "number" || quantity < 0) {
    return NextResponse.json({ success: false, error: "Invalid quantity" }, { status: 400 });
  }

  const result = await updateCartItemQuantity(
    session.user.id,
    params.productId,
    quantity,
    MAX_CART_QUANTITY
  );

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await removeFromCart(session.user.id, params.productId);

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}