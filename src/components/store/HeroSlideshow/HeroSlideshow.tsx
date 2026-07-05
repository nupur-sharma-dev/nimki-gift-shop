"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./HeroSlideshow.module.css";
import { APP_NAME, APP_TAGLINE } from "@/constants";

const FALLBACK_SLIDES = [
  { url: "/images/image.png",  label: "Handcrafted with love",        sub: "Every piece made by artisan hands in Nepal." },
  { url: "/images/image1.png", label: "Gifts that tell a story",      sub: "Find something as unique as the person you love." },
  { url: "/images/image2.png", label: "Every detail matters",         sub: "Premium materials. Thoughtful finishes." },
  { url: "/images/image3.png", label: "Made for the people you love", sub: "Because the best gifts come from the heart." },
];

interface Props {
  heroImages: string[];
}

export default function HeroSlideshow({ heroImages }: Props) {
  const slides = FALLBACK_SLIDES.map((slide, i) => ({
    ...slide,
    url: heroImages[i] ?? slide.url,
  }));

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (paused) {
      clearTimer();
      return;
    }
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return clearTimer;
  }, [paused, slides.length]);

  return (
    <section
      className={styles.section}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Hero slideshow"
    >
      <div className={styles.inner}>

        {/* ── Left: text ── */}
        <div className={styles.textCol}>
          <p className={styles.eyebrow}>{APP_NAME}</p>
          <h1 className={styles.heading}>{slides[current].label}</h1>
          <p className={styles.sub}>{slides[current].sub}</p>

          <div className={styles.actions}>
            <Link href="/shop" className={styles.cta}>
              <i className="bx bx-shopping-bag" />
              Shop Now
            </Link>
          </div>

          {/* Dots only - left aligned */}
          <div className={styles.controls}>
            {slides.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <p className={styles.tagline}>{APP_TAGLINE}</p>
        </div>

        {/* ── Right: image ── */}
        <div className={styles.imageCol}>
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`${styles.imgWrap} ${i === current ? styles.imgActive : ""}`}
            >
              <Image
                src={slide.url}
                alt={slide.label}
                fill
                sizes="(max-width: 768px) 100vw, 55vw"
                className={styles.img}
                priority={i === 0}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}