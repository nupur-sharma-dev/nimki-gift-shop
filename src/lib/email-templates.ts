// src/lib/email-templates.ts
// Branded HTML email templates for Nimki Gift Shop.
// All styles are INLINE — email clients do not support external CSS or <style> blocks.
// Colors match variables.css brand palette.

// ── Shared brand constants ────────────────────────────────────────────────────

const BRAND = {
  primary:       "#b5485a",
  primaryDark:   "#8c2d3f",
  primarySubtle: "#fceef1",
  accent:        "#2d6a4f",
  highlight:     "#e8a838",
  textPrimary:   "#14080c",
  textSecondary: "#5a4550",
  textMuted:     "#9c8890",
  border:        "#e2dade",
  surface:       "#f3f0f1",
  offwhite:      "#f9f7f8",
  white:         "#ffffff",
};

const FONT = `Georgia, 'Times New Roman', serif`;
const FONT_BODY = `Arial, Helvetica, sans-serif`;

// ── Shared shell wrapper ──────────────────────────────────────────────────────

function shellTemplate(contentHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Nimki Gift Shop</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  background-color: ${BRAND.offwhite};
  font-family: ${FONT_BODY};
  font-size: 15px;
  line-height: 1.6;
  color: ${BRAND.textPrimary};
  -webkit-font-smoothing: antialiased;
">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${BRAND.offwhite}; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px;">

          <!-- Header -->
          <tr>
            <td style="
              background-color: ${BRAND.primary};
              border-radius: 10px 10px 0 0;
              padding: 32px 40px;
              text-align: center;
            ">
              <p style="
                margin: 0;
                font-family: ${FONT};
                font-size: 26px;
                font-weight: 700;
                letter-spacing: -0.02em;
                color: ${BRAND.white};
              ">Nimki Gift Shop</p>
              <p style="
                margin: 6px 0 0;
                font-family: ${FONT_BODY};
                font-size: 12px;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                color: rgba(255,255,255,0.75);
              ">Handmade with love, from Nepal</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="
              background-color: ${BRAND.white};
              padding: 40px 40px 36px;
              border-left: 1px solid ${BRAND.border};
              border-right: 1px solid ${BRAND.border};
            ">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              background-color: ${BRAND.surface};
              border: 1px solid ${BRAND.border};
              border-top: none;
              border-radius: 0 0 10px 10px;
              padding: 24px 40px;
              text-align: center;
            ">
              <p style="margin: 0 0 6px; font-size: 12px; color: ${BRAND.textMuted};">
                © ${new Date().getFullYear()} Nimki Gift Shop · Kathmandu, Nepal
              </p>
              <p style="margin: 0; font-size: 12px; color: ${BRAND.textMuted};">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ── Shared UI primitives ──────────────────────────────────────────────────────

function ctaButton(label: string, href: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px auto;">
  <tr>
    <td style="
      background-color: ${BRAND.primary};
      border-radius: 6px;
    ">
      <a href="${href}" style="
        display: inline-block;
        padding: 14px 36px;
        font-family: ${FONT_BODY};
        font-size: 15px;
        font-weight: 600;
        color: ${BRAND.white};
        text-decoration: none;
        letter-spacing: 0.02em;
        border-radius: 6px;
      ">${label}</a>
    </td>
  </tr>
</table>
  `.trim();
}

function fallbackLink(href: string): string {
  return `
<p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted}; text-align: center; word-break: break-all;">
  If the button above doesn't work, copy and paste this link into your browser:<br />
  <a href="${href}" style="color: ${BRAND.primary}; text-decoration: underline;">${href}</a>
</p>
  `.trim();
}

function divider(): string {
  return `<hr style="border: none; border-top: 1px solid ${BRAND.border}; margin: 28px 0;" />`;
}

function greeting(name: string): string {
  return `<p style="margin: 0 0 16px; font-family: ${FONT}; font-size: 22px; font-weight: 700; color: ${BRAND.textPrimary};">Hi ${name},</p>`;
}

// ── 1. Email Verification Template ───────────────────────────────────────────

export function verificationEmailTemplate(name: string, link: string): string {
  const content = `
    ${greeting(name)}

    <p style="margin: 0 0 12px; color: ${BRAND.textSecondary};">
      Thank you for creating an account with Nimki Gift Shop. We're delighted to have you!
    </p>
    <p style="margin: 0 0 24px; color: ${BRAND.textSecondary};">
      Please verify your email address to activate your account and start exploring our handmade collection.
    </p>

    ${ctaButton("Verify My Email", link)}

    ${divider()}

    <p style="margin: 0 0 8px; font-size: 13px; color: ${BRAND.textMuted};">
      This link expires in <strong>24 hours</strong>. After that, you'll need to request a new verification email.
    </p>
    <p style="margin: 0 0 20px; font-size: 13px; color: ${BRAND.textMuted};">
      If you didn't create an account with us, you can safely ignore this email.
    </p>

    ${fallbackLink(link)}
  `;
  return shellTemplate(content);
}

// ── 2. Password Reset Template ────────────────────────────────────────────────

export function passwordResetTemplate(name: string, link: string): string {
  const content = `
    ${greeting(name)}

    <p style="margin: 0 0 12px; color: ${BRAND.textSecondary};">
      We received a request to reset the password for your Nimki Gift Shop account.
    </p>
    <p style="margin: 0 0 24px; color: ${BRAND.textSecondary};">
      Click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.
    </p>

    ${ctaButton("Reset My Password", link)}

    ${divider()}

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="
          background-color: ${BRAND.primarySubtle};
          border-left: 3px solid ${BRAND.primary};
          border-radius: 0 6px 6px 0;
          padding: 14px 18px;
          margin-bottom: 20px;
        ">
          <p style="margin: 0; font-size: 13px; color: ${BRAND.primaryDark};">
            <strong>Didn't request this?</strong> Your password has not been changed.
            You can safely ignore this email. If you're concerned about your account security,
            please contact us.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin: 20px 0 0; font-size: 13px; color: ${BRAND.textMuted}; text-align: center;">
      For security, this link expires in 1 hour and can only be used once.
    </p>

    ${divider()}

    ${fallbackLink(link)}
  `;
  return shellTemplate(content);
}

// ── 3. Order Confirmation Template ───────────────────────────────────────────

export interface OrderEmailData {
  orderNumber: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: string;
}

function formatNPR(amount: number): string {
  return `NPR ${amount.toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function orderConfirmationTemplate(
  name: string,
  order: OrderEmailData
): string {
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid ${BRAND.border}; color: ${BRAND.textPrimary}; font-size: 14px;">
          ${item.name}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid ${BRAND.border}; color: ${BRAND.textSecondary}; font-size: 14px; text-align: center; white-space: nowrap;">
          × ${item.quantity}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid ${BRAND.border}; color: ${BRAND.textPrimary}; font-size: 14px; text-align: right; white-space: nowrap;">
          ${formatNPR(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join("");

  const content = `
    ${greeting(name)}

    <p style="margin: 0 0 6px; color: ${BRAND.textSecondary};">
      Thank you for your order! We've received it and will begin preparing your handmade items right away.
    </p>
    <p style="margin: 0 0 28px; font-size: 13px; color: ${BRAND.textMuted};">
      Order number: <strong style="color: ${BRAND.primary};">#${order.orderNumber}</strong>
    </p>

    <!-- Order Items Table -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <thead>
        <tr>
          <th style="padding: 8px 0; border-bottom: 2px solid ${BRAND.primary}; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${BRAND.textMuted}; text-align: left;">Item</th>
          <th style="padding: 8px 0; border-bottom: 2px solid ${BRAND.primary}; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${BRAND.textMuted}; text-align: center;">Qty</th>
          <th style="padding: 8px 0; border-bottom: 2px solid ${BRAND.primary}; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${BRAND.textMuted}; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Totals -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
      <tr>
        <td style="padding: 5px 0; font-size: 14px; color: ${BRAND.textSecondary};">Subtotal</td>
        <td style="padding: 5px 0; font-size: 14px; color: ${BRAND.textSecondary}; text-align: right;">${formatNPR(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding: 5px 0; font-size: 14px; color: ${BRAND.textSecondary};">Shipping</td>
        <td style="padding: 5px 0; font-size: 14px; color: ${BRAND.textSecondary}; text-align: right;">
          ${order.shippingCost === 0 ? "Free" : formatNPR(order.shippingCost)}
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0 5px; font-size: 16px; font-weight: 700; color: ${BRAND.textPrimary}; border-top: 1px solid ${BRAND.border};">Total</td>
        <td style="padding: 12px 0 5px; font-size: 16px; font-weight: 700; color: ${BRAND.primary}; text-align: right; border-top: 1px solid ${BRAND.border};">${formatNPR(order.total)}</td>
      </tr>
    </table>

    ${divider()}

    <!-- Shipping Address -->
    <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${BRAND.textMuted};">Shipping To</p>
    <p style="margin: 0 0 24px; font-size: 14px; color: ${BRAND.textSecondary}; line-height: 1.7;">
      ${order.shippingAddress.replace(/\n/g, "<br />")}
    </p>

    ${divider()}

    <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted}; text-align: center;">
      Questions about your order? Reply to this email or visit your
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/account/orders" style="color: ${BRAND.primary}; text-decoration: underline;">order history</a>.
    </p>
  `;
  return shellTemplate(content);
}