import { NextResponse } from "next/server";

import { validateProductInput } from "@/lib/commerce/productInput";
import { AuthorizationError, requireAdmin } from "@/lib/auth/session";
import { databaseConfigured, isDatabaseConnectionError } from "@/lib/db/prisma";
import { createProduct, listProducts } from "@/lib/repositories/products";

function errorResponse(error: unknown) {
  if (error instanceof AuthorizationError) return NextResponse.json({ message: error.message }, { status: error.status });
  if (isDatabaseConnectionError(error)) {
    console.error("Admin product database connection failed.", error);
    return NextResponse.json({ message: "The database is temporarily unavailable. Please try again in a moment." }, { status: 503 });
  }
  return NextResponse.json({ message: error instanceof Error ? error.message : "Product request could not be completed." }, { status: 400 });
}

export async function GET() {
  try {
    await requireAdmin();
    if (!databaseConfigured) return NextResponse.json({ message: "Product management needs the production database before changes can be saved." }, { status: 503 });
    return NextResponse.json(await listProducts());
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    if (!databaseConfigured) return NextResponse.json({ message: "Product management needs the production database before changes can be saved." }, { status: 503 });
    return NextResponse.json(await createProduct(validateProductInput(await request.json())), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
