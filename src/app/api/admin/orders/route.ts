import { NextResponse } from "next/server";

import { AuthorizationError, requireAdmin } from "@/lib/auth/session";
import { listOrdersForAdmin, updateOrderStatus } from "@/lib/repositories/orders";
import { sendCustomerOrderStatusUpdate, sendCustomerReviewInvitation } from "@/lib/services/whatsapp";
import type { OrderStatus } from "@/types/product";

const statuses = new Set<OrderStatus>(["PENDING_PAYMENT", "ORDER_CONFIRMED", "PREPARING", "BAKING", "PACKED", "OUT_FOR_DELIVERY", "READY_FOR_PICKUP", "DELIVERED"]);

function errorResponse(error: unknown) {
  if (error instanceof AuthorizationError) return NextResponse.json({ message: error.message }, { status: error.status });
  return NextResponse.json({ message: error instanceof Error ? error.message : "Order request could not be completed." }, { status: 400 });
}

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await listOrdersForAdmin());
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json() as { id?: unknown; status?: unknown };
    if (typeof body.id !== "string" || typeof body.status !== "string" || !statuses.has(body.status as OrderStatus)) {
      return NextResponse.json({ message: "A valid order and order status are required." }, { status: 400 });
    }
    const result = await updateOrderStatus(body.id, body.status as OrderStatus);
    let notificationSent = false;
    try {
      if (result.reviewToken) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? new URL(request.url).origin;
        await sendCustomerReviewInvitation(result.order, `${appUrl}/review/${result.reviewToken}`);
      } else if (result.order.paymentStatus === "PAID" && result.order.status !== "PENDING_PAYMENT") {
        await sendCustomerOrderStatusUpdate(result.order, result.order.status);
      }
      notificationSent = true;
    } catch {
      // Status persistence is authoritative; messaging requires an approved Meta template.
    }
    return NextResponse.json({ order: result.order, notificationSent });
  } catch (error) {
    return errorResponse(error);
  }
}
