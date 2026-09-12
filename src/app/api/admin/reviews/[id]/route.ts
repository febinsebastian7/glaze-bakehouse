import { NextResponse } from "next/server";

import { AuthorizationError, requireAdmin } from "@/lib/auth/session";
import { deleteReviewForAdmin, updateReviewForAdmin } from "@/lib/repositories/reviews";

type Context = { params: Promise<{ id: string }> };

function errorResponse(error: unknown) {
  if (error instanceof AuthorizationError) return NextResponse.json({ message: error.message }, { status: error.status });
  return NextResponse.json({ message: error instanceof Error ? error.message : "Review request could not be completed." }, { status: 400 });
}

export async function PATCH(request: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json() as { status?: unknown; featured?: unknown };
    const status = body.status === "PENDING" || body.status === "APPROVED" || body.status === "REJECTED" ? body.status : undefined;
    if (body.status !== undefined && !status) return NextResponse.json({ message: "Invalid review status." }, { status: 400 });
    if (body.featured !== undefined && typeof body.featured !== "boolean") return NextResponse.json({ message: "Invalid featured value." }, { status: 400 });
    return NextResponse.json(await updateReviewForAdmin(id, { status, featured: body.featured as boolean | undefined }));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    await deleteReviewForAdmin(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
