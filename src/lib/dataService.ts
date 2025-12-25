import { supabase } from '@/lib/supabase';
import type { Product, Category, Brand } from '@/types';

export const dataService = {
  // Products
  async getProducts() {
    const { data, error } = await supabase
      .from('product')
      .select('*, category:category(*), brand:brand(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('product')
      .select('*, category:category(*), brand:brand(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createProduct(product: Partial<Product>) {
    const { data, error } = await supabase
      .from('product')
      .insert([product])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, product: Partial<Product>) {
    const { data, error } = await supabase
      .from('product')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('product')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('category')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createCategory(category: Partial<Category>) {
    const { data, error } = await supabase
      .from('category')
      .insert([category])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, category: Partial<Category>) {
    const { data, error } = await supabase
      .from('category')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('category')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Brands
  async getBrands() {
    const { data, error } = await supabase
      .from('brand')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createBrand(brand: Partial<Brand>) {
    const { data, error } = await supabase
      .from('brand')
      .insert([brand])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateBrand(id: string, brand: Partial<Brand>) {
    const { data, error } = await supabase
      .from('brand')
      .update(brand)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteBrand(id: string) {
    const { error } = await supabase
      .from('brand')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Orders
  async getOrders() {
    const { data, error } = await supabase
      .from('order')
      .select('*, items:order_item(*, product:product(*))')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateOrderStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('order')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Customers
  async getCustomers() {
    const { data, error } = await supabase
      .from('customer')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async upsertCustomer(customer: { email: string; name?: string; phone?: string; address?: string }) {
    const { data, error } = await supabase
      .from('customer')
      .upsert(
        { ...customer, lastOrderDate: new Date().toISOString() },
        { onConflict: 'email' }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async placeOrder(orderData: { 
    customerName: string; 
    customerEmail: string; 
    customerPhone: string; 
    shippingAddress: string; 
    total: number;
    shippingFee: number;
    status?: string;
  }, items: any[]) {
    const { data, error } = await supabase.rpc('place_order', {
      p_customer_name: orderData.customerName,
      p_customer_email: orderData.customerEmail,
      p_customer_phone: orderData.customerPhone,
      p_shipping_address: orderData.shippingAddress,
      p_total: orderData.total,
      p_shipping_fee: orderData.shippingFee,
      p_items: items
    });

    if (error) throw error;
    return data;
  },

  // Contact Messages
  async sendContactMessage(message: { name: string; email: string; subject?: string; message: string }) {
    const { data, error } = await supabase
      .from('contact_message')
      .insert([message])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  
  async getContactMessages() {
    const { data, error } = await supabase
      .from('contact_message')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Notifications
  async getNotifications() {
     const { data, error } = await supabase
      .from('admin_notification')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async markNotificationAsRead(id: string) {
    const { data, error } = await supabase
      .from('admin_notification')
      .update({ isRead: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markAllNotificationsAsRead() {
    const { data, error } = await supabase
      .from('admin_notification')
      .update({ isRead: true })
      .eq('isRead', false)
      .select();
    if (error) throw error;
    return data;
  },

  async deleteNotification(id: string) {
    const { error } = await supabase
      .from('admin_notification')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async deleteContactMessage(id: string) {
    const { error } = await supabase
      .from('contact_message')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};
