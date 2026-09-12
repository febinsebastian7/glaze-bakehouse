import { NextResponse } from "next/server";
import { CustomCakeStatus } from "@prisma/client";

import { AuthorizationError, requireAdmin } from "@/lib/auth/session";
import { databaseConfigured, isDatabaseConnectionError } from "@/lib/db/prisma";
import { listCustomCakeRequestsForAdmin, updateCustomCakeRequestStatus } from "@/lib/repositories/customCakeRequests";

const statuses = new Set<CustomCakeStatus>(["NEW", "REVIEWING", "QUOTED", "CONFIRMED", "DECLINED", "COMPLETED"]);

function errorResponse(error: unknown) {
  if (error instanceof AuthorizationError) return NextResponse.json({ message: error.message }, { status: error.status });
  if (isDatabaseConnectionError(error)) return NextResponse.json({ message: "The database is temporarily unavailable. Please try again in a moment." }, { status: 503 });
  return NextResponse.json({ message: error instanceof Error ? error.message : "Custom cake requests could not be completed." }, { status: 400 });
}

export async function GET() {
  try {
    await requireAdmin();
    if (!databaseConfigured) return NextResponse.json({ message: "Custom cake request management needs the production database." }, { status: 503 });
    return NextResponse.json(await listCustomCakeRequestsForAdmin());
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    if (!databaseConfigured) return NextResponse.json({ message: "Custom cake request management needs the production database." }, { status: 503 });
    const body = await request.json() as { id?: unknown; status?: unknown };
    if (typeof body.id !== "string" || typeof body.status !== "string" || !statuses.has(body.status as CustomCakeStatus)) {
      return NextResponse.json({ message: "A valid custom cake request and status are required." }, { status: 400 });
    }
    return NextResponse.json(await updateCustomCakeRequestStatus(body.id, body.status as CustomCakeStatus));
  } catch (error) {
    return errorResponse(error);
  }
}
