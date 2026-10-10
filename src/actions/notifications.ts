'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getNotificationsServer() {
  try {
    return await prisma.adminNotification.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return [];
  }
}

export async function markNotificationAsReadAction(id: string) {
  try {
    const updated = await prisma.adminNotification.update({
      where: { id },
      data: { isRead: true },
    });

    revalidatePath('/admin/notifications');
    revalidatePath('/admin');
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    await prisma.adminNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });

    revalidatePath('/admin/notifications');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteNotificationAction(id: string) {
  try {
    await prisma.adminNotification.delete({
      where: { id },
    });

    revalidatePath('/admin/notifications');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return { success: false, error: error.message };
  }
}
