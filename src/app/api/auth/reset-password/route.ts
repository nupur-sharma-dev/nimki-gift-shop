import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  validatePasswordResetToken,
  hashPassword,
  validatePasswordStrength,
} from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = (await req.json()) as {
      token: string;
      password: string;
    };

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "Token and password are required." },
        { status: 400 }
      );
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return NextResponse.json(
        { success: false, error: passwordError },
        { status: 400 }
      );
    }

    const result = await validatePasswordResetToken(token);
    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    const { record } = result;
    const hashed = await hashPassword(password);

    // record.email is the stored email — update user by email
    await prisma.user.update({
      where: { email: record!.email },
      data:  { password: hashed },
    });

    // Delete the used token
    await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now log in.",
    });
  } catch (err) {
    console.error("[RESET PASSWORD ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}