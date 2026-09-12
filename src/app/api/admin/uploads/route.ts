import { NextResponse } from "next/server";

import { AuthorizationError, requireAdmin } from "@/lib/auth/session";
import { type CloudinaryCollection, uploadCloudinaryImage } from "@/lib/services/cloudinary";

export const runtime = "nodejs";

const collections = new Set<CloudinaryCollection>(["cakes", "desserts", "fresh-today", "reviews", "founder", "custom-cakes"]);
const permittedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const form = await request.formData();
    const file = form.get("file");
    const collection = form.get("collection");
    if (!(file instanceof File) || typeof collection !== "string" || !collections.has(collection as CloudinaryCollection)) {
      return NextResponse.json({ message: "An image file and supported collection are required." }, { status: 400 });
    }
    if (!permittedImageTypes.has(file.type)) return NextResponse.json({ message: "Please upload a JPG, PNG, WebP or AVIF image." }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return NextResponse.json({ message: "Images must be smaller than 8 MB." }, { status: 400 });
    const uploaded = await uploadCloudinaryImage(file, collection as CloudinaryCollection);
    return NextResponse.json(uploaded, { status: 201 });
  } catch (error) {
    if (error instanceof AuthorizationError) return NextResponse.json({ message: error.message }, { status: error.status });
    return NextResponse.json({ message: error instanceof Error ? error.message : "Image upload could not be completed." }, { status: 503 });
  }
}
