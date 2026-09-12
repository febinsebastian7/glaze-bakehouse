import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { databaseConfigured, isDatabaseConnectionError } from "@/lib/db/prisma";
import { createCustomCakeRequest } from "@/lib/repositories/customCakeRequests";
import { findUserByFirebaseUid } from "@/lib/repositories/users";
import { notifyBakeryOfCustomCakeRequest, orderNotificationConfiguration } from "@/lib/services/orderNotifications";

function optionalText(value: unknown, maximum = 1_000) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.trim().length > maximum) throw new Error("One of the request details is invalid.");
  return value.trim();
}

export async function POST(request: Request) {
  if (!databaseConfigured) return NextResponse.json({ message: "Custom cake requests are temporarily unavailable. Please try again later." }, { status: 503 });
  if (!orderNotificationConfiguration().configured) {
    return NextResponse.json({ message: "Custom cake requests are temporarily unavailable while the bakery contact service is being configured." }, { status: 503 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const name = optionalText(body.name, 120);
    const phone = optionalText(body.phone, 30);
    if (!name || !phone || !/^[+()\-\s\d]{7,30}$/.test(phone)) return NextResponse.json({ message: "Please add your name and a valid WhatsApp number." }, { status: 400 });
    const email = optionalText(body.email, 254);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
    const date = optionalText(body.preferredDate, 10);
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ message: "Please choose a valid preferred date." }, { status: 400 });
    const referenceImageUrl = optionalText(body.referenceImageUrl, 2_000);
    if (referenceImageUrl) {
      try { new URL(referenceImageUrl); } catch { return NextResponse.json({ message: "Please enter a valid reference image URL." }, { status: 400 }); }
    }
    const budget = body.budget === "" || body.budget === undefined ? null : Number(body.budget);
    if (budget !== null && (!Number.isSafeInteger(budget) || budget < 0 || budget > 1_000_000)) return NextResponse.json({ message: "Please enter a valid budget." }, { status: 400 });
    const session = await getSessionUser();
    const user = session ? await findUserByFirebaseUid(session.uid) : null;
    const customCakeRequest = await createCustomCakeRequest({
      userId: user?.id,
      name,
      phone,
      email,
      celebration: optionalText(body.celebration, 120),
      preferredDate: date ? new Date(`${date}T12:00:00`) : null,
      cakeSize: optionalText(body.cakeSize, 120),
      flavour: optionalText(body.flavour, 120),
      theme: optionalText(body.theme, 500),
      referenceImageUrl,
      messageOnCake: optionalText(body.messageOnCake, 250),
      budget,
      additionalRequirements: optionalText(body.additionalRequirements, 2_000),
    });
    try {
      await notifyBakeryOfCustomCakeRequest(customCakeRequest);
    } catch (error) {
      console.error("Custom cake request was saved but Formspree delivery failed.", error);
      return NextResponse.json({ id: customCakeRequest.id, message: "Your request was saved, but we could not notify the bakery right now. Please call Glaze Bakehouse to confirm it was received." }, { status: 502 });
    }
    return NextResponse.json({ id: customCakeRequest.id, message: "Your custom cake request has been received." }, { status: 201 });
  } catch (error) {
    if (isDatabaseConnectionError(error)) return NextResponse.json({ message: "Custom cake requests are temporarily unavailable. Please try again in a moment." }, { status: 503 });
    return NextResponse.json({ message: error instanceof Error ? error.message : "Custom cake request could not be saved." }, { status: 400 });
  }
}
