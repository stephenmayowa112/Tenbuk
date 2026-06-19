import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  getDoc
} from 'firebase/firestore';
import { Product, Order, ChatMessage, Dispute, Vendor, OrderStatus, EscrowStatus } from '../types';

// Default mock assets matching screenshots
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-zenith-anc',
    vendorId: 'vendor-electrotech',
    vendorName: 'ElectroTech Hub',
    categoryId: 'electronics',
    title: 'Zenith Pro Wireless ANC Headphones',
    description: 'Experience unparalleled audio clarity with the Zenith Pro Noise-Cancelling Headphones. Designed for audiophiles and daily commuters alike, these headphones deliver immersive sound while blocking out environmental distractions. Industry-leading Active Noise Cancellation (ANC), up to 40 hours of battery life on a single charge, high-fidelity audio with deep bass and crisp highs, and comfortable, ergonomic over-ear design.',
    price: 249.99,
    currency: 'USD',
    stockQty: 14,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'active',
    rating: 5,
    reviewsCount: 128,
    priceFloor: 210.00,
    brand: 'Zenith'
  },
  {
    id: 'prod-premium-wireless',
    vendorId: 'vendor-techhub',
    vendorName: 'TechHub Verified',
    categoryId: 'phones',
    title: 'Premium Wireless Headphones',
    description: 'Crisp audio quality with high comfort cushions and durable noise suppression features designed for on-the-go lifestyle.',
    price: 11000,
    currency: 'NGN',
    stockQty: 10,
    images: [
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'active',
    rating: 4.8,
    reviewsCount: 124,
    priceFloor: 9500
  },
  {
    id: 'prod-pro-fitness-watch',
    vendorId: 'vendor-gadgetstore',
    vendorName: 'GadgetStore Verified',
    categoryId: 'electronics',
    title: 'Pro Fitness Smartwatch',
    description: 'Comprehensive fitness tracking, heart rate sensor, oxygen level indicators and water-proof sleek frame.',
    price: 22500,
    currency: 'NGN',
    stockQty: 8,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'active',
    rating: 4.5,
    reviewsCount: 89,
    priceFloor: 20000
  },
  {
    id: 'prod-home-assistant',
    vendorId: 'vendor-audiovision',
    vendorName: 'AudioVision Verified',
    categoryId: 'electronics',
    title: 'Home Assistant Speaker',
    description: 'Control your smart appliances, ask questions, play music and manage your calendars using interactive voice controls.',
    price: 43000,
    currency: 'NGN',
    stockQty: 24,
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'active',
    rating: 4.7,
    reviewsCount: 45,
    priceFloor: 38000
  },
  {
    id: 'prod-sony-wh1000',
    vendorId: 'vendor-techhaven',
    vendorName: 'TechHaven',
    categoryId: 'electronics',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    description: 'Sony WH-1000XM5 wireless active noise cancelling headphones with industry leading voice clarity and exceptional audio response.',
    price: 348.00,
    currency: 'USD',
    stockQty: 15,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'active',
    rating: 5,
    reviewsCount: 94,
    priceFloor: 320.00
  },
  {
    id: 'prod-minimalist-wallet',
    vendorId: 'vendor-artisangoods',
    vendorName: 'ArtisanGoods',
    categoryId: 'fashion',
    title: 'Minimalist Leather Wallet',
    description: 'Genuine full-grain tanned leather wallet with credit card slots and extremely slim form factor.',
    price: 45.00,
    currency: 'USD',
    stockQty: 5,
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'active',
    rating: 4.9,
    reviewsCount: 19,
    priceFloor: 40.00
  },
  {
    id: 'prod-sigma-lens',
    vendorId: 'vendor-techhaven',
    vendorName: 'TechHaven',
    categoryId: 'electronics',
    title: 'Sigma 24-70mm f/2.8 DG DN Art Lens for Sony E',
    description: 'Premium portrait zoom lens with fast autofocus, high-contrast resolution and outstanding f/2.8 brightness.',
    price: 1099.00,
    currency: 'USD',
    stockQty: 3,
    images: [
      'https://images.unsplash.com/photo-1617005082133-548c4ae27f35?auto=format&fit=crop&q=80&w=600'
    ],
    status: 'active',
    rating: 5,
    reviewsCount: 22,
    priceFloor: 1000.00
  }
];

