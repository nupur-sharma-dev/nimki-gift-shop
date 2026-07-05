import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateEmailVerificationToken } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  try {
    const { token } = (await req.json()) as { token: string };

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is missing." },
        { status: 400 }
      );
    }

    const result = await validateEmailVerificationToken(token);
    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    const { record } = result;

    // Mark email as verified
    await prisma.user.update({
      where: { id: record!.user.id },
      data:  { emailVerified: new Date() },
    });

    // Mark token as used then delete it
    await prisma.emailVerificationToken.deleteMany({
      where: { token },
    });
    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now log in.",
    });
  } catch (err) {
    console.error("[VERIFY EMAIL ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}