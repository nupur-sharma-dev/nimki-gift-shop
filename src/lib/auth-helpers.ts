import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// ── Token generation ──────────────────────────────────────────────────────────

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ── Password utils ────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain a number.";
  return null;
}

// ── Email verification token ──────────────────────────────────────────────────
// EmailVerificationToken has: id, userId, token, expires, used, user (relation)

export async function createEmailVerificationToken(
  userId: string
): Promise<string> {
  // Delete any existing tokens for this user
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const token   = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.emailVerificationToken.create({
    data: { userId, token, expires },
  });

  return token;
}

export async function validateEmailVerificationToken(token: string) {
  const record = await prisma.emailVerificationToken.findUnique({
    where:   { token },
    include: { user: true },
  });

  if (!record)                     return { error: "Invalid or expired link." };
  if (record.expires < new Date()) return { error: "This link has expired. Please request a new one." };
  if (record.used)                 return { error: "This link has already been used." };
  if (record.user.emailVerified)   return { error: "Email is already verified." };

  return { record };
}

// ── Password reset token ──────────────────────────────────────────────────────
// PasswordResetToken has: id, email, token, expires, used — NO userId, NO relation

export async function createPasswordResetToken(email: string): Promise<string> {
  // Delete any existing tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  const token   = generateToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: { email, token, expires },
  });

  return token;
}

export async function validatePasswordResetToken(token: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record)                     return { error: "Invalid or expired link." };
  if (record.expires < new Date()) return { error: "This link has expired. Please request a new one." };
  if (record.used)                 return { error: "This link has already been used." };

  return { record };
}