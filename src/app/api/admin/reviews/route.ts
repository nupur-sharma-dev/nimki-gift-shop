import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminReviews, type AdminReviewStatusFilter } from "@/services/admin-review.service";
import { PAGINATION } from "@/constants";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || PAGINATION.DEFAULT_PAGE;
  const limit = Number(searchParams.get("limit")) || PAGINATION.ADMIN_LIMIT;
  const status = (searchParams.get("status") as AdminReviewStatusFilter) || "ALL";
  const search = searchParams.get("search") || "";

  try {
    const result = await getAdminReviews({ page, limit, status, search });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load reviews." },
      { status: 500 }
    );
  }
}