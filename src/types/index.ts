export interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  defaultImage?: string | null;
  promoPercentage?: number | null;
  description?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  images: string[];
  colors: string[];
  sizes: string[];
  categoryId: string;
  category?: Category;
  brandId: string;
  brand?: Brand;
  isFeatured: boolean;
  isNewArrival: boolean;
  isPromotion: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  size?: string | null;
  color?: string | null;
  quantity: number;
  price: number;
  total: number;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string;
  readableId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  total: number;
  shippingFee: number;
  status: OrderStatus;
  items?: OrderItem[];
  createdAt: string | Date;
  created_at?: string | Date;
  updatedAt?: string | Date;
}

export interface Customer {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  address?: string | null;
  lastOrderDate?: string | Date | null;
  createdAt: string | Date;
  created_at?: string | Date;
}

export interface StoreSetting {
  id: string;
  key: string;
  value: string;
  updatedAt: string | Date;
}

export interface FooterLink {
  name: string;
  url: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  status: 'UNREAD' | 'READ' | 'REPLIED' | string;
  createdAt?: string | Date;
  created_at?: string | Date;
}

export interface AdminNotification {
  id: string;
  type: string;
  referenceId?: string | null;
  message: string;
  isRead: boolean;
  createdAt?: string | Date;
  created_at?: string | Date;
}
