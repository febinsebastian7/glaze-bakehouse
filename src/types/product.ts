export type ProductCategory = "cake" | "dessert";

export type Availability = "AVAILABLE" | "SOLD_OUT" | "HIDDEN";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  /** Optional until the bakery uploads the real product photograph. */
  image?: string;
  imagePublicId?: string;
  category: ProductCategory;
  flavour?: string;
  size?: string;
  preparationTime?: string;
  availability: Availability;
  featured: boolean;
  freshToday: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  specialInstructions?: string;
}

export interface DeliveryDetails {
  fulfilment: "DELIVERY" | "PICKUP";
  fullName: string;
  whatsapp: string;
  email: string;
  address: string;
  area: string;
  pincode: string;
  deliveryInstructions: string;
  deliveryDate: string;
  deliveryTime: string;
  latitude?: number;
  longitude?: number;
}

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "ORDER_CONFIRMED"
  | "PREPARING"
  | "BAKING"
  | "PACKED"
  | "OUT_FOR_DELIVERY"
  | "READY_FOR_PICKUP"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderLine {
  productId: string;
  productName: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  selectedOptions?: Record<string, string>;
}

export interface OrderRecord {
  id: string;
  trackingToken?: string;
  orderNumber: string;
  customer: Pick<DeliveryDetails, "fullName" | "whatsapp" | "email">;
  delivery: DeliveryDetails;
  items: OrderLine[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  specialNotes?: string;
  paymentStatus: PaymentStatus;
  paymentProvider?: "RAZORPAY";
  paymentId?: string;
  paymentVerifiedAt?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  orderId?: string;
  customerName: string;
  rating: number;
  originalText: string;
  cleanedText?: string;
  cleanupProvider?: string;
  image?: string;
  displayName?: string;
  consentToDisplayPhoto: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  featured: boolean;
  createdAt: string;
}
