import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createReview } from "@/services/review.service";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productId, rating, comment } = body;

  if (!productId || typeof productId !== "string") {
    return NextResponse.json(
      { success: false, error: "productId is required" },
      { status: 400 }
    );
  }

  const result = await createReview(session.user.id, productId, { rating, comment });

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: result.data }, { status: 201 });
}