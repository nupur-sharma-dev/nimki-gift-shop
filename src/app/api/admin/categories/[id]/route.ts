import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAdminCategoryById,
  updateCategory,
  toggleCategoryActive,
} from "@/services/admin-category.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const category = await getAdminCategoryById(params.id);

    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("GET /api/admin/categories/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category." },
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
      const result = await toggleCategoryActive(params.id, body.isActive);

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: result.data });
    }

    // Full update path
    const input = {
      name: body.name,
      slug: body.slug,
      description:
        body.description === "" || body.description === undefined ? null : body.description,
      image: body.image === "" || body.image === undefined ? null : body.image,
      sortOrder: Number(body.sortOrder) || 0,
    };

    const result = await updateCategory(params.id, input);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("PATCH /api/admin/categories/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category." },
      { status: 500 }
    );
  }
}