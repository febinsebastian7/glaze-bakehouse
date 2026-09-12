import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/auth/admin";
import { FirebaseConfigurationError, firebaseAdminConfigured, firebaseProjectsMatch, getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { getSessionUser, sessionCookieName, sessionDurationMs } from "@/lib/auth/session";
import { syncFirebaseUser } from "@/lib/repositories/users";

type AuthRouteContext = { params: Promise<{ action: string }> };

function authenticationError(error: unknown) {
  console.error("Firebase session exchange failed.", error);
  if (error instanceof FirebaseConfigurationError || !firebaseProjectsMatch) {
    return NextResponse.json({ message: "Google sign-in is temporarily unavailable while the secure sign-in service is configured." }, { status: 503 });
  }
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  if (code === "auth/id-token-expired" || code === "auth/id-token-revoked") {
    return NextResponse.json({ message: "Your Google sign-in has expired. Please try again." }, { status: 401 });
  }
  return NextResponse.json({ message: "We could not verify this Google sign-in. Please try again." }, { status: 401 });
}

export async function GET(_request: Request, context: AuthRouteContext) {
  const { action } = await context.params;
  if (action !== "session") return NextResponse.json({ message: "Unknown authentication action." }, { status: 404 });
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { name: user.name, email: user.email, picture: user.picture, isAdmin: isAdminEmail(user.email) } });
}

export async function POST(request: Request, context: AuthRouteContext) {
  const { action } = await context.params;
  if (action !== "session") return NextResponse.json({ message: "Unknown authentication action." }, { status: 404 });
  if (!firebaseAdminConfigured) return NextResponse.json({ message: "Google sign-in is not configured yet." }, { status: 503 });
  if (!firebaseProjectsMatch) return NextResponse.json({ message: "Google sign-in is temporarily unavailable while the secure sign-in service is configured." }, { status: 503 });

  try {
    const body = await request.json() as { idToken?: unknown };
    if (typeof body.idToken !== "string" || !body.idToken) return NextResponse.json({ message: "A valid identity token is required." }, { status: 400 });
    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(body.idToken);
    if (!decoded.auth_time || Date.now() / 1000 - decoded.auth_time > 5 * 60) {
      return NextResponse.json({ message: "Please sign in again to continue." }, { status: 401 });
    }
    const token = await auth.createSessionCookie(body.idToken, { expiresIn: sessionDurationMs });
    try {
      await syncFirebaseUser({
        uid: decoded.uid,
        email: decoded.email ?? null,
        name: decoded.name ?? null,
        imageUrl: decoded.picture ?? null,
      });
    } catch (error) {
      console.error("Signed in, but the user record could not be saved.", error);
    }
    const response = NextResponse.json({ message: "Signed in." });
    response.cookies.set(sessionCookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: sessionDurationMs / 1000, path: "/" });
    return response;
  } catch (error) { return authenticationError(error); }
}

export async function DELETE(_request: Request, context: AuthRouteContext) {
  const { action } = await context.params;
  if (action !== "session") return NextResponse.json({ message: "Unknown authentication action." }, { status: 404 });
  const response = NextResponse.json({ message: "Signed out." });
  response.cookies.set(sessionCookieName, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 0, path: "/" });
  return response;
}
