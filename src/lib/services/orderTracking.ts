import "server-only";

import type { OrderRecord } from "@/types/product";

function recipientNumber() {
  const value = process.env.WHATSAPP_BAKERY_RECIPIENT?.replace(/\D/g, "") ?? "";
  return value.length >= 7 && value.length <= 15 ? value : undefined;
}

/**
 * The bakery recipient is configured server-side. The number appears only in a
 * deliberate customer click-through URL, where it is required by WhatsApp.
 */
export function orderTrackingWhatsAppLink(order: OrderRecord) {
  const recipient = recipientNumber();
  if (!recipient) return undefined;

  const products = order.items.map((item) => item.productName).join(", ");
  const message = [
    "Hello Glaze Bakehouse!",
    `I’m ${order.customer.fullName} and would like to track my order ${order.orderNumber}.`,
    `Order: ${products || "Bakery order"}.`,
    `Private order reference: ${order.trackingToken ?? order.orderNumber}.`,
  ].join("\n");

  return `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`;
}
