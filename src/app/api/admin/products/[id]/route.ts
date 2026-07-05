import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAdminProductById,
  updateProduct,
  toggleProductActive,
} from "@/services/admin-product.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const product = await getAdminProductById(params.id);

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("GET /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();

    // Active-toggle path: body is exactly { isActive: boolean }
    if (typeof body.isActive === "boolean" && Object.keys(body).length === 1) {
      const result = await toggleProductActive(params.id, body.isActive);

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: result.data });
    }

    // Full update path
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

    const result = await updateProduct(params.id, input);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("PATCH /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product." },
      { status: 500 }
    );
  }
}