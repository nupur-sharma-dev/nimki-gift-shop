"use client";

import { useEffect, useState } from "react";
import styles from "./AuthSlideshow.module.css";
import { APP_NAME, APP_TAGLINE } from "@/constants";

const SLIDES = [
  {
    url: "/images/image.png",
    label: "Handcrafted with love",
  },
  {
    url: "/images/image1.png",
    label: "Gifts that tell a story",
  },
  {
    url: "/images/image2.png",
    label: "Every detail matters",
  },
  {
    url: "/images/image3.png",
    label: "Made for the people you love",
  },
];

export default function AuthSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.slideshow}>
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`${styles.slide} ${i === current ? styles.active : ""}`}
          style={{ backgroundImage: `url(${slide.url})` }}
          aria-hidden={i !== current}
        />
      ))}

      {/* Overlay */}
      <div className={styles.overlay} />

      {/* Brand */}
      <div className={styles.brand}>
        <p className={styles.brandEyebrow}>Welcome to</p>
        <h1 className={styles.brandName}>{APP_NAME}</h1>
        <p className={styles.brandTagline}>{APP_TAGLINE}</p>
      </div>

      {/* Slide label */}
      <div className={styles.labelRow}>
        <p className={styles.slideLabel}>{SLIDES[current].label}</p>
        <div className={styles.dots}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}