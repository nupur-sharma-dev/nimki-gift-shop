import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/auth-helpers";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email: string };

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always respond the same way to prevent email enumeration
    if (!user || !user.password) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, a reset link has been sent.",
      });
    }

    // createPasswordResetToken now takes email (not userId)
    const token = await createPasswordResetToken(normalizedEmail);
    await sendPasswordResetEmail(normalizedEmail, user.name ?? "there", token);

    return NextResponse.json({
      success: true,
      message: "Password reset link sent. Please check your email.",
    });
  } catch (err) {
    console.error("[FORGOT PASSWORD ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}