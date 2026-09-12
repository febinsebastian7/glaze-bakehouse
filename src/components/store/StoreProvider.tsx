"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { CartItem, DeliveryDetails, OrderRecord, OrderStatus, Product, ReviewRecord } from "@/types/product";

const CART_KEY = "glaze-cart";
const CHECKOUT_KEY = "glaze-checkout";

export const emptyDeliveryDetails: DeliveryDetails = {
  fulfilment: "DELIVERY",
  fullName: "",
  whatsapp: "",
  email: "",
  address: "",
  area: "",
  pincode: "",
  deliveryInstructions: "",
  deliveryDate: "",
  deliveryTime: "",
};

interface StoreContextValue {
  products: Product[];
  productsLoading: boolean;
  productsError: string;
  reviewsLoading: boolean;
  reviewsError: string;
  cart: CartItem[];
  cartCount: number;
  cartItems: Array<{ product: Product; quantity: number; specialInstructions?: string }>;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  cartOpen: boolean;
  checkout: DeliveryDetails;
  checkoutNotes: string;
  orders: OrderRecord[];
  reviews: ReviewRecord[];
  addToCart: (productId: string, quantity?: number, specialInstructions?: string) => void;
  setCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  updateCheckout: (changes: Partial<DeliveryDetails>) => void;
  setCheckoutNotes: (notes: string) => void;
  resetCheckout: () => void;
  refreshProducts: () => Promise<void>;
  refreshPublicReviews: () => Promise<void>;
  refreshAdminProducts: () => Promise<void>;
  refreshAdminOrders: () => Promise<void>;
  refreshAdminReviews: () => Promise<void>;
  upsertProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateReview: (reviewId: string, changes: Partial<ReviewRecord>) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function responseJson<T>(response: Response) {
  const body = await response.json().catch(() => ({})) as T & { message?: string };
  if (!response.ok) throw new Error(body.message ?? "The request could not be completed.");
  return body;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  // Server and first client render must agree. Restore browser-only drafts only
  // after hydration so a saved cart never causes a React hydration mismatch.
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkout, setCheckout] = useState<DeliveryDetails>(emptyDeliveryDetails);
  const [checkoutNotes, setCheckoutNotes] = useState("");
  const [storageRestored, setStorageRestored] = useState(false);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  const refreshProducts = useCallback(async () => {
    await Promise.resolve();
    setProductsLoading(true);
    setProductsError("");
    try {
      const fetched = await responseJson<Product[]>(await fetch("/api/products", { cache: "no-store" }));
      setProducts(fetched);
      setCart((current) => current.filter((item) => fetched.some((product) => product.id === item.productId && product.availability === "AVAILABLE")));
    } catch (error) {
      setProductsError(error instanceof Error ? error.message : "The catalogue could not be loaded.");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const refreshAdminProducts = useCallback(async () => {
    await Promise.resolve();
    setProductsLoading(true);
    setProductsError("");
    try {
      setProducts(await responseJson<Product[]>(await fetch("/api/admin/products", { cache: "no-store" })));
    } catch (error) {
      setProducts([]);
      setProductsError(error instanceof Error ? error.message : "Products could not be loaded.");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const refreshPublicReviews = useCallback(async () => {
    setReviewsLoading(true);
    setReviewsError("");
    try {
      setReviews(await responseJson<ReviewRecord[]>(await fetch("/api/reviews", { cache: "no-store" })));
    } catch (error) {
      setReviews([]);
      setReviewsError(error instanceof Error ? error.message : "Reviews could not be loaded.");
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const refreshAdminOrders = useCallback(async () => {
    setOrders(await responseJson<OrderRecord[]>(await fetch("/api/admin/orders", { cache: "no-store" })));
  }, []);

  const refreshAdminReviews = useCallback(async () => {
    setReviews(await responseJson<ReviewRecord[]>(await fetch("/api/admin/reviews", { cache: "no-store" })));
  }, []);

  useEffect(() => {
    const load = window.setTimeout(() => { void refreshProducts(); void refreshPublicReviews(); }, 0);
    return () => window.clearTimeout(load);
  }, [refreshProducts, refreshPublicReviews]);
  useEffect(() => {
    const restore = window.setTimeout(() => {
      const savedCheckout = readStored<{ details: DeliveryDetails; notes: string }>(CHECKOUT_KEY, { details: emptyDeliveryDetails, notes: "" });
      setCart(readStored<CartItem[]>(CART_KEY, []));
      setCheckout({ ...emptyDeliveryDetails, ...savedCheckout.details });
      setCheckoutNotes(savedCheckout.notes ?? "");
      setStorageRestored(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);
  useEffect(() => {
    if (storageRestored) window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, storageRestored]);
  useEffect(() => {
    if (storageRestored) window.localStorage.setItem(CHECKOUT_KEY, JSON.stringify({ details: checkout, notes: checkoutNotes }));
  }, [checkout, checkoutNotes, storageRestored]);

  const addToCart = useCallback((productId: string, quantity = 1, specialInstructions?: string) => {
    setCart((current) => {
      const found = current.find((item) => item.productId === productId);
      if (found) return current.map((item) => item.productId === productId ? { ...item, quantity: Math.min(20, item.quantity + quantity), specialInstructions: specialInstructions ?? item.specialInstructions } : item);
      return [...current, { productId, quantity: Math.min(20, Math.max(1, quantity)), specialInstructions }];
    });
    setCartOpen(true);
  }, []);

  const setCartQuantity = useCallback((productId: string, quantity: number) => {
    setCart((current) => quantity < 1 ? current.filter((item) => item.productId !== productId) : current.map((item) => item.productId === productId ? { ...item, quantity: Math.min(20, quantity) } : item));
  }, []);

  const removeFromCart = useCallback((productId: string) => setCart((current) => current.filter((item) => item.productId !== productId)), []);
  const clearCart = useCallback(() => setCart([]), []);
  const updateCheckout = useCallback((changes: Partial<DeliveryDetails>) => setCheckout((current) => ({ ...current, ...changes })), []);
  const resetCheckout = useCallback(() => { setCheckout(emptyDeliveryDetails); setCheckoutNotes(""); }, []);
  const upsertProduct = useCallback((product: Product) => setProducts((current) => [...current.filter((item) => item.id !== product.id), product].sort((left, right) => left.displayOrder - right.displayOrder)), []);
  const removeProduct = useCallback((productId: string) => { setProducts((current) => current.filter((item) => item.id !== productId)); setCart((current) => current.filter((item) => item.productId !== productId)); }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const result = await responseJson<{ order: OrderRecord }>(await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: orderId, status }) }));
    setOrders((current) => current.map((order) => order.id === result.order.id ? result.order : order));
  }, []);

  const updateReview = useCallback(async (reviewId: string, changes: Partial<ReviewRecord>) => {
    const result = await responseJson<ReviewRecord>(await fetch(`/api/admin/reviews/${encodeURIComponent(reviewId)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: changes.status, featured: changes.featured }) }));
    setReviews((current) => current.map((review) => review.id === result.id ? result : review));
  }, []);

  const deleteReview = useCallback(async (reviewId: string) => {
    const response = await fetch(`/api/admin/reviews/${encodeURIComponent(reviewId)}`, { method: "DELETE" });
    if (!response.ok) throw new Error((await response.json().catch(() => ({})) as { message?: string }).message ?? "Review could not be deleted.");
    setReviews((current) => current.filter((review) => review.id !== reviewId));
  }, []);

  const cartItems = useMemo(() => cart.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return product ? [{ product, quantity: item.quantity, specialInstructions: item.specialInstructions }] : [];
  }), [cart, products]);
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cartItems]);
  // Keep browser totals aligned with the server's current complimentary-delivery policy.
  const deliveryCharge = 0;
  const total = subtotal + deliveryCharge;

  const value = useMemo<StoreContextValue>(() => ({
    products, productsLoading, productsError, reviewsLoading, reviewsError, cart, cartCount: cart.reduce((sum, item) => sum + item.quantity, 0), cartItems, subtotal, deliveryCharge, total, cartOpen, checkout, checkoutNotes, orders, reviews,
    addToCart, setCartQuantity, removeFromCart, clearCart, setCartOpen, updateCheckout, setCheckoutNotes, resetCheckout, refreshProducts, refreshPublicReviews, refreshAdminProducts, refreshAdminOrders, refreshAdminReviews, upsertProduct, removeProduct, updateOrderStatus, updateReview, deleteReview,
  }), [products, productsLoading, productsError, reviewsLoading, reviewsError, cart, cartItems, subtotal, deliveryCharge, total, cartOpen, checkout, checkoutNotes, orders, reviews, addToCart, setCartQuantity, removeFromCart, clearCart, updateCheckout, resetCheckout, refreshProducts, refreshPublicReviews, refreshAdminProducts, refreshAdminOrders, refreshAdminReviews, upsertProduct, removeProduct, updateOrderStatus, updateReview, deleteReview]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
}
