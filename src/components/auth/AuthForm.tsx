"use client";
"use no memo";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  completeGoogleRedirect,
  continueGoogleRedirect,
  firebaseClientConfigured,
  signInWithGooglePopup,
  signOutFirebaseClient,
  type UserCredential,
} from "@/lib/firebase/client";

function safeReturnTo(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

function firebaseErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) return String(error.code);
  return "";
}

function signInErrorMessage(error: unknown) {
  const code = firebaseErrorCode(error);
  const raw = error instanceof Error ? error.message : "";
  if (/component auth has not been (configured|registered) yet/i.test(raw)) {
    return "Google sign-in could not start because Firebase Auth loaded twice. Restart the dev server after the package update.";
  }
  if (code === "auth/configuration-not-found") {
    return "Google sign-in is not enabled for this Firebase project yet. Enable Authentication and the Google provider in the Firebase console, then add localhost to Authorized domains.";
  }
  if (code === "auth/operation-not-allowed") {
    return "The Google sign-in provider is disabled. Enable it under Firebase Authentication → Sign-in method.";
  }
  if (code === "auth/unauthorized-domain") {
    return "This site is not on Firebase authorized domains. Add localhost (and the production domain) in Authentication → Settings.";
  }
  if (code === "auth/invalid-api-key" || code === "auth/api-key-not-valid.-please-pass-a-valid-api-key.") {
    return "The Firebase API key is invalid. Check NEXT_PUBLIC_FIREBASE_API_KEY.";
  }
  if (code === "auth/popup-blocked") {
    return "The Google sign-in popup was blocked. Continue in this window, or allow popups for this site.";
  }
  return raw || "We could not complete Google sign-in.";
}

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const isLogin = mode === "login";

  const finishSignIn = useCallback(async (credential: UserCredential) => {
    const idToken = await credential.user.getIdToken(true);
    const response = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken }) });
    const result = await response.json().catch(() => ({})) as { message?: string };
    if (!response.ok) throw new Error(result.message ?? "We could not complete sign-in.");
    await signOutFirebaseClient();
    router.replace(returnTo);
    router.refresh();
  }, [returnTo, router]);

  useEffect(() => {
    if (!firebaseClientConfigured) return;
    let active = true;
    const completeRedirect = async () => {
      try {
        const credential = await completeGoogleRedirect();
        if (credential && active) {
          setPending(true);
          setMessage("Completing Google sign-in…");
          await finishSignIn(credential);
        }
      } catch (error) {
        if (active) setMessage(signInErrorMessage(error));
      } finally {
        if (active) setPending(false);
      }
    };
    void completeRedirect();
    return () => { active = false; };
  }, [finishSignIn]);

  const signInWithGoogle = () => {
    if (!firebaseClientConfigured) {
      setMessage("Google sign-in is not configured yet. Please contact Glaze Bakehouse.");
      return;
    }

    const popup = signInWithGooglePopup();
    setPending(true);
    setMessage("Opening Google sign-in…");

    void (async () => {
      try {
        await finishSignIn(await popup);
      } catch (error) {
        const code = firebaseErrorCode(error);
        if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
          setMessage("Continuing with Google in this window…");
          await continueGoogleRedirect();
          return;
        }
        if (code === "auth/popup-closed-by-user") {
          setMessage("Google sign-in was closed before it finished.");
          return;
        }
        setMessage(signInErrorMessage(error));
      } finally {
        setPending(false);
      }
    })();
  };

  return <section className="mt-8 rounded-[2rem] bg-[var(--cream-light)] p-5 sm:p-8"><p className="glaze-eyebrow text-[var(--caramel)]">{isLogin ? "Welcome back" : "A little closer"}</p><h1 className="mt-3 font-display text-4xl">{isLogin ? "Save your sweet details." : "Create your Glaze account."}</h1><p className="mt-3 text-sm leading-6 text-[var(--cocoa)]/60">Your bag and checkout details stay in place while you sign in. Google authentication is used so passwords are never stored by Glaze.</p><button type="button" disabled={pending} onClick={signInWithGoogle} className="glaze-primary-button mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-full text-[9px] font-semibold uppercase tracking-[.15em] disabled:cursor-wait disabled:opacity-60"><span className="grid h-5 w-5 place-items-center rounded-full bg-white font-sans text-xs font-semibold text-[#4285f4]">G</span>{pending ? "Signing in…" : "Continue with Google"}</button><div className="mt-4 rounded-xl bg-white/60 p-3 text-xs leading-5 text-[var(--cocoa)]/65">{firebaseClientConfigured ? "Your Google identity is verified on the server before Glaze creates an account session." : "Firebase is not configured yet, so no account session can be created."}</div>{message && <p role="status" className="mt-3 text-center text-sm leading-6 text-[var(--cocoa)]/65">{message}</p>}<p className="mt-5 text-center text-sm text-[var(--cocoa)]/60">{isLogin ? "New to Glaze?" : "Already have an account?"} <Link href={isLogin ? `/signup?returnTo=${encodeURIComponent(returnTo)}` : `/login?returnTo=${encodeURIComponent(returnTo)}`} className="font-semibold text-[var(--caramel)]">{isLogin ? "Create one" : "Login"}</Link></p>{returnTo !== "/account" && <Link href={returnTo} className="mt-4 block text-center text-[8px] font-semibold uppercase tracking-[.13em] text-[var(--cocoa)]/55 hover:text-[var(--caramel)]">Return to checkout as guest</Link>}</section>;
}
