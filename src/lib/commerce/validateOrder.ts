import "server-only";

import { ProductAvailability, type Product as DatabaseProduct } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { DeliveryDetails } from "@/types/product";

export interface UntrustedLineItem {
  productId?: unknown;
  quantity?: unknown;
  specialInstructions?: unknown;
}

export type ValidatedOrder = {
  items: Array<{ product: DatabaseProduct; quantity: number; specialInstructions?: string }>;
  delivery: DeliveryDetails;
  subtotal: number;
  deliveryCharge: number;
  total: number;
};

const maxTextLength = 1_000;

function text(value: unknown, label: string, required = false, maximum = maxTextLength) {
  if (typeof value !== "string") {
    if (required) throw new Error(`${label} is required.`);
    return "";
  }
  const trimmed = value.trim();
  if (required && !trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > maximum) throw new Error(`${label} is too long.`);
  return trimmed;
}

function parseDeliveryDate(value: unknown) {
  const raw = text(value, "Delivery date", true, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new Error("Please choose a valid delivery date.");
  const parsed = new Date(`${raw}T12:00:00`);
  if (Number.isNaN(parsed.valueOf())) throw new Error("Please choose a valid delivery date.");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsed < today) throw new Error("Delivery date cannot be in the past.");
  return { raw, value: parsed };
}

function requiredPreparationHours(preparationTime: string | null) {
  const match = preparationTime?.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/i);
  return match ? Number(match[1]) : 0;
}

/** Calculates price and availability from database products; client totals are never trusted. */
export async function validateOrderItems(lines: UntrustedLineItem[], deliveryInput: Record<string, unknown>): Promise<ValidatedOrder> {
  if (!Array.isArray(lines) || !lines.length) throw new Error("Your bag is empty.");
  if (lines.length > 20) throw new Error("Your bag has too many different items.");

  const fullName = text(deliveryInput.fullName, "Name", true, 120);
  const whatsapp = text(deliveryInput.whatsapp, "WhatsApp number", true, 30);
  if (!/^[+()\-\s\d]{7,30}$/.test(whatsapp)) throw new Error("Please enter a valid WhatsApp number.");
  const email = text(deliveryInput.email, "Email", false, 254);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email address.");

  const fulfilment = deliveryInput.fulfilment === "PICKUP" ? "PICKUP" : "DELIVERY";
  const address = text(deliveryInput.address, "Address", fulfilment === "DELIVERY", 500);
  const area = text(deliveryInput.area, "Area", fulfilment === "DELIVERY", 120);
  const pincode = text(deliveryInput.pincode, "Pincode", fulfilment === "DELIVERY", 20);
  if (fulfilment === "DELIVERY" && !/^[A-Za-z0-9\s-]{4,20}$/.test(pincode)) throw new Error("Please enter a valid pincode.");
  const requestedDate = parseDeliveryDate(deliveryInput.deliveryDate);
  const requestedTime = text(deliveryInput.deliveryTime, "Delivery time", true, 100);

  const normalizedLines = lines.map((line) => {
    const productId = typeof line.productId === "string" ? line.productId : "";
    const quantity = typeof line.quantity === "number" ? Math.floor(line.quantity) : 0;
    if (!productId || quantity < 1 || quantity > 20) throw new Error("One or more item quantities are invalid.");
    return { productId, quantity, specialInstructions: text(line.specialInstructions, "Item instructions", false, 500) };
  });
  if (new Set(normalizedLines.map((line) => line.productId)).size !== normalizedLines.length) throw new Error("Each product can only appear once in your bag.");

  const products = await prisma.product.findMany({ where: { id: { in: normalizedLines.map((line) => line.productId) } } });
  const productById = new Map(products.map((product) => [product.id, product]));
  const items = normalizedLines.map((line) => {
    const product = productById.get(line.productId);
    if (!product || product.availability !== ProductAvailability.AVAILABLE) throw new Error("One or more items in your bag are no longer available.");
    return { product, quantity: line.quantity, specialInstructions: line.specialInstructions || undefined };
  });

  const highestPreparationHours = Math.max(0, ...items.map(({ product }) => requiredPreparationHours(product.preparationTime)));
  const earliestDate = new Date();
  earliestDate.setHours(0, 0, 0, 0);
  earliestDate.setDate(earliestDate.getDate() + Math.ceil(highestPreparationHours / 24));
  if (requestedDate.value < earliestDate) throw new Error("The selected delivery date does not allow enough preparation time for every item in your bag.");

  const subtotal = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
  const deliveryCharge = fulfilment === "PICKUP" ? 0 : 0;
  return {
    items,
    delivery: {
      fulfilment,
      fullName,
      whatsapp,
      email,
      address,
      area,
      pincode,
      deliveryInstructions: text(deliveryInput.deliveryInstructions, "Delivery instructions", false, 500),
      deliveryDate: requestedDate.raw,
      deliveryTime: requestedTime,
      latitude: typeof deliveryInput.latitude === "number" && Number.isFinite(deliveryInput.latitude) ? deliveryInput.latitude : undefined,
      longitude: typeof deliveryInput.longitude === "number" && Number.isFinite(deliveryInput.longitude) ? deliveryInput.longitude : undefined,
    },
    subtotal,
    deliveryCharge,
    total: subtotal + deliveryCharge,
  };
}