const DEFAULT_VENDORS: Vendor[] = [
  {
    id: 'vendor-electrotech',
    userId: 'user-electrotech-owner',
    storeName: 'ElectroTech Hub',
    storeSlug: 'electrotech-hub',
    description: 'Your reliable spot for premium headphones and sound machinery.',
    verified: true,
    performanceScore: 98,
    commissionPlanId: 'flat-8',
    createdAt: new Date('2024-01-10').toISOString()
  },
  {
    id: 'vendor-artisangoods',
    userId: 'user-artisan-owner',
    storeName: 'ArtisanGoods',
    storeSlug: 'artisan-goods',
    description: 'Exquisite genuine leather bags, wallets and accessories.',
    verified: true,
    performanceScore: 92,
    commissionPlanId: 'flat-8',
    createdAt: new Date('2024-02-15').toISOString()
  },
  {
    id: 'vendor-techhaven',
    userId: 'user-techhaven-owner',
    storeName: 'TechHaven',
    storeSlug: 'techhaven',
    description: 'Cameras, lenses, smart appliances and premium gadgets.',
    verified: true,
    performanceScore: 95,
    commissionPlanId: 'tiered-gold',
    createdAt: new Date('2024-02-28').toISOString()
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'TBK-8924-M',
    buyerId: 'buyer-jane-doe',
    vendorId: 'vendor-techhaven',
    vendorName: 'TechHaven',
    status: 'shipped',
    subtotal: 1099.00,
    shipping: 0,
    tax: 96.16,
    total: 1195.16,
    escrowStatus: 'held',
    escrowReleaseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    paymentRef: 'pay_ref_swift_991823',
    paymentMethod: 'card',
    createdAt: new Date('2026-06-17T09:30:00Z').toISOString(),
    shippingAddress: {
      firstName: 'Jane',
      lastName: 'Doe',
      streetAddress: '123 Market Lane, Apt 4B',
      city: 'Metropolis',
      state: 'New York',
      zipCode: '10001',
      phone: '+1 (555) 123-4567'
    }
  },
  {
    id: 'ORD-0921',
    buyerId: 'buyer-jane-doe',
    vendorId: 'vendor-artisangoods',
    vendorName: 'ArtisanGoods',
    status: 'processing',
    subtotal: 45.00,
    shipping: 12.50,
    tax: 0,
    total: 57.50,
    escrowStatus: 'held',
    escrowReleaseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    paymentRef: 'pay_ref_wal_91289',
    paymentMethod: 'bank_transfer',
    createdAt: new Date('2026-06-16T12:00:00Z').toISOString(),
    shippingAddress: {
      firstName: 'Jane',
      lastName: 'Doe',
      streetAddress: '123 Market Lane, Apt 4B',
      city: 'Metropolis',
      state: 'New York',
      zipCode: '10001',
      phone: '+234 81 2345 6789'
    }
  },
  {
    id: 'ORD-0920',
    buyerId: 'buyer-jane-doe',
    vendorId: 'vendor-electrotech',
    vendorName: 'ElectroTech Hub',
    status: 'processing',
    subtotal: 249.99,
    shipping: 0,
    tax: 0,
    total: 249.99,
    escrowStatus: 'held',
    escrowReleaseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    paymentRef: 'pay_ref_head_2291',
    paymentMethod: 'ussd',
    createdAt: new Date('2026-06-15T10:15:00Z').toISOString(),
    shippingAddress: {
      firstName: 'Jane',
      lastName: 'Doe',
      streetAddress: '123 Market Lane, Apt 4B',
      city: 'Metropolis',
      state: 'New York',
      zipCode: '10001',
      phone: '+1 (555) 123-4567'
    }
  },
  {
    id: 'ORD-0919',
    buyerId: 'buyer-jane-doe',
    vendorId: 'vendor-techhaven',
    vendorName: 'TechHaven',
    status: 'delivered',
    subtotal: 35.50,
    shipping: 0,
    tax: 0,
    total: 35.50,
    escrowStatus: 'released',
    escrowReleaseDate: new Date('2026-06-01').toISOString(),
    paymentRef: 'pay_ref_lamp_1120',
    paymentMethod: 'mobile_money',
    createdAt: new Date('2026-06-10T15:30:00Z').toISOString(),
    shippingAddress: {
      firstName: 'Jane',
      lastName: 'Doe',
      streetAddress: '123 Market Lane, Apt 4B',
      city: 'Metropolis',
      state: 'New York',
      zipCode: '10001',
      phone: '+1 (555) 123-4567'
    }
  }
];

const DEFAULT_DISPUTES: Dispute[] = [
  {
    id: 'disp-001',
    orderId: 'ORD-0920',
    raisedBy: 'buyer-jane-doe',
    raisedByName: 'Jane Doe',
    reason: 'Product received does not charge up. Requesting a replacements or escrow refund.',
    status: 'open',
    createdAt: new Date('2026-06-17T14:22:00Z').toISOString()
  }
];

