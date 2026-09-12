import "server-only";

import { randomUUID } from "node:crypto";

import { PaymentProvider, PaymentStatus, Prisma, type Order, type OrderItem, type Payment } from "@prisma/client";

import type { ValidatedOrder } from "@/lib/commerce/validateOrder";
import { prisma } from "@/lib/db/prisma";
import type { OrderRecord } from "@/types/product";

type OrderWithRelations = Order & {
  items: OrderItem[];
  payment: Payment | null;
};

function mapOrder(order: OrderWithRelations): OrderRecord {
  return {
    id: order.id,
    trackingToken: order.trackingToken,
    orderNumber: order.orderNumber,
    customer: { fullName: order.customerName, whatsapp: order.whatsapp, email: order.email ?? "" },
    delivery: {
      fulfilment: order.fulfilment,
      fullName: order.customerName,
      whatsapp: order.whatsapp,
      email: order.email ?? "",
      address: order.addressLine ?? "",
      area: order.area ?? "",
      pincode: order.pincode ?? "",
      deliveryInstructions: order.deliveryInstructions ?? "",
      deliveryDate: order.deliveryDate?.toISOString().slice(0, 10) ?? "",
      deliveryTime: order.deliveryTime ?? "",
      latitude: order.latitude ?? undefined,
      longitude: order.longitude ?? undefined,
    },
    items: order.items.map((item) => ({
      productId: item.productId ?? item.id,
      productName: item.productName,
      image: item.productImageUrl ?? undefined,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      selectedOptions: item.selectedOptions as Record<string, string> | undefined,
    })),
    subtotal: order.subtotal,
    deliveryCharge: order.deliveryCharge,
    total: order.total,
    specialNotes: order.specialNotes ?? undefined,
    paymentStatus: order.paymentStatus,
    paymentProvider: order.payment?.provider === PaymentProvider.RAZORPAY ? "RAZORPAY" : undefined,
    paymentId: order.payment?.providerPaymentId ?? undefined,
    paymentVerifiedAt: order.payment?.signatureVerifiedAt?.toISOString(),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  };
}

function orderNumber(date: Date, sequence: number) {
  const datePart = date.toISOString().slice(0, 10).replaceAll("-", "");
  return `GB-${datePart}-${String(sequence).padStart(4, "0")}`;
}

export async function createPendingOrder(input: ValidatedOrder, specialNotes: string, userId?: string) {
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const order = await prisma.$transaction(async (transaction) => {
        const sequence = await transaction.order.count({ where: { createdAt: { gte: dayStart } } }) + 1 + attempt;
        return transaction.order.create({
          data: {
            orderNumber: orderNumber(now, sequence),
            userId,
            customerName: input.delivery.fullName,
            whatsapp: input.delivery.whatsapp,
            email: input.delivery.email || null,
            fulfilment: input.delivery.fulfilment,
            addressLine: input.delivery.address || null,
            area: input.delivery.area || null,
            pincode: input.delivery.pincode || null,
            deliveryInstructions: input.delivery.deliveryInstructions || null,
            latitude: input.delivery.latitude ?? null,
            longitude: input.delivery.longitude ?? null,
            deliveryDate: new Date(`${input.delivery.deliveryDate}T12:00:00`),
            deliveryTime: input.delivery.deliveryTime,
            specialNotes: specialNotes || null,
            subtotal: input.subtotal,
            deliveryCharge: input.deliveryCharge,
            total: input.total,
            items: {
              create: input.items.map(({ product, quantity, specialInstructions }) => ({
                productId: product.id,
                productName: product.name,
                productImageUrl: product.primaryImageUrl,
                unitPrice: product.price,
                quantity,
                ...(specialInstructions ? { selectedOptions: { specialInstructions } } : {}),
              })),
            },
            payment: { create: { provider: PaymentProvider.RAZORPAY, status: PaymentStatus.PENDING } },
          },
          include: { items: true, payment: true },
        });
      });
      return mapOrder(order);
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002" || attempt === 2) throw error;
    }
  }

  throw new Error("We could not reserve an order number. Please try again.");
}

export async function setProviderOrder(orderId: string, providerOrderId: string) {
  await prisma.payment.update({ where: { orderId }, data: { providerOrderId } });
}

export async function getOrderForProviderOrder(providerOrderId: string) {
  const payment = await prisma.payment.findUnique({ where: { providerOrderId }, include: { order: { include: { items: true, payment: true } } } });
  return payment ? mapOrder(payment.order) : null;
}

export async function markPaymentFailed(orderId: string) {
  await prisma.$transaction([
    prisma.payment.updateMany({ where: { orderId, status: PaymentStatus.PENDING }, data: { status: PaymentStatus.FAILED } }),
    prisma.order.updateMany({ where: { id: orderId, paymentStatus: PaymentStatus.PENDING }, data: { paymentStatus: PaymentStatus.FAILED } }),
  ]);
}

/** Mark an abandoned or failed checkout without allowing it to overwrite a verified payment. */
export async function markPaymentFailedByTrackingToken(trackingToken: string) {
  const order = await prisma.order.findUnique({ where: { trackingToken }, select: { id: true } });
  if (!order) return false;
  await markPaymentFailed(order.id);
  return true;
}

export async function markRazorpayPaymentPaid(input: {
  providerOrderId: string;
  paymentId: string;
  rawPayload: unknown;
  webhook: boolean;
}) {
  const rawPayload = JSON.parse(JSON.stringify(input.rawPayload)) as Prisma.InputJsonValue;
  return prisma.$transaction(async (transaction) => {
    const payment = await transaction.payment.findUnique({ where: { providerOrderId: input.providerOrderId }, include: { order: { include: { items: true, payment: true } } } });
    if (!payment) throw new Error("This payment does not belong to a Glaze Bakehouse order.");
    if (payment.providerPaymentId && payment.providerPaymentId !== input.paymentId) throw new Error("This Razorpay order has already been matched to another payment.");

    const changed = await transaction.payment.updateMany({
      where: { id: payment.id, status: { not: PaymentStatus.PAID } },
      data: {
        status: PaymentStatus.PAID,
        providerPaymentId: input.paymentId,
        signatureVerifiedAt: input.webhook ? payment.signatureVerifiedAt : new Date(),
        webhookVerifiedAt: input.webhook ? new Date() : payment.webhookVerifiedAt,
        rawPayload,
      },
    });

    if (!changed.count) return { order: mapOrder(payment.order), newlyPaid: false };

    const order = await transaction.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: PaymentStatus.PAID, status: "ORDER_CONFIRMED" },
      include: { items: true, payment: true },
    });
    return { order: mapOrder(order), newlyPaid: true };
  });
}

export async function getOrderByTrackingToken(token: string) {
  const order = await prisma.order.findUnique({ where: { trackingToken: token }, include: { items: true, payment: true } });
  return order ? mapOrder(order) : null;
}

export async function listOrdersForAdmin() {
  const orders = await prisma.order.findMany({ include: { items: true, payment: true }, orderBy: { createdAt: "desc" } });
  return orders.map(mapOrder);
}

export async function updateOrderStatus(orderId: string, status: OrderRecord["status"]) {
  const order = await prisma.order.update({ where: { id: orderId }, data: { status }, include: { items: true, payment: true } });
  let reviewToken: string | undefined;
  if (status === "DELIVERED") {
    const review = await prisma.review.upsert({
      where: { orderId },
      create: { orderId, secureToken: randomUUID(), customerName: order.customerName, rating: 5, originalText: "" },
      update: {},
    });
    reviewToken = review.secureToken;
  }
  return { order: mapOrder(order), reviewToken };
}
