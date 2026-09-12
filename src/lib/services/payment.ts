import { createHmac, timingSafeEqual } from "node:crypto";
import "server-only";

import Razorpay from "razorpay";

export interface PaymentGateway {
  createOrder(input: { orderId: string; amount: number; receipt: string }): Promise<{ providerOrderId: string }>;
  verifyPayment(input: { providerOrderId: string; paymentId: string; signature: string }): Promise<boolean>;
  verifyWebhook(input: { rawBody: string; signature: string }): Promise<boolean>;
}

const MINIMUM_RAZORPAY_AMOUNT = 100;

export function paymentConfiguration() {
  return { configured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET), provider: "RAZORPAY" as const };
}

function razorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured.");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/** Creates a Razorpay order with an amount already expressed in paise. */
export async function createRazorpayOrder(input: { amount: number; currency: string; receipt: string }) {
  if (!Number.isSafeInteger(input.amount) || input.amount < MINIMUM_RAZORPAY_AMOUNT) {
    throw new Error("The payment amount must be at least ₹1.00.");
  }

  const order = await razorpayClient().orders.create({ amount: input.amount, currency: input.currency, receipt: input.receipt });
  return { orderId: order.id, amount: Number(order.amount), currency: order.currency };
}

/** Fetches provider-side details so a callback cannot substitute its own amount or order. */
export async function getRazorpayPayment(paymentId: string) {
  const payment = await razorpayClient().payments.fetch(paymentId);
  return {
    id: payment.id,
    providerOrderId: payment.order_id ?? "",
    amount: Number(payment.amount),
    status: payment.status,
  };
}

export function verifyRazorpaySignature(input: { providerOrderId: string; paymentId: string; signature: string }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("Razorpay is not configured.");
  const expected = createHmac("sha256", secret).update(`${input.providerOrderId}|${input.paymentId}`).digest("hex");
  return secureEqual(expected, input.signature);
}

export function verifyRazorpayWebhook(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("Razorpay webhook is not configured.");
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return secureEqual(expected, signature);
}

export function razorpayErrorStatus(error: unknown) {
  if (!error || typeof error !== "object" || !("statusCode" in error)) return null;
  const status = Number(error.statusCode);
  return Number.isInteger(status) ? status : null;
}

function secureEqual(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}
