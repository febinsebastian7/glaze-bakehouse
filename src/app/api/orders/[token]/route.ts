import { NextResponse } from "next/server";

import { getOrderByTrackingToken } from "@/lib/repositories/orders";

type Context = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: Context) {
  const { token } = await context.params;
  const order = await getOrderByTrackingToken(token);
  if (!order) return NextResponse.json({ message: "Order not found." }, { status: 404 });
  return NextResponse.json(order);
}
