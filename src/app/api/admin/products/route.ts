import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminProducts, createProduct } from "@/services/admin-product.service";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const status = (searchParams.get("status") as "active" | "inactive" | "all") || "all";
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const result = await getAdminProducts({ search, categoryId, status, page, limit });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();

    const input = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: Number(body.price),
      comparePrice:
        body.comparePrice === "" || body.comparePrice === null || body.comparePrice === undefined
          ? null
          : Number(body.comparePrice),
      stock: Number(body.stock),
      sku: body.sku === "" || body.sku === null || body.sku === undefined ? null : body.sku,
      images: Array.isArray(body.images) ? body.images : [],
      categoryId: body.categoryId,
      isFeatured: Boolean(body.isFeatured),
    };

    const result = await createProduct(input);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product." },
      { status: 500 }
    );
  }
}