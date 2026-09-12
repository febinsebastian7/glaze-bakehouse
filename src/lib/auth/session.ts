import "server-only";

import { cookies } from "next/headers";

import { isAdminEmail } from "@/lib/auth/admin";
import { firebaseAdminConfigured, getFirebaseAdminAuth } from "@/lib/firebase/admin";

export const sessionCookieName = "glaze-session";
export const sessionDurationMs = 1000 * 60 * 60 * 24 * 5;

export type SessionUser = {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
};

export class AuthorizationError extends Error {
  constructor(public readonly status: 401 | 403, message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!firebaseAdminConfigured) return null;
  const session = (await cookies()).get(sessionCookieName)?.value;
  if (!session) return null;

  try {
    const decoded = await getFirebaseAdminAuth().verifySessionCookie(session, true);
    return { uid: decoded.uid, email: decoded.email ?? null, name: decoded.name ?? null, picture: decoded.picture ?? null };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) throw new AuthorizationError(401, "Authentication is required.");
  if (!isAdminEmail(user.email)) throw new AuthorizationError(403, "You do not have access to Glaze Admin.");
  return user;
}
