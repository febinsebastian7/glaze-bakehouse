"use client";

import Link from "next/link";
import { Check, ChevronLeft, LocateFixed, LockKeyhole, MapPin, ShoppingBag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";

import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import ProductImage from "@/components/products/ProductImage";
import { useStore } from "@/components/store/StoreProvider";

const money = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
type Step = "details" | "choice" | "review";

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckout {
  open: () => void;
  on: (event: "payment.failed", callback: (response: { error: { description?: string } }) => void) => void;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email?: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
  handler: (response: RazorpayPaymentResponse) => void | Promise<void>;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckout;
  }
}

type RazorpayCheckoutConstructor = NonNullable<Window["Razorpay"]>;

let razorpayScript: Promise<RazorpayCheckoutConstructor> | undefined;

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (razorpayScript) return razorpayScript;

  razorpayScript = new Promise<RazorpayCheckoutConstructor>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-glaze-razorpay="true"]');
    const script = existing ?? document.createElement("script");
    const finish = () => window.Razorpay ? resolve(window.Razorpay) : reject(new Error("Secure checkout could not be loaded. Please check your connection and try again."));

    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", () => {
      script.remove();
      reject(new Error("Secure checkout could not be loaded. Please check your connection and try again."));
    }, { once: true });
    if (!existing) {
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.dataset.glazeRazorpay = "true";
      document.head.appendChild(script);
    }
  }).catch((error) => {
    razorpayScript = undefined;
    throw error;
  });

  return razorpayScript;
}

