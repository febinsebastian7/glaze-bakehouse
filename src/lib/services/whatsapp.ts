import type { OrderRecord, OrderStatus } from "@/types/product";

export interface WhatsAppNotifier {
  notifyBakeryOfPaidOrder(order: OrderRecord): Promise<void>;
  sendOrderStatusUpdate(order: OrderRecord, status: OrderStatus): Promise<void>;
  sendReviewInvitation(order: OrderRecord, reviewUrl: string): Promise<void>;
}

export const whatsappTemplates: Partial<Record<OrderStatus, string>> = {
  ORDER_CONFIRMED: "Hi! We've received your order and will begin preparing it shortly. 🤍",
  BAKING: "Your cake is currently being prepared. We'll keep you updated! 🎂",
  PACKED: "Your cake has been freshly packed and is ready to go. ✨",
  OUT_FOR_DELIVERY: "Your order is on its way! 🚚",
  READY_FOR_PICKUP: "Your cake is ready for pickup at Glaze Bakehouse. 🤍",
};

export function whatsappConfiguration() {
  return {
    configured: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_BAKERY_RECIPIENT && process.env.WHATSAPP_ORDER_TEMPLATE_NAME),
    provider: "WHATSAPP_BUSINESS",
  };
}

export async function sendWhatsAppText(input: { to: string; body: string }) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) throw new Error("WhatsApp Business API is not configured.");
  const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ messaging_product: "whatsapp", to: input.to, type: "text", text: { body: input.body } }) });
  if (!response.ok) throw new Error("WhatsApp Business API could not send this message.");
}

async function sendWhatsAppTemplate(input: { to: string; name: string; parameters: string[] }) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) throw new Error("WhatsApp Business API is not configured.");
  const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: input.to,
      type: "template",
      template: {
        name: input.name,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE ?? "en" },
        components: [{ type: "body", parameters: input.parameters.map((text) => ({ type: "text", text })) }],
      },
    }),
  });
  if (!response.ok) throw new Error("WhatsApp Business API could not send the approved template.");
}

function orderItems(order: OrderRecord) {
  return order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ");
}

export async function notifyBakeryOfPaidOrder(order: OrderRecord) {
  const recipient = process.env.WHATSAPP_BAKERY_RECIPIENT;
  const template = process.env.WHATSAPP_ORDER_TEMPLATE_NAME;
  if (!recipient || !template) throw new Error("The bakery order-notification template is not configured.");
  await sendWhatsAppTemplate({
    to: recipient,
    name: template,
    parameters: [order.orderNumber, order.customer.fullName, order.customer.whatsapp, orderItems(order), `₹${order.total.toLocaleString("en-IN")}`, `${order.delivery.deliveryDate} ${order.delivery.deliveryTime}`, order.delivery.fulfilment === "PICKUP" ? "Pickup" : [order.delivery.address, order.delivery.area, order.delivery.pincode].filter(Boolean).join(", "), order.specialNotes || "None"],
  });
}

export async function sendCustomerOrderStatusUpdate(order: OrderRecord, status: OrderStatus) {
  const template = process.env.WHATSAPP_STATUS_TEMPLATE_NAME;
  if (!template) throw new Error("The customer status-update template is not configured.");
  await sendWhatsAppTemplate({ to: order.customer.whatsapp, name: template, parameters: [order.orderNumber, status.replaceAll("_", " ")] });
}

export async function sendCustomerReviewInvitation(order: OrderRecord, reviewUrl: string) {
  const template = process.env.WHATSAPP_REVIEW_TEMPLATE_NAME;
  if (!template) throw new Error("The review-invitation template is not configured.");
  await sendWhatsAppTemplate({ to: order.customer.whatsapp, name: template, parameters: [order.orderNumber, reviewUrl] });
}
