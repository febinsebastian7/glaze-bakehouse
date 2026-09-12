import "server-only";

import type { OrderRecord } from "@/types/product";

export interface ConfirmedOrderNotificationService {
  readonly provider: string;
  sendConfirmedOrder(order: OrderRecord): Promise<void>;
}

type FormspreeSubmission = Record<string, string>;

export type CustomCakeRequestNotification = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  celebration?: string;
  preferredDate?: string;
  cakeSize?: string;
  flavour?: string;
  theme?: string;
  referenceImageUrl?: string;
  messageOnCake?: string;
  budget?: number;
  additionalRequirements?: string;
  createdAt: string;
};

const formspreeHosts = new Set(["formspree.io", "www.formspree.io"]);

function orderNotificationProvider() {
  return (process.env.ORDER_NOTIFICATION_PROVIDER ?? "FORMSPREE").trim().toUpperCase();
}

function formspreeEndpoint() {
  const value = process.env.FORMSPREE_ORDER_ENDPOINT?.trim();
  if (!value) throw new Error("Formspree order notifications are not configured.");

  let endpoint: URL;
  try {
    endpoint = new URL(value);
  } catch {
    throw new Error("The Formspree order endpoint is not a valid URL.");
  }

  if (endpoint.protocol !== "https:" || !formspreeHosts.has(endpoint.hostname) || !endpoint.pathname.startsWith("/f/")) {
    throw new Error("The Formspree order endpoint must be an HTTPS Formspree form URL.");
  }
  return endpoint;
}

function money(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function orderDateTime(order: OrderRecord) {
  const createdAt = new Date(order.createdAt);
  if (Number.isNaN(createdAt.valueOf())) return order.createdAt;

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(createdAt);
}

function deliveryAddress(order: OrderRecord) {
  if (order.delivery.fulfilment === "PICKUP") return "Pickup from Glaze Bakehouse";

  return [order.delivery.address, order.delivery.area, order.delivery.pincode]
    .filter(Boolean)
    .join(", ");
}

function itemCustomization(order: OrderRecord) {
  const items = order.items.flatMap((item) => {
    const selected = Object.entries(item.selectedOptions ?? {})
      .filter(([, value]) => Boolean(value?.trim()))
      .map(([name, value]) => `${name.replaceAll("_", " ")}: ${value}`);
    return selected.length ? [`${item.productName}: ${selected.join("; ")}`] : [];
  });
  if (order.specialNotes?.trim()) items.push(`Order note: ${order.specialNotes.trim()}`);
  return items.length ? items.join("\n") : "None";
}

function orderedProducts(order: OrderRecord) {
  return order.items.map((item) => `${item.productName} × ${item.quantity} — ${money(item.unitPrice * item.quantity)}`).join("\n");
}

function formspreeSubmission(order: OrderRecord): FormspreeSubmission {
  const address = deliveryAddress(order);
  const products = orderedProducts(order);
  const customizations = itemCustomization(order);
  const createdAt = orderDateTime(order);

  return {
    _subject: `New paid Glaze order — ${order.orderNumber}`,
    order_reference: order.orderNumber,
    order_id: order.id,
    customer_name: order.customer.fullName,
    customer_phone: order.customer.whatsapp,
    customer_email: order.customer.email || "Not provided",
    email: order.customer.email || "",
    fulfilment: order.delivery.fulfilment === "PICKUP" ? "Pickup" : "Delivery",
    delivery_address: address || "Not provided",
    delivery_details: [
      `Date: ${order.delivery.deliveryDate || "To be confirmed"}`,
      `Time: ${order.delivery.deliveryTime || "To be confirmed"}`,
      `Instructions: ${order.delivery.deliveryInstructions || "None"}`,
    ].join("\n"),
    ordered_products: products,
    quantities: order.items.map((item) => `${item.productName}: ${item.quantity}`).join("\n"),
    customization_details: customizations,
    subtotal: money(order.subtotal),
    delivery_charge: money(order.deliveryCharge),
    total_amount: money(order.total),
    payment_status: order.paymentStatus,
    order_date_time: createdAt,
    order_created_at_iso: order.createdAt,
    message: [
      `Order reference: ${order.orderNumber}`,
      `Customer: ${order.customer.fullName}`,
      `Phone: ${order.customer.whatsapp}`,
      `Email: ${order.customer.email || "Not provided"}`,
      `Fulfilment: ${order.delivery.fulfilment === "PICKUP" ? "Pickup" : "Delivery"}`,
      `Address: ${address || "Not provided"}`,
      `Delivery date/time: ${order.delivery.deliveryDate || "To be confirmed"} ${order.delivery.deliveryTime || ""}`.trim(),
      `Delivery instructions: ${order.delivery.deliveryInstructions || "None"}`,
      "",
      "Ordered products:",
      products,
      "",
      "Customization details:",
      customizations,
      "",
      `Subtotal: ${money(order.subtotal)}`,
      `Delivery charge: ${money(order.deliveryCharge)}`,
      `Total: ${money(order.total)}`,
      `Payment status: ${order.paymentStatus}`,
      `Order date/time: ${createdAt}`,
    ].join("\n"),
  };
}

function customCakeRequestSubmission(request: CustomCakeRequestNotification): FormspreeSubmission {
  const submittedAt = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(request.createdAt));
  const requirements = request.additionalRequirements || "None";

  return {
    _subject: `New custom cake request — ${request.name}`,
    request_id: request.id,
    customer_name: request.name,
    customer_phone: request.phone,
    customer_email: request.email || "Not provided",
    email: request.email || "",
    celebration: request.celebration || "Not provided",
    preferred_date: request.preferredDate || "To be confirmed",
    cake_size: request.cakeSize || "Not provided",
    flavour: request.flavour || "Not provided",
    colour_or_theme: request.theme || "Not provided",
    reference_image_url: request.referenceImageUrl || "Not provided",
    message_on_cake: request.messageOnCake || "None",
    approximate_budget: typeof request.budget === "number" ? money(request.budget) : "Not provided",
    additional_requirements: requirements,
    payment_status: "No payment collected — quote required",
    request_date_time: submittedAt,
    request_created_at_iso: request.createdAt,
    message: [
      `Custom cake request ID: ${request.id}`,
      `Customer: ${request.name}`,
      `Phone: ${request.phone}`,
      `Email: ${request.email || "Not provided"}`,
      `Celebration: ${request.celebration || "Not provided"}`,
      `Preferred date: ${request.preferredDate || "To be confirmed"}`,
      `Cake size: ${request.cakeSize || "Not provided"}`,
      `Flavour: ${request.flavour || "Not provided"}`,
      `Theme: ${request.theme || "Not provided"}`,
      `Reference image: ${request.referenceImageUrl || "Not provided"}`,
      `Message on cake: ${request.messageOnCake || "None"}`,
      `Budget: ${typeof request.budget === "number" ? money(request.budget) : "Not provided"}`,
      `Additional requirements: ${requirements}`,
      "Payment: No payment collected — quote required",
      `Submitted: ${submittedAt}`,
    ].join("\n"),
  };
}

