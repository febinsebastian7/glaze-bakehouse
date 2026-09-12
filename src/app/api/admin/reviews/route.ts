import { NextResponse } from "next/server";

import { AuthorizationError, requireAdmin } from "@/lib/auth/session";
import { listReviewsForAdmin } from "@/lib/repositories/reviews";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await listReviewsForAdmin());
  } catch (error) {
    if (error instanceof AuthorizationError) return NextResponse.json({ message: error.message }, { status: error.status });
    return NextResponse.json({ message: "Reviews could not be loaded." }, { status: 500 });
  }
}
