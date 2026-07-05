"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ImageUpload from "@/components/ui/ImageUpload/ImageUpload";
import { ROUTES } from "@/constants";
import styles from "./ProductForm.module.css";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

interface ProductFormValues {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  sku: string | null;
  images: string[];
  categoryId: string;
  isFeatured: boolean;
}

interface ProductFormProps {
  mode: "create" | "edit";
  categories: CategoryOption[];
  initialValues?: ProductFormValues;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const EMPTY_VALUES: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  comparePrice: null,
  stock: 0,
  sku: null,
  images: [],
  categoryId: "",
  isFeatured: false,
};

export default function ProductForm({ mode, categories, initialValues }: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(initialValues ?? EMPTY_VALUES);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (name: string) => {
    setValues((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),
    }));
  };

  const handleSlugChange = (slug: string) => {
    setSlugTouched(true);
    setValues((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const payload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        comparePrice:
          values.comparePrice === null || Number.isNaN(values.comparePrice)
            ? null
            : Number(values.comparePrice),
        stock: Number(values.stock),
        sku: values.sku && values.sku.trim() !== "" ? values.sku.trim() : null,
        images: values.images,
        categoryId: values.categoryId,
        isFeatured: values.isFeatured,
      };

      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${values.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        setFormError(data.error || "Something went wrong.");
        toast.error(data.error || "Something went wrong.");
        return;
      }

      toast.success(mode === "create" ? "Product created." : "Product updated.");
      router.push(ROUTES.ADMIN_PRODUCTS);
      router.refresh();
    } catch {
      setFormError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {formError && <div className={styles.errorBanner}>{formError}</div>}

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">Product Name</label>
          <input
            id="name"
            type="text"
            className={styles.input}
            value={values.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="slug">Slug</label>
          <input
            id="slug"
            type="text"
            className={styles.input}
            value={values.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="description">Description</label>
        <textarea
          id="description"
          className={styles.textarea}
          rows={5}
          value={values.description}
          onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
          required
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="price">Price (Rs.)</label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            className={styles.input}
            value={values.price}
            onChange={(e) => setValues((prev) => ({ ...prev, price: Number(e.target.value) }))}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="comparePrice">Compare-at Price (optional)</label>
          <input
            id="comparePrice"
            type="number"
            min="0"
            step="0.01"
            className={styles.input}
            value={values.comparePrice ?? ""}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                comparePrice: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
          />
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="stock">Stock</label>
          <input
            id="stock"
            type="number"
            min="0"
            step="1"
            className={styles.input}
            value={values.stock}
            onChange={(e) => setValues((prev) => ({ ...prev, stock: Number(e.target.value) }))}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="sku">SKU (optional)</label>
          <input
            id="sku"
            type="text"
            className={styles.input}
            value={values.sku ?? ""}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, sku: e.target.value === "" ? null : e.target.value }))
            }
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="categoryId">Category</label>
        <select
          id="categoryId"
          className={styles.select}
          value={values.categoryId}
          onChange={(e) => setValues((prev) => ({ ...prev, categoryId: e.target.value }))}
          required
        >
          <option value="" disabled>Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.productCount})
            </option>
          ))}
        </select>
      </div>

      <div className={styles.checkboxField}>
        <input
          id="isFeatured"
          type="checkbox"
          checked={values.isFeatured}
          onChange={(e) => setValues((prev) => ({ ...prev, isFeatured: e.target.checked }))}
        />
        <label htmlFor="isFeatured">Feature this product on the homepage</label>
      </div>

      <ImageUpload
        value={values.images}
        onChange={(urls) => setValues((prev) => ({ ...prev, images: urls }))}
        max={5}
        folder="nimki/products"
        label="Product Images"
      />

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => router.push(ROUTES.ADMIN_PRODUCTS)}
          disabled={submitting}
        >
          Cancel
        </button>
        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          {submitting
            ? mode === "create" ? "Creating…" : "Saving…"
            : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}