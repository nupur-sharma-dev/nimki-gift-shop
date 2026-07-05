import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  validatePasswordStrength,
  createEmailVerificationToken,
} from "@/lib/auth-helpers";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body as {
      name: string;
      email: string;
      password: string;
    };

    // ── Validation ──
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { success: false, error: "All fields are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
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

    // ── Check existing user ──
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // ── Create user ──
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name:     name.trim(),
        email:    normalizedEmail,
        password: hashedPassword,
        role:     "USER",
        isActive: true,
      },
    });

    // ── Send verification email ──
    const token = await createEmailVerificationToken(user.id);
    await sendVerificationEmail(normalizedEmail, user.name ?? "there", token);

    return NextResponse.json(
      {
        success: true,
        message: "Account created! Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[REGISTER ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}