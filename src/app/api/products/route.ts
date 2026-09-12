import { NextResponse } from "next/server";

import { seedProducts } from "@/data/products";
import { databaseConfigured } from "@/lib/db/prisma";
import { listPublicProducts } from "@/lib/repositories/products";

export async function GET() {
  // Retain the approved catalogue when a local preview has no database yet.
  // Once DATABASE_URL is configured, the database is always the public source of truth.
  if (!databaseConfigured) return NextResponse.json(seedProducts);

  try {
    return NextResponse.json(await listPublicProducts());
  } catch {
    return NextResponse.json({ message: "The catalogue is temporarily unavailable." }, { status: 503 });
  }
}
