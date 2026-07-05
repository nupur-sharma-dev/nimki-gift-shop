"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ImageUpload from "@/components/ui/ImageUpload/ImageUpload";
import { ROUTES } from "@/constants";
import styles from "./CategoryForm.module.css";

interface CategoryFormValues {
  id?: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
}

interface CategoryFormProps {
  mode: "create" | "edit";
  initialValues?: CategoryFormValues;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const EMPTY_VALUES: CategoryFormValues = {
  name: "",
  slug: "",
  description: null,
  image: null,
  sortOrder: 0,
};

export default function CategoryForm({ mode, initialValues }: CategoryFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CategoryFormValues>(initialValues ?? EMPTY_VALUES);
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
        description:
          values.description && values.description.trim() !== ""
            ? values.description.trim()
            : null,
        image: values.image,
        sortOrder: Number(values.sortOrder) || 0,
      };

      const url =
        mode === "create" ? "/api/admin/categories" : `/api/admin/categories/${values.id}`;
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

      toast.success(mode === "create" ? "Category created." : "Category updated.");
      router.push(ROUTES.ADMIN_CATEGORIES);
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
          <label className={styles.label} htmlFor="name">Category Name</label>
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
        <label className={styles.label} htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          className={styles.textarea}
          rows={4}
          value={values.description ?? ""}
          onChange={(e) =>
            setValues((prev) => ({
              ...prev,
              description: e.target.value === "" ? null : e.target.value,
            }))
          }
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="sortOrder">Sort Order</label>
        <input
          id="sortOrder"
          type="number"
          min="0"
          step="1"
          className={styles.input}
          value={values.sortOrder}
          onChange={(e) => setValues((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))}
        />
        <p className={styles.hint}>Lower numbers appear first on the storefront.</p>
      </div>

      <ImageUpload
        value={values.image ? [values.image] : []}
        onChange={(urls) => setValues((prev) => ({ ...prev, image: urls[0] ?? null }))}
        max={1}
        folder="nimki/categories"
        label="Category Image"
      />

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => router.push(ROUTES.ADMIN_CATEGORIES)}
          disabled={submitting}
        >
          Cancel
        </button>
        <button type="submit" className={styles.submitBtn} disabled={submitting}>
          {submitting
            ? mode === "create" ? "Creating…" : "Saving…"
            : mode === "create" ? "Create Category" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}