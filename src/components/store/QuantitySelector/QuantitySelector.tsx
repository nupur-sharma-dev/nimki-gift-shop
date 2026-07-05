"use client";

import { useState } from "react";
import { MAX_CART_QUANTITY } from "@/constants";
import styles from "./QuantitySelector.module.css";

interface QuantitySelectorProps {
  stock: number;
  initialQuantity?: number;
  onChange?: (quantity: number) => void;
}

export default function QuantitySelector({
  stock,
  initialQuantity = 1,
  onChange,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(
    Math.min(initialQuantity, stock, MAX_CART_QUANTITY)
  );

  const maxAllowed = Math.min(stock, MAX_CART_QUANTITY);

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onChange?.(newQuantity);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxAllowed) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onChange?.(newQuantity);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= maxAllowed) {
      setQuantity(value);
      onChange?.(value);
    }
  };

  const handleBlur = () => {
    if (quantity < 1) {
      setQuantity(1);
      onChange?.(1);
    }
  };

  return (
    <div className={styles.selector}>
      <button
        type="button"
        className={styles.btn}
        onClick={handleDecrease}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
      >
        <i className="bx bx-minus" />
      </button>

      <input
        type="number"
        className={styles.input}
        value={quantity}
        onChange={handleInputChange}
        onBlur={handleBlur}
        min={1}
        max={maxAllowed}
        aria-label="Quantity"
      />

      <button
        type="button"
        className={styles.btn}
        onClick={handleIncrease}
        disabled={quantity >= maxAllowed}
        aria-label="Increase quantity"
      >
        <i className="bx bx-plus" />
      </button>
    </div>
  );
}