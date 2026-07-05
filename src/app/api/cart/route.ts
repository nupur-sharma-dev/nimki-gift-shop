import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCart, addToCart } from "@/services/cart.service";
import { MAX_CART_QUANTITY } from "@/constants";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const cart = await getCart(session.user.id);
  return NextResponse.json({ success: true, data: cart });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productId, quantity = 1 } = body;

  if (!productId || typeof productId !== "string") {
    return NextResponse.json({ success: false, error: "productId is required" }, { status: 400 });
  }
  if (typeof quantity !== "number" || quantity < 1) {
    return NextResponse.json({ success: false, error: "Invalid quantity" }, { status: 400 });
  }

  const result = await addToCart(session.user.id, productId, quantity, MAX_CART_QUANTITY);

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}