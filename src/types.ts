export type UserRole = 'buyer' | 'vendor' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  verified: boolean;
  performanceScore: number;
  commissionPlanId: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export interface Product {
  id: string;
  vendorId: string;
  vendorName: string;
  categoryId: string;
  title: string;
  description: string;
  price: number; // Stored in USD or default NGN (we will handle display conversions)
  currency: 'USD' | 'NGN';
  stockQty: number;
  images: string[];
  status: 'active' | 'out_of_stock' | 'draft';
  rating: number;
  reviewsCount: number;
  priceFloor?: number; // Minimum acceptable price for automatic AI negotiations
  brand?: string;
}

export type EscrowStatus = 'held' | 'released' | 'disputed';
export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  buyerId: string;
  vendorId: string;
  vendorName: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  escrowStatus: EscrowStatus;
  escrowReleaseDate: string; // 14 working days window
  paymentRef: string;
  paymentMethod?: string;
  createdAt: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  productTitle: string;
  productImage: string;
}

export interface Review {
  id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  productId: string; // Dynamic message linked to bargaining a product
  senderId: string;
  senderRole: 'buyer' | 'ai_vendor' | 'vendor';
  body: string;
  createdAt: string;
  proposedPrice?: number;
  status?: 'pending' | 'accepted' | 'declined';
}

export interface Dispute {
  id: string;
  orderId: string;
  raisedBy: string; // buyerId
  raisedByName: string;
  reason: string;
  status: 'open' | 'resolved_refunded' | 'resolved_released';
  resolvedBy?: string; // admin user ID
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  processor: 'Paystack' | 'Flutterwave';
  processorRef: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  method: 'card' | 'bank_transfer' | 'ussd' | 'mobile_money';
  createdAt: string;
}
