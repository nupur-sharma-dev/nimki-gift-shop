// src/app/api/upload/route.ts
// Avatar uploads (folder=nimki/avatars): any authenticated user.
// All other folders (products, categories, etc.): ADMIN only.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession }          from "next-auth";
import { authOptions }               from "@/lib/auth";
import { uploadImage }               from "@/lib/cloudinary";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES  = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  // ── Parse form data ─────────────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file   = formData.get("file")   as File   | null;
  const folder = formData.get("folder") as string | null;
  const uploadFolder = folder ?? "nimki/products";

  // ── Auth guard ──────────────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  const isAvatarUpload = uploadFolder === "nimki/avatars";

  if (!session || (!isAvatarUpload && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // ── Validate ────────────────────────────────────────────────────────────────
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WEBP, and GIF images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File size must be under 5 MB" },
      { status: 400 }
    );
  }

  // ── Convert to base64 data URL ──────────────────────────────────────────────
  const buffer  = await file.arrayBuffer();
  const base64  = Buffer.from(buffer).toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  // ── Upload to Cloudinary ────────────────────────────────────────────────────
  try {
    const result = await uploadImage(dataUrl, uploadFolder);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[UPLOAD] Cloudinary error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}