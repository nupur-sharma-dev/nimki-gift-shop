import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAddressById } from "@/services/address.service";
import { calculateCartTotals } from "@/services/order.service";
import { setCheckoutIntent, type CheckoutIntentItem } from "@/lib/checkout-intent";
import { buildEsewaFormFields, generateTransactionUuid, ESEWA_FORM_URL } from "@/lib/esewa";
import { ORDER_NOTES_MAX_LENGTH } from "@/constants";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { addressId, notes } = body;

  if (!addressId || typeof addressId !== "string") {
    return NextResponse.json(
      { success: false, error: "Please select a delivery address." },
      { status: 400 }
    );
  }
  if (notes !== undefined && (typeof notes !== "string" || notes.length > ORDER_NOTES_MAX_LENGTH)) {
    return NextResponse.json({ success: false, error: "Notes are too long." }, { status: 400 });
  }

  const address = await getAddressById(session.user.id, addressId);
  if (!address) {
    return NextResponse.json({ success: false, error: "Selected address not found." }, { status: 400 });
  }

  const { cart, subtotal, shippingCost, total } = await calculateCartTotals(session.user.id);
  if (cart.items.length === 0) {
    return NextResponse.json({ success: false, error: "Your cart is empty." }, { status: 400 });
  }

  for (const item of cart.items) {
    if (!item.product.isActive) {
      return NextResponse.json(
        { success: false, error: `${item.product.name} is no longer available.` },
        { status: 400 }
      );
    }
    if (item.quantity > item.product.stock) {
      return NextResponse.json(
        { success: false, error: `Only ${item.product.stock} of "${item.product.name}" left in stock.` },
        { status: 400 }
      );
    }
  }

  const transactionUuid = generateTransactionUuid();

  const items: CheckoutIntentItem[] = cart.items.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    image: item.product.images[0] ?? "",
    price: item.product.price,
    quantity: item.quantity,
  }));

  setCheckoutIntent({
    userId: session.user.id,
    addressId,
    notes: notes?.trim() || null,
    transactionUuid,
    items,
    subtotal,
    shippingCost,
    total,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });

  const fields = buildEsewaFormFields({
    amount: subtotal,
    taxAmount: 0,
    productServiceCharge: 0,
    productDeliveryCharge: shippingCost,
    totalAmount: total,
    transactionUuid,
  });

  return NextResponse.json({ success: true, data: { formUrl: ESEWA_FORM_URL, fields } });
}