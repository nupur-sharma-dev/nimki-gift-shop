"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/constants";
import styles from "./page.module.css";

type Status = "loading" | "success" | "error";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token        = searchParams.get("token");

  const [status,  setStatus]  = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const didRun               = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error ?? "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  if (status === "loading") {
    return (
      <div className={styles.wrapper}>
        <div className={styles.stateBox}>
          <span className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Verifying your email…</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className={styles.wrapper}>
        <div className={styles.stateBox}>
          <i className={`bx bx-check-circle ${styles.successIcon}`} />
          <h2 className={styles.heading}>Email verified!</h2>
          <p className={styles.bodyText}>{message}</p>
          <Link href={ROUTES.LOGIN} className={styles.actionBtn}>
            <i className="bx bx-log-in" />
            Sign in now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.stateBox}>
        <i className={`bx bx-error-circle ${styles.errorIcon}`} />
        <h2 className={styles.heading}>Verification failed</h2>
        <p className={styles.bodyText}>{message}</p>
        <div className={styles.actions}>
          <Link href={ROUTES.REGISTER} className={styles.actionBtn}>
            Create new account
          </Link>
          <Link href={ROUTES.LOGIN} className={styles.secondaryBtn}>
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}