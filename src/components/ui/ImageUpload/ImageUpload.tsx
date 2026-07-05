// src/components/ui/ImageUpload/ImageUpload.tsx
"use client";

import { useRef, useState, useCallback } from "react";
import Image                             from "next/image";
import toast                             from "react-hot-toast";
import styles                            from "./ImageUpload.module.css";

interface Props {
  value:    string[];
  onChange: (urls: string[]) => void;
  max?:     number;
  folder?:  string;
  label?:   string;
}

interface UploadingItem {
  id:       string;
  filename: string;
}

export default function ImageUpload({
  value    = [],
  onChange,
  max      = 5,
  folder   = "nimki/products",
  label    = "Upload Images",
}: Props) {
  const inputRef                          = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]         = useState<UploadingItem[]>([]);
  const [isDragging, setIsDragging]       = useState(false);

  const canUploadMore = value.length + uploading.length < max;

  // ── Upload a single file ───────────────────────────────────────────────────

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      const id  = crypto.randomUUID();
      const item: UploadingItem = { id, filename: file.name };

      setUploading((prev) => [...prev, item]);

      try {
        const fd = new FormData();
        fd.append("file",   file);
        fd.append("folder", folder);

        const res  = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error ?? "Upload failed");
          return null;
        }

        return data.url as string;
      } catch {
        toast.error("Upload failed. Check your connection.");
        return null;
      } finally {
        setUploading((prev) => prev.filter((u) => u.id !== id));
      }
    },
    [folder]
  );

  // ── Handle file selection ──────────────────────────────────────────────────

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr      = Array.from(files);
      const slots    = max - value.length - uploading.length;
      const toUpload = arr.slice(0, slots);

      if (arr.length > slots) {
        toast.error(`You can only upload ${max} image${max !== 1 ? "s" : ""} total.`);
      }

      const results = await Promise.all(toUpload.map(uploadFile));
      const urls    = results.filter(Boolean) as string[];

      if (urls.length > 0) {
        onChange([...value, ...urls]);
      }
    },
    [max, value, uploading.length, uploadFile, onChange]
  );

  // ── Remove an image ────────────────────────────────────────────────────────

  const handleRemove = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

  // ── Drag and drop ──────────────────────────────────────────────────────────

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true);  };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (canUploadMore) handleFiles(e.dataTransfer.files);
  };

  return (
    <div className={styles.wrapper}>
      {label && <p className={styles.label}>{label}</p>}

      {/* Preview grid */}
      {(value.length > 0 || uploading.length > 0) && (
        <div className={styles.grid}>
          {value.map((url) => (
            <div key={url} className={styles.previewItem}>
              <Image
                src={url}
                alt="Uploaded image"
                fill
                sizes="120px"
                className={styles.previewImg}
              />
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => handleRemove(url)}
                aria-label="Remove image"
              >
                <i className="bx bx-x" />
              </button>
            </div>
          ))}

          {uploading.map((item) => (
            <div key={item.id} className={`${styles.previewItem} ${styles.uploading}`}>
              <div className={styles.shimmer} />
              <span className={styles.uploadingLabel}>Uploading…</span>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {canUploadMore && (
        <div
          className={`${styles.dropzone} ${isDragging ? styles.dragging : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          aria-label="Upload image"
        >
          <i className={`bx bx-cloud-upload ${styles.uploadIcon}`} />
          <p className={styles.dropText}>
            Drag &amp; drop or <span className={styles.browse}>browse</span>
          </p>
          <p className={styles.dropHint}>
            JPEG, PNG, WEBP · Max 5 MB · {max - value.length} slot{max - value.length !== 1 ? "s" : ""} remaining
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple={max > 1}
            className={styles.hiddenInput}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>
      )}
    </div>
  );
}