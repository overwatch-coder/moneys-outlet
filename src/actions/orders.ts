'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { OrderStatus } from '@/types';

export async function getOrdersServer() {
  try {
    return await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function updateOrderStatusAction(id: string, status: OrderStatus) {
  try {
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    revalidatePath('/admin/orders');
    revalidatePath('/admin/dashboard');

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message || 'Failed to update order status' };
  }
}

export async function placeOrderAction(
  orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    total: number;
    shippingFee: number;
    status?: string;
  },
  items: Array<{
    productId: string;
    size?: string;
    color?: string;
    quantity: number;
    price: number;
  }>
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Upsert Customer if email provided
      const email = orderData.customerEmail?.trim();
      if (email) {
        await tx.customer.upsert({
          where: { email },
          update: {
            name: orderData.customerName,
            phone: orderData.customerPhone,
            address: orderData.shippingAddress,
            lastOrderDate: new Date(),
          },
          create: {
            email,
            name: orderData.customerName,
            phone: orderData.customerPhone,
            address: orderData.shippingAddress,
            lastOrderDate: new Date(),
          },
        });
      }

      // 2. Generate a readable order number
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

      // 3. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          shippingAddress: orderData.shippingAddress,
          total: orderData.total,
          shippingFee: orderData.shippingFee,
          status: 'PENDING',
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              size: item.size || null,
              color: item.color || null,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // 4. Update product stock
      for (const item of items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          }).catch((err) => {
            console.warn(`Could not decrement stock for product ${item.productId}:`, err);
          });
        }
      }

      // 5. Create Admin Notification
      await tx.adminNotification.create({
        data: {
          type: 'ORDER',
          referenceId: newOrder.id,
          message: `New order #${orderNumber} placed by ${orderData.customerName} for ₵${orderData.total}`,
        },
      });

      return newOrder;
    });

    try {
      revalidatePath('/admin/orders');
      revalidatePath('/admin/dashboard');
      revalidatePath('/admin/notifications');
    } catch {
      // Safe outside request lifecycle
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error placing order:', error);
    return { success: false, error: error.message || 'Failed to place order' };
  }
}
