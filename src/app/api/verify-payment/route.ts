import { NextResponse } from "next/server";

import { databaseConfigured } from "@/lib/db/prisma";
import { getOrderForProviderOrder, markRazorpayPaymentPaid } from "@/lib/repositories/orders";
import { getRazorpayPayment, verifyRazorpaySignature } from "@/lib/services/payment";
import { notifyBakeryOfConfirmedOrder } from "@/lib/services/orderNotifications";

interface VerificationPayload {
  razorpay_payment_id?: unknown;
  razorpay_order_id?: unknown;
  razorpay_signature?: unknown;
}

export async function POST(request: Request) {
  if (!databaseConfigured) {
    return NextResponse.json({ message: "Online checkout is temporarily unavailable. Please try again later." }, { status: 503 });
  }

  let body: VerificationPayload;
  try {
    body = await request.json() as VerificationPayload;
  } catch {
    return NextResponse.json({ message: "A valid payment verification payload is required." }, { status: 400 });
  }

  const paymentId = typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
  const orderId = typeof body.razorpay_order_id === "string" ? body.razorpay_order_id : "";
  const signature = typeof body.razorpay_signature === "string" ? body.razorpay_signature : "";
  if (!paymentId || !orderId || !signature) return NextResponse.json({ message: "Payment ID, order ID and signature are required." }, { status: 400 });

  try {
    if (!verifyRazorpaySignature({ providerOrderId: orderId, paymentId, signature })) {
      return NextResponse.json({ message: "Payment signature verification failed." }, { status: 400 });
    }
    const order = await getOrderForProviderOrder(orderId);
    if (!order) return NextResponse.json({ message: "This payment order could not be found." }, { status: 404 });
    const payment = await getRazorpayPayment(paymentId);
    if (payment.providerOrderId !== orderId || payment.amount !== order.total * 100 || payment.status !== "captured") {
      return NextResponse.json({ message: "Razorpay payment details could not be verified." }, { status: 400 });
    }
    const result = await markRazorpayPaymentPaid({ providerOrderId: orderId, paymentId, rawPayload: body, webhook: false });
    let notificationSent = false;
    if (result.newlyPaid) {
      try {
        await notifyBakeryOfConfirmedOrder(result.order);
        notificationSent = true;
      } catch {
        // A verified paid order is retained when a non-critical notification fails.
      }
    }
    return NextResponse.json({ success: true, trackingToken: result.order.trackingToken, notificationSent });
  } catch (error) {
    console.error("Could not verify Razorpay payment.", error);
    return NextResponse.json({ message: "We could not verify this payment. Please contact Glaze Bakehouse if you were charged." }, { status: 500 });
  }
}