const DEFAULT_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-initial-1',
    productId: 'prod-zenith-anc',
    senderId: 'vendor-electrotech',
    senderRole: 'ai_vendor',
    body: "Hello! I'm the AI agent for ElectroTech Hub. The current price of Zenith Pro Wireless ANC Headphones is $249.99. Are you looking to make an offer?",
    createdAt: new Date('2026-06-18T20:00:00Z').toISOString()
  },
  {
    id: 'msg-initial-2',
    productId: 'prod-zenith-anc',
    senderId: 'buyer-jane',
    senderRole: 'buyer',
    body: "Would you accept $220 if I buy it right now?",
    createdAt: new Date('2026-06-18T20:01:00Z').toISOString()
  },
  {
    id: 'msg-initial-3',
    productId: 'prod-zenith-anc',
    senderId: 'vendor-electrotech',
    senderRole: 'ai_vendor',
    body: "$220 is a bit too low, as this is a premium item already discounted. However, since you are ready to buy immediately, I can offer it to you for $235! How does that sound?",
    createdAt: new Date('2026-06-18T20:01:45Z').toISOString(),
    proposedPrice: 235.00,
    status: 'pending'
  }
];

// Helper to write/read localStorage fallback
function readLocal<T>(key: string, defaults: T[]): T[] {
  try {
    const data = localStorage.getItem(`tenbuk_${key}`);
    if (data) return JSON.parse(data);
    localStorage.setItem(`tenbuk_${key}`, JSON.stringify(defaults));
    return defaults;
  } catch (e) {
    return defaults;
  }
}

