import "server-only";

import { createHash } from "node:crypto";

export type CloudinaryCollection = "cakes" | "desserts" | "fresh-today" | "reviews" | "founder" | "custom-cakes";
type CloudinaryUpload = { secure_url: string; public_id: string };

function getConfiguration() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary is not configured.");
  return { cloudName, apiKey, apiSecret };
}

function signature(parameters: Record<string, string>, apiSecret: string) {
  const value = Object.entries(parameters).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${key}=${item}`).join("&");
  return createHash("sha1").update(`${value}${apiSecret}`).digest("hex");
}

export function cloudinaryConfiguration() {
  return { configured: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) };
}

export async function uploadCloudinaryImage(file: File, collection: CloudinaryCollection) {
  if (!file.type.startsWith("image/")) throw new Error("Please select an image file.");
  const { cloudName, apiKey, apiSecret } = getConfiguration();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = `glaze-bakehouse/${collection}`;
  const form = new FormData();
  form.set("file", file);
  form.set("api_key", apiKey);
  form.set("timestamp", timestamp);
  form.set("folder", folder);
  form.set("signature", signature({ folder, timestamp }, apiSecret));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form });
  if (!response.ok) throw new Error("Cloudinary could not upload this image.");
  const result = await response.json() as CloudinaryUpload;
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteCloudinaryImage(publicId: string) {
  const { cloudName, apiKey, apiSecret } = getConfiguration();
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const form = new FormData();
  form.set("public_id", publicId);
  form.set("api_key", apiKey);
  form.set("timestamp", timestamp);
  form.set("signature", signature({ public_id: publicId, timestamp }, apiSecret));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: "POST", body: form });
  if (!response.ok) throw new Error("Cloudinary could not remove this image.");
}