function OrderSummary() {
  const { cartItems, subtotal, deliveryCharge, total } = useStore();

  return <aside className="rounded-[1.75rem] bg-[var(--cocoa)] p-6 text-[var(--cream-light)]">
    <p className="glaze-eyebrow text-[var(--honey)]">Order summary</p>
    <div className="mt-5 space-y-4">
      {cartItems.map(({ product, quantity }) => <div key={product.id} className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#e6d6c2]"><ProductImage product={product} /></div>
        <div className="min-w-0 flex-1"><p className="truncate text-sm text-white">{product.name}</p><p className="text-[9px] text-white/55">Qty {quantity}</p></div>
        <span className="text-sm font-semibold text-white">{money(product.price * quantity)}</span>
      </div>)}
    </div>
    <div className="mt-5 space-y-2 border-t border-white/15 pt-5 text-sm text-white/65">
      <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
      <div className="flex justify-between"><span>Delivery</span><span>{money(deliveryCharge)}</span></div>
    </div>
    <div className="mt-4 flex justify-between border-t border-white/15 pt-4 font-display text-2xl text-white"><span>Total</span><span>{money(total)}</span></div>
  </aside>;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedStep = searchParams.get("step");
  const [step, setStep] = useState<Step>(requestedStep === "choice" || requestedStep === "review" ? requestedStep : "details");
  const [locationMessage, setLocationMessage] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const paymentInFlight = useRef(false);
  const { cartItems, checkout, updateCheckout, checkoutNotes, setCheckoutNotes, clearCart, resetCheckout } = useStore();
  const isDelivery = checkout.fulfilment === "DELIVERY";

  useEffect(() => { void loadRazorpayCheckout().catch(() => undefined); }, []);

  const markPaymentFailed = async (trackingToken?: string) => {
    if (!trackingToken) return;
    try {
      await fetch("/api/payments/mark-failed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingToken }),
      });
    } catch {
      // Razorpay's webhook can still reconcile a captured payment.
    }
  };

  const saveDetails = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isDelivery && (!checkout.address.trim() || !checkout.area.trim() || !checkout.pincode.trim())) {
      setLocationMessage("Please complete your delivery address, area and pincode.");
      return;
    }
    setLocationMessage("");
    setStep("choice");
  };

  const useLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Location access is not supported in this browser. Please enter your address manually.");
      return;
    }
    setLocationMessage("Finding your current location…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateCheckout({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setLocationMessage("Location pinned. Please confirm the address details below before continuing.");
      },
      () => setLocationMessage("We could not access your location. You can still enter the address manually."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const requestPayment = async () => {
    if (paymentInFlight.current) return;

    paymentInFlight.current = true;
    setIsPaymentProcessing(true);
    setPaymentMessage("Validating your order securely…");
    let trackingToken: string | undefined;
    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems.map(({ product, quantity, specialInstructions }) => ({ productId: product.id, quantity, specialInstructions })), delivery: checkout, notes: checkoutNotes }),
      });
      const result = await response.json().catch(() => ({})) as { key_id?: string; order_id?: string; amount?: number; currency?: string; trackingToken?: string; message?: string };
      if (!response.ok || !result.key_id || !result.order_id || !result.amount || !result.currency || !result.trackingToken) throw new Error(result.message ?? "Payment could not be started.");
      trackingToken = result.trackingToken;
      const RazorpayCheckout = await loadRazorpayCheckout();

      const checkoutModal = new RazorpayCheckout({
        key: result.key_id,
        amount: result.amount,
        currency: result.currency,
        name: "Glaze Bakehouse",
        description: "Order payment",
        order_id: result.order_id,
        prefill: { name: checkout.fullName, email: checkout.email || undefined, contact: checkout.whatsapp },
        theme: { color: "#b9794f" },
        modal: { ondismiss: () => { paymentInFlight.current = false; setIsPaymentProcessing(false); setPaymentMessage("Payment cancelled."); void markPaymentFailed(trackingToken); } },
        handler: async (payment) => {
          setPaymentMessage("Verifying your payment securely…");
          try {
            const verificationResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payment),
            });
            const verification = await verificationResponse.json().catch(() => ({})) as { success?: boolean; trackingToken?: string; message?: string };
            if (!verificationResponse.ok || !verification.success || !verification.trackingToken) throw new Error(verification.message ?? "Payment verification failed.");
            clearCart();
            resetCheckout();
            router.replace(`/thank-you/${encodeURIComponent(verification.trackingToken)}`);
          } catch (error) {
            void markPaymentFailed(trackingToken);
            setPaymentMessage(error instanceof Error ? error.message : "Payment verification failed. Please contact Glaze Bakehouse if your account was charged.");
          } finally {
            paymentInFlight.current = false;
            setIsPaymentProcessing(false);
          }
        },
      });
      checkoutModal.on("payment.failed", (failure) => {
        paymentInFlight.current = false;
        setIsPaymentProcessing(false);
        void markPaymentFailed(trackingToken);
        setPaymentMessage(failure.error.description ?? "Payment could not be completed. Please try again.");
      });
      checkoutModal.open();
    } catch (error) {
      void markPaymentFailed(trackingToken);
      paymentInFlight.current = false;
      setIsPaymentProcessing(false);
      setPaymentMessage(error instanceof Error ? error.message : "Payment could not be completed. Please try again.");
    }
  };

  if (!cartItems.length) return <><Navbar /><main className="container-glaze py-24 text-center"><ShoppingBag size={32} className="mx-auto text-[var(--caramel)]" /><h1 className="mt-5 font-display text-5xl">Your bag is empty.</h1><p className="mt-3 text-sm text-[var(--cocoa)]/60">Choose a cake, a dessert, or both before checkout.</p><Link href="/cakes" className="glaze-primary-button mt-7 inline-flex rounded-full px-5 py-3 text-[9px] font-semibold uppercase tracking-[.15em]">Browse cakes</Link></main><Footer /></>;

  return <><Navbar /><main className="container-glaze py-10 md:py-16"><div className="mx-auto max-w-6xl">
    <div className="mb-8 flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[.15em] text-[var(--cocoa)]/50"><span className={step === "details" ? "text-[var(--caramel)]" : ""}>1 Details</span><span>—</span><span className={step === "choice" ? "text-[var(--caramel)]" : ""}>2 Continue</span><span>—</span><span className={step === "review" ? "text-[var(--caramel)]" : ""}>3 Review</span></div>
    {step === "details" && <div className="grid gap-8 lg:grid-cols-[1fr_360px]"><form onSubmit={saveDetails} className="rounded-[2rem] border border-[var(--cocoa)]/10 bg-[var(--cream-light)] p-5 sm:p-8">
      <p className="glaze-eyebrow text-[var(--caramel)]">Checkout</p><h1 className="mt-3 font-display text-4xl md:text-5xl">Where should we send the sweetness?</h1>
      <section className="mt-8"><h2 className="font-display text-2xl">Your details</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label><span className="glaze-label">Full name</span><input required value={checkout.fullName} onChange={(event) => updateCheckout({ fullName: event.target.value })} className="glaze-field" placeholder="Your name" /></label>
        <label><span className="glaze-label">WhatsApp number</span><input required inputMode="tel" value={checkout.whatsapp} onChange={(event) => updateCheckout({ whatsapp: event.target.value })} className="glaze-field" placeholder="For delivery updates" /></label>
        <label className="sm:col-span-2"><span className="glaze-label">Email <em className="normal-case tracking-normal">(optional)</em></span><input type="email" value={checkout.email} onChange={(event) => updateCheckout({ email: event.target.value })} className="glaze-field" placeholder="For your order receipt" /></label>
      </div></section>
      <section className="mt-8 border-t border-[var(--cocoa)]/10 pt-7"><div className="flex items-center justify-between"><h2 className="font-display text-2xl">Delivery or pickup</h2><div className="flex rounded-full border border-[var(--cocoa)]/15 p-1 text-[8px] font-semibold uppercase tracking-[.12em]"><button type="button" onClick={() => updateCheckout({ fulfilment: "DELIVERY" })} className={`rounded-full px-3 py-2 ${isDelivery ? "bg-[var(--cocoa)] text-white" : ""}`}>Delivery</button><button type="button" onClick={() => updateCheckout({ fulfilment: "PICKUP" })} className={`rounded-full px-3 py-2 ${!isDelivery ? "bg-[var(--cocoa)] text-white" : ""}`}>Pickup</button></div></div>
        {isDelivery ? <><button type="button" onClick={useLocation} className="mt-4 flex h-11 items-center gap-2 rounded-full border border-[var(--cocoa)]/20 px-4 text-[9px] font-semibold uppercase tracking-[.13em] hover:border-[var(--caramel)] hover:text-[var(--caramel)]"><LocateFixed size={15} /> Use current location</button>{locationMessage && <p className="mt-3 rounded-xl bg-white/60 px-3 py-2 text-xs leading-5 text-[var(--cocoa)]/65">{locationMessage}</p>}<div className="mt-4 grid gap-3"><label><span className="glaze-label">Address</span><textarea required value={checkout.address} onChange={(event) => updateCheckout({ address: event.target.value })} className="glaze-field min-h-[5.5rem] resize-none p-3" placeholder="House, street and landmark" /></label><div className="grid gap-3 sm:grid-cols-2"><label><span className="glaze-label">Area</span><input required value={checkout.area} onChange={(event) => updateCheckout({ area: event.target.value })} className="glaze-field" placeholder="Neighbourhood" /></label><label><span className="glaze-label">Pincode</span><input required inputMode="numeric" value={checkout.pincode} onChange={(event) => updateCheckout({ pincode: event.target.value })} className="glaze-field" placeholder="Pincode" /></label></div><label><span className="glaze-label">Delivery instructions <em className="normal-case tracking-normal">(optional)</em></span><input value={checkout.deliveryInstructions} onChange={(event) => updateCheckout({ deliveryInstructions: event.target.value })} className="glaze-field" placeholder="Gate code, landmark or other helpful detail" /></label></div></> : <p className="mt-4 rounded-xl bg-white/60 p-4 text-sm leading-6 text-[var(--cocoa)]/65">Pickup details and timing will be confirmed by Glaze Bakehouse after payment is verified.</p>}
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><label><span className="glaze-label">Preferred date</span><input required type="date" value={checkout.deliveryDate} onChange={(event) => updateCheckout({ deliveryDate: event.target.value })} className="glaze-field" /></label><label><span className="glaze-label">Preferred time</span><input required value={checkout.deliveryTime} onChange={(event) => updateCheckout({ deliveryTime: event.target.value })} className="glaze-field" placeholder="e.g. 4:00 – 6:00 pm" /></label></div>
      </section><button className="glaze-primary-button mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[9px] font-semibold uppercase tracking-[.16em]">Done <Check size={14} /></button>
    </form><OrderSummary /></div>}
    {step === "choice" && <section className="mx-auto max-w-2xl text-center"><p className="glaze-eyebrow text-[var(--caramel)]">One last choice</p><h1 className="mt-3 font-display text-5xl leading-[.9] tracking-[-.04em] md:text-6xl">Would you like to save this address?</h1><p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-[var(--cocoa)]/60">Your order details are safely held while you decide. An account is never required to checkout.</p><div className="mt-9 grid gap-4 sm:grid-cols-2"><Link href="/login?returnTo=%2Fcheckout%3Fstep%3Dchoice" className="rounded-[1.75rem] border border-[var(--cocoa)]/15 bg-[var(--cream-light)] p-6 text-left transition hover:-translate-y-1 hover:border-[var(--caramel)]"><LockKeyhole size={20} className="text-[var(--caramel)]" /><h2 className="mt-5 font-display text-3xl leading-none">Login to save address</h2><p className="mt-3 text-sm leading-6 text-[var(--cocoa)]/60">Sign in or create an account to keep this delivery address for next time.</p><span className="mt-6 block text-[9px] font-semibold uppercase tracking-[.14em] text-[var(--caramel)]">Go to login →</span></Link><button type="button" onClick={() => setStep("review")} className="rounded-[1.75rem] bg-[var(--cocoa)] p-6 text-left text-[var(--cream-light)] transition hover:-translate-y-1"><MapPin size={20} className="text-[var(--honey)]" /><h2 className="mt-5 font-display text-3xl leading-none">Checkout as guest</h2><p className="mt-3 text-sm leading-6 text-white/65">Continue straight to your order review. No account, password, or extra step needed.</p><span className="mt-6 block text-[9px] font-semibold uppercase tracking-[.14em] text-[var(--honey)]">Continue to checkout →</span></button></div><button type="button" onClick={() => setStep("details")} className="mt-6 text-[8px] font-semibold uppercase tracking-[.14em] text-[var(--cocoa)]/55 hover:text-[var(--caramel)]">Edit delivery details</button></section>}
    {step === "review" && <div className="grid gap-8 lg:grid-cols-[1fr_360px]"><section className="rounded-[2rem] border border-[var(--cocoa)]/10 bg-[var(--cream-light)] p-5 sm:p-8"><button type="button" onClick={() => setStep("choice")} className="mb-6 flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[.14em] text-[var(--cocoa)]/60"><ChevronLeft size={13} /> Back</button><p className="glaze-eyebrow text-[var(--caramel)]">Order review</p><h1 className="mt-3 font-display text-4xl md:text-5xl">Everything looks lovely.</h1><div className="mt-7 rounded-2xl bg-white/60 p-4"><p className="glaze-label">Delivery to</p><p className="mt-2 font-display text-xl">{checkout.fullName}</p><p className="mt-1 text-sm leading-6 text-[var(--cocoa)]/65">{checkout.fulfilment === "PICKUP" ? "Pickup from Glaze Bakehouse" : `${checkout.address}, ${checkout.area}, ${checkout.pincode}`}</p><p className="mt-1 text-sm text-[var(--cocoa)]/65">WhatsApp: {checkout.whatsapp}</p></div><label className="mt-6 block"><span className="glaze-label">Special notes / instructions</span><textarea value={checkoutNotes} onChange={(event) => setCheckoutNotes(event.target.value)} className="glaze-field mt-2 min-h-28 resize-none p-4" placeholder="e.g. Please write Happy Birthday Priya on the cake." /></label><div className="mt-6 rounded-2xl border border-[var(--caramel)]/20 bg-[#fff8ee] p-4 text-sm leading-6 text-[var(--cocoa)]/70"><p className="font-semibold text-[var(--cocoa)]">Pay securely with Razorpay.</p><p className="mt-1">Your total is calculated on the server, and the order is only confirmed after its payment signature is verified there.</p></div><button type="button" onClick={requestPayment} disabled={isPaymentProcessing} aria-busy={isPaymentProcessing} className="glaze-primary-button mt-5 flex h-12 w-full items-center justify-center rounded-full text-[9px] font-semibold uppercase tracking-[.16em] disabled:cursor-not-allowed disabled:opacity-60">{isPaymentProcessing ? "Processing payment…" : "Proceed to pay"}</button>{paymentMessage && <p role="status" className="mt-3 text-center text-sm leading-6 text-[var(--cocoa)]/65">{paymentMessage}</p>}</section><OrderSummary /></div>}
  </div></main><Footer /></>;
}

export default function CheckoutPage() {
  return <Suspense fallback={<main className="container-glaze min-h-screen py-24" />}><CheckoutContent /></Suspense>;
}