function writeLocal<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(`tenbuk_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

export const dbService = {
  // Products Operations
  async getProducts(): Promise<Product[]> {
    if (db) {
      try {
        const prodCol = collection(db, 'products');
        const querySnapshot = await getDocs(prodCol);
        if (!querySnapshot.empty) {
          const list: Product[] = [];
          querySnapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) });
          });
          return list;
        } else {
          // Empty in Firestore, seed it
          for (const item of DEFAULT_PRODUCTS) {
            const { id, ...data } = item;
            await setDoc(doc(db, 'products', id), data);
          }
          return DEFAULT_PRODUCTS;
        }
      } catch (error) {
        console.error("Firestore getProducts failed, falling back to local storage:", error);
      }
    }
    return readLocal<Product>('products', DEFAULT_PRODUCTS);
  },

  async saveProduct(product: Product): Promise<void> {
    if (db) {
      try {
        const { id, ...data } = product;
        await setDoc(doc(db, 'products', id), data);
      } catch (error) {
        console.error("Firestore saveProduct error:", error);
      }
    }
    const current = readLocal<Product>('products', DEFAULT_PRODUCTS);
    const index = current.findIndex(p => p.id === product.id);
    if (index !== -1) {
      current[index] = product;
    } else {
      current.push(product);
    }
    writeLocal<Product>('products', current);
  },

  async deleteProduct(productId: string): Promise<void> {
    const current = readLocal<Product>('products', DEFAULT_PRODUCTS);
    const updated = current.filter(p => p.id !== productId);
    writeLocal<Product>('products', updated);
  },

  // Orders Operations
  async getOrders(): Promise<Order[]> {
    if (db) {
      try {
        const orderCol = collection(db, 'orders');
        const querySnapshot = await getDocs(orderCol);
        if (!querySnapshot.empty) {
          const list: Order[] = [];
          querySnapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) });
          });
          return list;
        } else {
          // Seed orders
          for (const item of DEFAULT_ORDERS) {
            const { id, ...data } = item;
            await setDoc(doc(db, 'orders', id), data);
          }
          return DEFAULT_ORDERS;
        }
      } catch (error) {
        console.error("Firestore getOrders failed, falling back to local storage:", error);
      }
    }
    return readLocal<Order>('orders', DEFAULT_ORDERS);
  },

  async createOrder(order: Order): Promise<void> {
    if (db) {
      try {
        const { id, ...data } = order;
        await setDoc(doc(db, 'orders', id), data);
      } catch (error) {
        console.error("Firestore createOrder error:", error);
      }
    }
    const current = readLocal<Order>('orders', DEFAULT_ORDERS);
    current.unshift(order);
    writeLocal<Order>('orders', current);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, escrowStatus?: EscrowStatus): Promise<void> {
    if (db) {
      try {
        const updates: any = { status };
        if (escrowStatus) updates.escrowStatus = escrowStatus;
        await updateDoc(doc(db, 'orders', orderId), updates);
      } catch (error) {
        console.error("Firestore updateOrderStatus error:", error);
      }
    }
    const current = readLocal<Order>('orders', DEFAULT_ORDERS);
    const order = current.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      if (escrowStatus) order.escrowStatus = escrowStatus;
      writeLocal<Order>('orders', current);
    }
  },

  // Vendors operations
  async getVendors(): Promise<Vendor[]> {
    if (db) {
      try {
        const d = await getDocs(collection(db, 'vendors'));
        if (!d.empty) {
          const devs: Vendor[] = [];
          d.forEach((docSnap) => {
            devs.push({ id: docSnap.id, ...(docSnap.data() as Omit<Vendor, 'id'>) });
          });
          return devs;
        } else {
          for (const v of DEFAULT_VENDORS) {
            const { id, ...data } = v;
            await setDoc(doc(db, 'vendors', id), data);
          }
          return DEFAULT_VENDORS;
        }
      } catch (error) {
        console.error(error);
      }
    }
    return readLocal<Vendor>('vendors', DEFAULT_VENDORS);
  },

  async verifyVendor(vendorId: string, verified: boolean): Promise<void> {
    if (db) {
      try {
        await updateDoc(doc(db, 'vendors', vendorId), { verified });
      } catch (error) {
        console.error(error);
      }
    }
    const current = readLocal<Vendor>('vendors', DEFAULT_VENDORS);
    const v = current.find(item => item.id === vendorId);
    if (v) {
      v.verified = verified;
      writeLocal<Vendor>('vendors', current);
    }
  },

  // Chat message operations for AI negotiations
  async getChatMessages(productId: string): Promise<ChatMessage[]> {
    if (db) {
      try {
        const q = query(collection(db, 'chat_messages'), where('productId', '==', productId));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          const list: ChatMessage[] = [];
          qSnap.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<ChatMessage, 'id'>) });
          });
          return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        }
      } catch (error) {
        console.error(error);
      }
    }
    const current = readLocal<ChatMessage>('chat_messages', DEFAULT_CHAT_MESSAGES);
    return current.filter(m => m.productId === productId);
  },

  async addChatMessage(msg: ChatMessage): Promise<void> {
    if (db) {
      try {
        const { id, ...data } = msg;
        await setDoc(doc(db, 'chat_messages', id), data);
      } catch (error) {
        console.error(error);
      }
    }
    const current = readLocal<ChatMessage>('chat_messages', DEFAULT_CHAT_MESSAGES);
    current.push(msg);
    writeLocal<ChatMessage>('chat_messages', current);
  },

  async updateChatMessageStatus(msgId: string, status: 'accepted' | 'declined'): Promise<void> {
    if (db) {
      try {
        await updateDoc(doc(db, 'chat_messages', msgId), { status });
      } catch (error) {
        console.error(error);
      }
    }
    const current = readLocal<ChatMessage>('chat_messages', DEFAULT_CHAT_MESSAGES);
    const msg = current.find(m => m.id === msgId);
    if (msg) {
      msg.status = status;
      writeLocal<ChatMessage>('chat_messages', current);
    }
  },

  // Disputes operations
  async getDisputes(): Promise<Dispute[]> {
    if (db) {
      try {
        const querySnapshot = await getDocs(collection(db, 'disputes'));
        if (!querySnapshot.empty) {
          const list: Dispute[] = [];
          querySnapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Dispute, 'id'>) });
          });
          return list;
        }
      } catch (error) {
        console.error(error);
      }
    }
    return readLocal<Dispute>('disputes', DEFAULT_DISPUTES);
  },

  async raiseDispute(dispute: Dispute): Promise<void> {
    if (db) {
      try {
        const { id, ...data } = dispute;
        await setDoc(doc(db, 'disputes', id), data);
      } catch (error) {
        console.error(error);
      }
    }
    const current = readLocal<Dispute>('disputes', DEFAULT_DISPUTES);
    current.unshift(dispute);
    writeLocal<Dispute>('disputes', current);

    // Flag the order as disputed
    await this.updateOrderStatus(dispute.orderId, 'processing', 'disputed');
  },

  async resolveDispute(disputeId: string, orderId: string, outcome: 'refunded' | 'released'): Promise<void> {
    if (db) {
      try {
        await updateDoc(doc(db, 'disputes', disputeId), { 
          status: outcome === 'refunded' ? 'resolved_refunded' : 'resolved_released',
          resolvedBy: 'admin-1'
        });
      } catch (error) {
        console.error(error);
      }
    }
    const current = readLocal<Dispute>('disputes', DEFAULT_DISPUTES);
    const disp = current.find(d => d.id === disputeId);
    if (disp) {
      disp.status = outcome === 'refunded' ? 'resolved_refunded' : 'resolved_released';
      disp.resolvedBy = 'admin-1';
      writeLocal<Dispute>('disputes', current);
    }

    // Resolve order escrow status
    await this.updateOrderStatus(orderId, 'delivered', outcome === 'refunded' ? 'released' : 'released'); // Or custom status
    const orders = readLocal<Order>('orders', DEFAULT_ORDERS);
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.escrowStatus = outcome === 'refunded' ? 'released' : 'released'; // Funds returned or paid
      writeLocal<Order>('orders', orders);
    }
  }
};
