// src/lib/cloudinary.ts
// Server-side only. Never import this in client components.

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

export interface UploadResult {
  url:      string;
  publicId: string;
}

// ── Upload ────────────────────────────────────────────────────────────────────

export async function uploadImage(
  dataUrl: string,
  folder: string = "nimki/products"
): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder,
    resource_type: "image",
    transformation: [
      { quality: "auto:good" },
      { fetch_format: "auto"  },
    ],
  });

  return {
    url:      result.secure_url,
    publicId: result.public_id,
  };
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}