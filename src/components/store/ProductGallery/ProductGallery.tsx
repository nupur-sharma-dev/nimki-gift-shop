"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./ProductGallery.module.css";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // If no images, use fallback
  const imageList = images.length > 0 ? images : ["/images/prod1.png"];
  const selectedImage = imageList[selectedIndex] || imageList[0];

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage}>
        <Image
          src={selectedImage}
          alt={`${productName} - image ${selectedIndex + 1}`}
          width={600}
          height={600}
          className={styles.image}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {imageList.length > 1 && (
        <div className={styles.thumbnails}>
          {imageList.map((image, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.thumbnail} ${
                index === selectedIndex ? styles.thumbnailActive : ""
              }`}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                width={80}
                height={80}
                className={styles.thumbnailImage}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}