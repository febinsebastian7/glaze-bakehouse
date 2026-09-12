import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { validateOrderItems } from "@/lib/commerce/validateOrder";
import { databaseConfigured } from "@/lib/db/prisma";
import { createPendingOrder, markPaymentFailed, setProviderOrder } from "@/lib/repositories/orders";
import { findUserByFirebaseUid } from "@/lib/repositories/users";
import { createRazorpayOrder, paymentConfiguration, razorpayErrorStatus } from "@/lib/services/payment";
import { orderNotificationConfiguration } from "@/lib/services/orderNotifications";

export async function POST(request: Request) {
  if (!databaseConfigured) {
    return NextResponse.json({ message: "Online checkout is temporarily unavailable. Please try again later." }, { status: 503 });
  }

  try {
    if (!paymentConfiguration().configured) {
      return NextResponse.json({ message: "Online payment is not enabled yet. No payment or order has been created." }, { status: 503 });
    }
    if (!orderNotificationConfiguration().configured) {
      return NextResponse.json({ message: "Online checkout is temporarily unavailable while bakery order notifications are being configured." }, { status: 503 });
    }

    const body = await request.json() as { items?: unknown; delivery?: Record<string, unknown>; notes?: unknown };
    const validatedOrder = await validateOrderItems(Array.isArray(body.items) ? body.items : [], body.delivery ?? {});
    const amount = validatedOrder.total * 100;
    if (!Number.isSafeInteger(amount) || amount < 100) {
      return NextResponse.json({ message: "The payment amount must be at least ₹1.00." }, { status: 400 });
    }

    const sessionUser = await getSessionUser();
    const user = sessionUser ? await findUserByFirebaseUid(sessionUser.uid) : null;
    const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 1000) : "";
    const pendingOrder = await createPendingOrder(validatedOrder, notes, user?.id);
    try {
      const providerOrder = await createRazorpayOrder({ amount, currency: "INR", receipt: pendingOrder.id });
      await setProviderOrder(pendingOrder.id, providerOrder.orderId);
      // Razorpay's key ID is public, but returning the server's configured value
      // keeps the checkout tied to the same account that created this order. This
      // also avoids a stale build-time browser variable selecting another account.
      return NextResponse.json({
        key_id: process.env.RAZORPAY_KEY_ID,
        order_id: providerOrder.orderId,
        amount: providerOrder.amount,
        currency: providerOrder.currency,
        trackingToken: pendingOrder.trackingToken,
      });
    } catch (error) {
      await markPaymentFailed(pendingOrder.id);
      throw error;
    }
  } catch (error) {
    console.error("Could not prepare Razorpay checkout.", error);
    const status = razorpayErrorStatus(error);
    if (status === 401) return NextResponse.json({ message: "Razorpay authentication failed. Please check the server credentials." }, { status: 401 });
    if (status) return NextResponse.json({ message: "Razorpay could not create the payment order. Please try again." }, { status: 502 });
    return NextResponse.json({ message: error instanceof Error ? error.message : "We could not prepare your payment. Please review your details and try again." }, { status: 400 });
  }
}
