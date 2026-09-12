import "server-only";

import { CustomCakeStatus, type CustomCakeRequest } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { CustomCakeRequestNotification } from "@/lib/services/orderNotifications";

export type CustomCakeRequestRecord = CustomCakeRequestNotification & {
  status: CustomCakeStatus;
  updatedAt: string;
};

export type CustomCakeRequestInput = {
  userId?: string;
  name: string;
  phone: string;
  email: string | null;
  celebration: string | null;
  preferredDate: Date | null;
  cakeSize: string | null;
  flavour: string | null;
  theme: string | null;
  referenceImageUrl: string | null;
  messageOnCake: string | null;
  budget: number | null;
  additionalRequirements: string | null;
};

function mapCustomCakeRequest(request: CustomCakeRequest): CustomCakeRequestRecord {
  return {
    id: request.id,
    name: request.name,
    phone: request.phone,
    email: request.email ?? undefined,
    celebration: request.celebration ?? undefined,
    preferredDate: request.preferredDate?.toISOString().slice(0, 10),
    cakeSize: request.cakeSize ?? undefined,
    flavour: request.flavour ?? undefined,
    theme: request.theme ?? undefined,
    referenceImageUrl: request.referenceImageUrl ?? undefined,
    messageOnCake: request.messageOnCake ?? undefined,
    budget: request.budget ?? undefined,
    additionalRequirements: request.additionalRequirements ?? undefined,
    createdAt: request.createdAt.toISOString(),
    status: request.status,
    updatedAt: request.updatedAt.toISOString(),
  };
}

export async function createCustomCakeRequest(input: CustomCakeRequestInput) {
  return mapCustomCakeRequest(await prisma.customCakeRequest.create({ data: input }));
}

export async function listCustomCakeRequestsForAdmin() {
  const requests = await prisma.customCakeRequest.findMany({ orderBy: { createdAt: "desc" } });
  return requests.map(mapCustomCakeRequest);
}

export async function updateCustomCakeRequestStatus(id: string, status: CustomCakeStatus) {
  return mapCustomCakeRequest(await prisma.customCakeRequest.update({ where: { id }, data: { status } }));
}
