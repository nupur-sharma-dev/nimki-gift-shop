"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import styles from "./Newsletter.module.css";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (val: string) => {
    if (!val.trim()) return "Please enter your email address.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
      return "Please enter a valid email address.";
    return "";
  };

  const handleSubmit = () => {
    const err = validate(email);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setLoading(true);

    // TODO: connect to Resend newsletter list in a future ticket
    setTimeout(() => {
      setLoading(false);
      setEmail("");
      toast.success("You're on the list! We'll be in touch.");
    }, 800);
  };

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.badge}>
          <i className="bx bx-gift" />
        </div>
        <h2 className={styles.heading}>Be the first to know</h2>
        <p className={styles.sub}>
          New collections, seasonal gift guides, and exclusive offers — straight
          to your inbox. No noise, just things worth knowing.
        </p>

        <div className={styles.formRow}>
          <div className={styles.inputWrap}>
            <i className={`bx bx-envelope ${styles.inputIcon}`} />
            <input
              type="email"
              className={`${styles.input} ${error ? styles.inputError : ""}`}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              disabled={loading}
              aria-label="Email address"
            />
          </div>
          <button
            className={styles.btn}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <>
                Subscribe
                <i className="bx bx-right-arrow-alt" />
              </>
            )}
          </button>
        </div>

        {error && (
          <p className={styles.errorMsg} role="alert">
            <i className="bx bx-error-circle" />
            {error}
          </p>
        )}

        <p className={styles.note}>
          No spam, ever. Unsubscribe any time.
        </p>
      </div>
    </section>
  );
}