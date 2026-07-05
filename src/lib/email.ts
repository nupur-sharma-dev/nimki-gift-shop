// src/lib/email.ts
// Transactional email utility for Nimki Gift Shop.
// Sends via Resend when RESEND_API_KEY is set; falls back to console in dev.

import { Resend } from "resend";
import {
  verificationEmailTemplate,
  passwordResetTemplate,
  orderConfirmationTemplate,
} from "@/lib/email-templates";
import type { OrderEmailData } from "@/lib/email-templates";

// Re-export so other modules can import the type from here if preferred
export type { OrderEmailData };

// ── Resend client (null when key is absent) ───────────────────────────────────

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM =
  process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ── Internal send helper ──────────────────────────────────────────────────────

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (resend) {
    const { error } = await resend.emails.send({ from: FROM, ...opts });
    if (error) {
      // Log but don't throw — a failed email should never break the user flow
      console.error("[EMAIL] Resend error:", error);
    }
  } else {
    // Development fallback — full HTML logged to terminal
    console.log("\n📧 [EMAIL — DEV FALLBACK]");
    console.log(`  To:      ${opts.to}`);
    console.log(`  Subject: ${opts.subject}`);
    console.log("  Body:    (HTML omitted — set RESEND_API_KEY to send real emails)");
    console.log(`  Preview: ${APP_URL}\n`);
  }
}

// ── 1. Email Verification ─────────────────────────────────────────────────────

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const link = `${APP_URL}/verify-email?token=${token}`;
  await sendEmail({
    to,
    subject: "Verify your email — Nimki Gift Shop",
    html: verificationEmailTemplate(name, link),
  });
}

// ── 2. Password Reset ─────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const link = `${APP_URL}/reset-password?token=${token}`;
  await sendEmail({
    to,
    subject: "Reset your password — Nimki Gift Shop",
    html: passwordResetTemplate(name, link),
  });
}

// ── 3. Order Confirmation ─────────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  order: OrderEmailData
): Promise<void> {
  await sendEmail({
    to,
    subject: `Order confirmed #${order.orderNumber} — Nimki Gift Shop`,
    html: orderConfirmationTemplate(name, order),
  });
}