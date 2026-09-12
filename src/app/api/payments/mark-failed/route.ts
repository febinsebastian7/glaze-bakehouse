import { NextResponse } from "next/server";

import { databaseConfigured } from "@/lib/db/prisma";
import { markPaymentFailedByTrackingToken } from "@/lib/repositories/orders";

export async function POST(request: Request) {
  if (!databaseConfigured) return NextResponse.json({ message: "Payment processing is temporarily unavailable." }, { status: 503 });

  try {
    const body = await request.json() as { trackingToken?: unknown };
    const trackingToken = typeof body.trackingToken === "string" ? body.trackingToken.trim() : "";
    if (!trackingToken || trackingToken.length > 200) return NextResponse.json({ message: "A valid checkout reference is required." }, { status: 400 });
    await markPaymentFailedByTrackingToken(trackingToken);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Could not record failed Razorpay checkout.", error);
    return NextResponse.json({ message: "We could not update this payment attempt." }, { status: 500 });
  }
}
