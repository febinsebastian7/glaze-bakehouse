import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const requiredAdminVariables = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY"] as const;
const firebaseAdminAppName = "glaze-bakehouse-admin";

export const firebaseAdminConfigured = requiredAdminVariables.every((key) => Boolean(process.env[key]));
export const firebaseProjectsMatch = !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === process.env.FIREBASE_PROJECT_ID;

export class FirebaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FirebaseConfigurationError";
  }
}

function normalizePrivateKey(raw: string) {
  let key = raw.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\n/g, "\n").trim();
  if (!key.includes("-----BEGIN PRIVATE KEY-----") || !key.includes("-----END PRIVATE KEY-----")) {
    throw new FirebaseConfigurationError("FIREBASE_PRIVATE_KEY must contain the complete PEM value from the Firebase service-account JSON file.");
  }
  return key;
}

export function getFirebaseAdminAuth() {
  if (!firebaseAdminConfigured) {
    throw new FirebaseConfigurationError("Firebase Admin is not configured.");
  }

  if (!firebaseProjectsMatch) {
    throw new FirebaseConfigurationError("The Firebase browser and Admin SDK projects do not match.");
  }

  const app = getApps().find((item) => item.name === firebaseAdminAppName) ?? initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY ?? ""),
    }),
  }, firebaseAdminAppName);

  return getAuth(app);
}
