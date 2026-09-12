"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  type Auth,
  type UserCredential,
} from "firebase/auth";

export type { UserCredential };

// 1. Check and Load Config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// RESTORED EXPORT: Your AuthForm needs this to render properly
export const firebaseClientConfigured = Object.values(firebaseConfig).every((value) => Boolean(value));

function firebaseAuth() {
  if (!firebaseClientConfigured) throw new Error("Firebase is not configured.");
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app) as Auth;
}

// 4. Setup Google Provider
export function createGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

// 5. Auth Actions
export async function signInWithGooglePopup() {
  return signInWithPopup(firebaseAuth(), createGoogleProvider());
}

export function continueGoogleRedirect() {
  return signInWithRedirect(firebaseAuth(), createGoogleProvider());
}

export async function completeGoogleRedirect() {
  return getRedirectResult(firebaseAuth());
}

export function signOutFirebaseClient() {
  return signOut(firebaseAuth());
}
