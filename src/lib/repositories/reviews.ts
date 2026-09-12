import "server-only";

import { randomUUID } from "node:crypto";

import { ReviewStatus, type Review } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { cleanReview } from "@/lib/services/reviewCleanup";
import type { ReviewRecord } from "@/types/product";

function mapReview(review: Review): ReviewRecord {
  return {
    id: review.id,
    orderId: review.orderId ?? undefined,
    customerName: review.customerName,
    rating: review.rating,
    originalText: review.originalText,
    cleanedText: review.cleanedText ?? undefined,
    cleanupProvider: review.cleanupProvider ?? undefined,
    image: review.photoUrl ?? undefined,
    displayName: review.displayName ?? undefined,
    consentToDisplayPhoto: review.consentToDisplayPhoto,
    status: review.status,
    featured: review.featured,
    createdAt: review.createdAt.toISOString(),
  };
}

export async function listApprovedReviews() {
  const reviews = await prisma.review.findMany({ where: { status: ReviewStatus.APPROVED }, orderBy: { createdAt: "desc" } });
  return reviews.map(mapReview);
}

export async function listReviewsForAdmin() {
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
  return reviews.map(mapReview);
}

export async function submitReview(input: { token: string; rating: number; text: string; displayName?: string; consentToDisplayPhoto: boolean }) {
  const existing = await prisma.review.findUnique({ where: { secureToken: input.token }, include: { order: true } });
  if (!existing?.order || existing.order.status !== "DELIVERED") throw new Error("This review link is not available yet.");
  if (existing.originalText.trim()) throw new Error("This review has already been submitted.");
  const cleanup = await cleanReview({ review: input.text });
  const review = await prisma.review.update({
    where: { id: existing.id },
    data: {
      rating: input.rating,
      originalText: input.text,
      cleanedText: cleanup.cleanedText,
      cleanupProvider: cleanup.provider,
      cleanupCompletedAt: new Date(),
      displayName: input.displayName || null,
      consentToDisplayPhoto: input.consentToDisplayPhoto,
      status: ReviewStatus.PENDING,
    },
  });
  return mapReview(review);
}

export async function submitDirectReview(input: { customerName: string; userId?: string; rating: number; text: string }) {
  const cleanup = await cleanReview({ review: input.text });
  const review = await prisma.review.create({
    data: {
      secureToken: randomUUID(),
      userId: input.userId,
      customerName: input.customerName,
      displayName: input.customerName,
      rating: input.rating,
      originalText: input.text,
      cleanedText: cleanup.cleanedText,
      cleanupProvider: cleanup.provider,
      cleanupCompletedAt: new Date(),
      status: ReviewStatus.PENDING,
    },
  });
  return mapReview(review);
}

export async function updateReviewForAdmin(id: string, changes: { status?: ReviewStatus; featured?: boolean }) {
  const review = await prisma.review.update({ where: { id }, data: changes });
  return mapReview(review);
}

export async function deleteReviewForAdmin(id: string) {
  await prisma.review.delete({ where: { id } });
}
