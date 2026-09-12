import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { listApprovedReviews, submitDirectReview, submitReview } from "@/lib/repositories/reviews";
import { findUserByFirebaseUid } from "@/lib/repositories/users";

export async function GET() {
  try {
    return NextResponse.json(await listApprovedReviews());
  } catch {
    return NextResponse.json({ message: "Reviews are temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { token?: unknown; rating?: unknown; text?: unknown; displayName?: unknown; customerName?: unknown; consentToDisplayPhoto?: unknown };
    if (typeof body.rating !== "number" || !Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) return NextResponse.json({ message: "Please choose a rating from 1 to 5." }, { status: 400 });
    if (typeof body.text !== "string" || !body.text.trim() || body.text.trim().length > 2_000) return NextResponse.json({ message: "Please enter a review of up to 2,000 characters." }, { status: 400 });

    if (typeof body.token === "string" && body.token) {
      if (body.displayName !== undefined && (typeof body.displayName !== "string" || body.displayName.length > 120)) return NextResponse.json({ message: "Display name is too long." }, { status: 400 });
      const review = await submitReview({ token: body.token, rating: body.rating, text: body.text.trim(), displayName: typeof body.displayName === "string" ? body.displayName.trim() : undefined, consentToDisplayPhoto: body.consentToDisplayPhoto === true });
      return NextResponse.json({ review }, { status: 201 });
    }

    const session = await getSessionUser();
    const customerName = session?.name?.trim() || (typeof body.customerName === "string" ? body.customerName.trim() : "");
    if (!customerName || customerName.length > 120) return NextResponse.json({ message: "Please enter your name using 120 characters or fewer." }, { status: 400 });

    const user = session ? await findUserByFirebaseUid(session.uid) : null;
    const review = await submitDirectReview({ customerName, userId: user?.id, rating: body.rating, text: body.text.trim() });
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Review could not be submitted." }, { status: 400 });
  }
}
