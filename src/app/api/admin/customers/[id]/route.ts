import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getAdminUserById,
  toggleUserActive,
  updateUserRole,
} from "@/services/admin-user.service";
import type { UserRole } from "@prisma/client";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const user = await getAdminUserById(params.id);
  if (!user) {
    return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: user });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { toggleActive, role } = body as { toggleActive?: boolean; role?: UserRole };

  if (!toggleActive && !role) {
    return NextResponse.json({ success: false, error: "No changes provided." }, { status: 400 });
  }

  if (toggleActive) {
    const result = await toggleUserActive(params.id, session.user.id);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  }

  if (role) {
    const result = await updateUserRole(params.id, role, session.user.id);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
  }

  const updated = await getAdminUserById(params.id);
  return NextResponse.json({ success: true, data: updated });
}