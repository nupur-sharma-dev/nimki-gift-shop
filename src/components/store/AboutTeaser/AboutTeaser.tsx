import Link from "next/link";
import Image from "next/image";
import styles from "./AboutTeaser.module.css";

export default function AboutTeaser() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {/* Text side */}
        <div className={styles.textCol}>
          <p className={styles.eyebrow}>Our Story</p>
          <h2 className={styles.heading}>
            Gifts made with hands,<br />given from the heart
          </h2>
          <p className={styles.body}>
            Nimki Gift Shop was born from a simple belief — that a truly
            meaningful gift is one that carries the maker&apos;s touch. Every
            piece in our collection is handcrafted by skilled artisans across
            Nepal, using traditions passed down through generations.
          </p>
          <Link href="/about" className={styles.link}>
            Read our story
            <i className="bx bx-right-arrow-alt" />
          </Link>
        </div>

        {/* Images side */}
        <div className={styles.imageCol}>
          <div className={styles.imageGrid}>
            <div className={`${styles.imgWrap} ${styles.imgLarge}`}>
              <Image
                src="/images/prod1.png"
                alt="Handcrafted gift product"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className={styles.img}
              />
            </div>
            <div className={styles.imgStack}>
              <div className={`${styles.imgWrap} ${styles.imgSmall}`}>
                <Image
                  src="/images/prod2.jpg"
                  alt="Handcrafted gift product"
                  fill
                  sizes="(max-width: 768px) 50vw, 180px"
                  className={styles.img}
                />
              </div>
              <div className={`${styles.imgWrap} ${styles.imgSmall}`}>
                <Image
                  src="/images/prod3.jpg"
                  alt="Handcrafted gift product"
                  fill
                  sizes="(max-width: 768px) 50vw, 180px"
                  className={styles.img}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}