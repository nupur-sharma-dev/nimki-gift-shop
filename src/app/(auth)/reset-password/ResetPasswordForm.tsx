"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ROUTES } from "@/constants";
import styles from "./page.module.css";

export default function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token") ?? "";

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showP,     setShowP]     = useState(false);
  const [showC,     setShowC]     = useState(false);
  const [loading,   setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res  = await fetch("/api/auth/reset-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      toast.error(data.error ?? "Something went wrong.");
      return;
    }

    toast.success("Password updated! Please sign in.");
    router.push(ROUTES.LOGIN);
  }

  if (!token) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.errorBox}>
          <i className={`bx bx-error-circle ${styles.errorIcon}`} />
          <h2 className={styles.errorHeading}>Invalid link</h2>
          <p className={styles.errorText}>
            This reset link is missing or invalid. Please request a new one.
          </p>
          <Link href={ROUTES.FORGOT_PASSWORD} className={styles.actionLink}>
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Account recovery</p>
        <h2 className={styles.heading}>Set a new password</h2>
        <p className={styles.sub}>
          Choose a strong password for your account.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            New password
          </label>
          <div className={styles.inputWrap}>
            <i className={`bx bx-lock-alt ${styles.inputIcon}`} />
            <input
              id="password"
              type={showP ? "text" : "password"}
              className={styles.input}
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowP(!showP)}
              aria-label={showP ? "Hide password" : "Show password"}
            >
              <i className={`bx ${showP ? "bx-hide" : "bx-show"}`} />
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="confirm" className={styles.label}>
            Confirm password
          </label>
          <div className={styles.inputWrap}>
            <i className={`bx bx-lock ${styles.inputIcon}`} />
            <input
              id="confirm"
              type={showC ? "text" : "password"}
              className={styles.input}
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowC(!showC)}
              aria-label={showC ? "Hide password" : "Show password"}
            >
              <i className={`bx ${showC ? "bx-hide" : "bx-show"}`} />
            </button>
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
              Updating password…
            </>
          ) : (
            <>
              <i className="bx bx-check-shield" />
              Set new password
            </>
          )}
        </button>
      </form>
    </div>
  );
}