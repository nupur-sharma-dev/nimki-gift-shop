"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ROUTES } from "@/constants";
import styles from "./page.module.css";

export default function ForgotPasswordForm() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res  = await fetch("/api/auth/forgot-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      toast.error(data.error ?? "Something went wrong.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.successBox}>
          <i className={`bx bx-mail-send ${styles.successIcon}`} />
          <h2 className={styles.successHeading}>Reset link sent</h2>
          <p className={styles.successText}>
            If an account exists for <strong>{email}</strong>, you&apos;ll
            receive a password reset link shortly.
          </p>
          <Link href={ROUTES.LOGIN} className={styles.backLink}>
            <i className="bx bx-arrow-back" />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Account recovery</p>
        <h2 className={styles.heading}>Forgot your password?</h2>
        <p className={styles.sub}>
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email address
          </label>
          <div className={styles.inputWrap}>
            <i className={`bx bx-envelope ${styles.inputIcon}`} />
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner} />
              Sending…
            </>
          ) : (
            <>
              <i className="bx bx-send" />
              Send reset link
            </>
          )}
        </button>

        <Link href={ROUTES.LOGIN} className={styles.cancelLink}>
          <i className="bx bx-arrow-back" />
          Back to sign in
        </Link>
      </form>
    </div>
  );
}