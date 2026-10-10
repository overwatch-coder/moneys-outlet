import {
  getProductsServer,
  getProductByIdServer,
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from '@/actions/products';
import {
  getCategoriesServer,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from '@/actions/categories';
import {
  getBrandsServer,
  createBrandAction,
  updateBrandAction,
  deleteBrandAction,
} from '@/actions/brands';
import {
  getOrdersServer,
  updateOrderStatusAction,
  placeOrderAction,
} from '@/actions/orders';
import { getCustomersServer } from '@/actions/customers';
import {
  sendContactMessageAction,
  getContactMessagesServer,
  deleteContactMessageAction,
} from '@/actions/contact';
import {
  getNotificationsServer,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  deleteNotificationAction,
} from '@/actions/notifications';
import { getStoreSettingServer, updateStoreSettingAction } from '@/actions/settings';
import type { Product, Category, Brand, OrderStatus } from '@/types';

export const dataService = {
  // Products
  async getProducts() {
    return (await getProductsServer()) as any[];
  },

  async getProductById(id: string) {
    return (await getProductByIdServer(id)) as any;
  },

  async createProduct(product: Partial<Product>) {
    const res = await createProductAction(product as any);
    if (!res.success) throw new Error(res.error);
    return res.data;
  },

  async updateProduct(id: string, product: Partial<Product>) {
    const res = await updateProductAction(id, product as any);
    if (!res.success) throw new Error(res.error);
    return res.data;
  },

  async deleteProduct(id: string) {
    const res = await deleteProductAction(id);
    if (!res.success) throw new Error(res.error);
  },

  // Categories
  async getCategories() {
    return (await getCategoriesServer()) as any[];
  },

  async createCategory(category: Partial<Category>) {
    const res = await createCategoryAction({
      name: category.name || '',
      slug: category.slug || (category.name || '').toLowerCase().replace(/\s+/g, '-'),
    });
    if (!res.success) throw new Error(res.error);
    return res.data;
  },

  async updateCategory(id: string, category: Partial<Category>) {
    const res = await updateCategoryAction(id, category as any);
    if (!res.success) throw new Error(res.error);
    return res.data;
  },

  async deleteCategory(id: string) {
    const res = await deleteCategoryAction(id);
    if (!res.success) throw new Error(res.error);
  },

  // Brands
  async getBrands() {
    return (await getBrandsServer()) as any[];
  },

  async createBrand(brand: Partial<Brand>) {
    const res = await createBrandAction({
      name: brand.name || '',
      logoUrl: brand.logoUrl || '',
      defaultImage: brand.defaultImage,
      promoPercentage: brand.promoPercentage,
      description: brand.description,
    });
    if (!res.success) throw new Error(res.error);
    return res.data;
  },

  async updateBrand(id: string, brand: Partial<Brand>) {
    const res = await updateBrandAction(id, brand as any);
    if (!res.success) throw new Error(res.error);
    return res.data;
  },

  async deleteBrand(id: string) {
    const res = await deleteBrandAction(id);
    if (!res.success) throw new Error(res.error);
  },

  // Orders
  async getOrders() {
    return (await getOrdersServer()) as any[];
  },

  async updateOrderStatus(id: string, status: OrderStatus | string) {
    const res = await updateOrderStatusAction(id, status as OrderStatus);
    if (!res.success) throw new Error(res.error);
    return res.data;
  },

  // Customers
  async getCustomers() {
    return (await getCustomersServer()) as any[];
  },

  // Order Placement (Atomic Transaction)
  async placeOrder(
    orderData: {
      customerName: string;
      customerEmail: string;
      customerPhone: string;
      shippingAddress: string;
      total: number;
      shippingFee: number;
      status?: string;
    },
    items: any[]
  ) {
    const res = await placeOrderAction(orderData, items);
    if (!res.success) throw new Error(res.error);
    return res.data;
  },

  // Contact Messages
  async sendContactMessage(message: { name: string; email: string; subject?: string; message: string }) {
    const res = await sendContactMessageAction(message);
    if (!res.success) throw new Error(res.error);
    return res.data;
  },

  async getContactMessages() {
    return (await getContactMessagesServer()) as any[];
  },

  async deleteContactMessage(id: string) {
    const res = await deleteContactMessageAction(id);
    if (!res.success) throw new Error(res.error);
  },

  // Notifications
  async getNotifications() {
    return (await getNotificationsServer()) as any[];
  },

  async markNotificationAsRead(id: string) {
    const res = await markNotificationAsReadAction(id);
    if (!res.success) throw new Error(res.error);
    return res.data;
  },

  async markAllNotificationsAsRead() {
    const res = await markAllNotificationsAsReadAction();
    if (!res.success) throw new Error(res.error);
  },

  async deleteNotification(id: string) {
    const res = await deleteNotificationAction(id);
    if (!res.success) throw new Error(res.error);
  },

  // Store Settings
  async getStoreSetting(key: string) {
    return await getStoreSettingServer(key);
  },

  async updateStoreSetting(key: string, value: string) {
    const res = await updateStoreSettingAction(key, value);
    if (!res.success) throw new Error(res.error);
    return res.data;
  },
};
