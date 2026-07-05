import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, image } = body;

  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json(
      { success: false, error: "Name must be at least 2 characters." },
      { status: 400 }
    );
  }
  if (name.trim().length > 80) {
    return NextResponse.json(
      { success: false, error: "Name is too long." },
      { status: 400 }
    );
  }
  if (image !== undefined && image !== null && typeof image !== "string") {
    return NextResponse.json({ success: false, error: "Invalid image." }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        ...(image !== undefined ? { image } : {}),
      },
      select: { id: true, name: true, email: true, image: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[account/profile] PATCH failed:", error);
    return NextResponse.json(
      { success: false, error: "Could not update profile." },
      { status: 500 }
    );
  }
}