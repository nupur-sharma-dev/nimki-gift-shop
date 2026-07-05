import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminUsers } from "@/services/admin-user.service";
import type { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const role = (searchParams.get("role") as UserRole | null) || undefined;
  const status = (searchParams.get("status") as "active" | "inactive" | null) || undefined;
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  const result = await getAdminUsers({ search, role, status: status ?? undefined, page, limit });
  return NextResponse.json({ success: true, ...result });
}