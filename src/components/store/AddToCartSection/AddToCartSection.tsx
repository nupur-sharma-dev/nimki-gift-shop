"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import QuantitySelector from "@/components/store/QuantitySelector/QuantitySelector";
import styles from "./AddToCartSection.module.css";

interface AddToCartSectionProps {
  productId: string;
  stock: number;
}

export default function AddToCartSection({ productId, stock }: AddToCartSectionProps) {
  const { addItem, loading } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addItem(productId, quantity);
  };

  return (
    <div className={styles.actions}>
      <QuantitySelector stock={stock} onChange={setQuantity} />
      <button
        type="button"
        className={styles.addToCartBtn}
        onClick={handleAddToCart}
        disabled={loading}
      >
        <i className="bx bx-cart-add" />
        Add to Cart
      </button>
    </div>
  );
}