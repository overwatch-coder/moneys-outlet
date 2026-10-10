'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function sendContactMessageAction(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  try {
    const msg = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject || null,
        message: data.message,
      },
    });

    await prisma.adminNotification.create({
      data: {
        type: 'CONTACT',
        referenceId: msg.id,
        message: `New message from ${data.name}: ${data.subject || 'Inquiry'}`,
      },
    });

    revalidatePath('/admin/messages');
    revalidatePath('/admin/notifications');

    return { success: true, data: msg };
  } catch (error: any) {
    console.error('Error sending contact message:', error);
    return { success: false, error: error.message || 'Failed to send message' };
  }
}

export async function getContactMessagesServer() {
  try {
    return await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return [];
  }
}

export async function deleteContactMessageAction(id: string) {
  try {
    await prisma.contactMessage.delete({
      where: { id },
    });

    revalidatePath('/admin/messages');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting contact message:', error);
    return { success: false, error: error.message };
  }
}
