import { NextResponse } from "next/server";

import { databaseConfigured } from "@/lib/db/prisma";
import { getOrderForProviderOrder, markRazorpayPaymentPaid } from "@/lib/repositories/orders";
import { verifyRazorpayWebhook } from "@/lib/services/payment";
import { notifyBakeryOfConfirmedOrder } from "@/lib/services/orderNotifications";

export async function POST(request: Request) {
  try {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) return NextResponse.json({ message: "Razorpay webhook is not configured." }, { status: 503 });
    if (!databaseConfigured) return NextResponse.json({ message: "Payment processing is temporarily unavailable." }, { status: 503 });

    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature || !verifyRazorpayWebhook(rawBody, signature)) return NextResponse.json({ message: "Invalid Razorpay webhook signature." }, { status: 400 });

    let payload: { event?: unknown; payload?: { payment?: { entity?: { id?: unknown; order_id?: unknown; amount?: unknown; status?: unknown } } } };
    try {
      payload = JSON.parse(rawBody) as typeof payload;
    } catch {
      return NextResponse.json({ message: "Invalid Razorpay webhook payload." }, { status: 400 });
    }
    if (payload.event !== "payment.captured") return NextResponse.json({ received: true, ignored: true });

    const payment = payload.payload?.payment?.entity;
    const providerOrderId = typeof payment?.order_id === "string" ? payment.order_id : "";
    const paymentId = typeof payment?.id === "string" ? payment.id : "";
    const amount = typeof payment?.amount === "number" ? payment.amount : 0;
    if (!providerOrderId || !paymentId || payment?.status !== "captured") return NextResponse.json({ message: "Webhook does not contain a captured payment." }, { status: 400 });

    const order = await getOrderForProviderOrder(providerOrderId);
    if (!order || amount !== order.total * 100) return NextResponse.json({ message: "Webhook amount or order does not match." }, { status: 400 });
    const result = await markRazorpayPaymentPaid({ providerOrderId, paymentId, rawPayload: payload, webhook: true });
    if (result.newlyPaid) {
      try {
        await notifyBakeryOfConfirmedOrder(result.order);
      } catch (error) {
        // The verified database order is authoritative. Keep Formspree details server-side.
        console.error("Could not deliver a verified Razorpay order to Formspree.", error);
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Could not process Razorpay webhook.", error);
    return NextResponse.json({ message: "Payment processing could not be completed." }, { status: 500 });
  }
}
