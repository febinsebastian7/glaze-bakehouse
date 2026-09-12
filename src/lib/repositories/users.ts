import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function syncFirebaseUser(user: { uid: string; email?: string | null; name?: string | null; imageUrl?: string | null }) {
  return prisma.user.upsert({
    where: { firebaseUid: user.uid },
    create: { firebaseUid: user.uid, email: user.email ?? null, name: user.name ?? null, imageUrl: user.imageUrl ?? null },
    update: { email: user.email ?? null, name: user.name ?? null, imageUrl: user.imageUrl ?? null },
  });
}

export async function findUserByFirebaseUid(firebaseUid: string) {
  return prisma.user.findUnique({ where: { firebaseUid } });
}