async function sendFormspreeSubmission(payload: FormspreeSubmission) {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), 12_000);

  try {
    const response = await fetch(formspreeEndpoint(), {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: timeout.signal,
    });
    if (!response.ok) throw new Error(`Formspree order notification returned ${response.status}.`);
  } finally {
    clearTimeout(timer);
  }
}

const formspreeNotificationService: ConfirmedOrderNotificationService = {
  provider: "FORMSPREE",
  async sendConfirmedOrder(order) {
    await sendFormspreeSubmission(formspreeSubmission(order));
  },
};

function confirmedOrderNotificationService(): ConfirmedOrderNotificationService {
  const provider = orderNotificationProvider();
  if (provider === "FORMSPREE") return formspreeNotificationService;
  throw new Error(`Unsupported order notification provider: ${provider}.`);
}

/**
 * The order flow calls this after payment confirmation. Replace the provider
 * selected above with a WhatsApp implementation later without touching checkout.
 */
export async function notifyBakeryOfConfirmedOrder(order: OrderRecord) {
  return confirmedOrderNotificationService().sendConfirmedOrder(order);
}

/** Custom requests do not take payment, but are delivered through the same private Formspree endpoint. */
export async function notifyBakeryOfCustomCakeRequest(request: CustomCakeRequestNotification) {
  const provider = orderNotificationProvider();
  if (provider !== "FORMSPREE") throw new Error(`Unsupported order notification provider: ${provider}.`);
  await sendFormspreeSubmission(customCakeRequestSubmission(request));
}

export function orderNotificationConfiguration() {
  const provider = orderNotificationProvider();
  return {
    provider,
    configured: provider === "FORMSPREE" && Boolean(process.env.FORMSPREE_ORDER_ENDPOINT),
  };
}
