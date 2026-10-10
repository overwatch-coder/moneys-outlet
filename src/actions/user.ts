'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function updateUserEmailAction(currentPassword: string, newEmail: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return { success: false, error: 'User not found' };
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: 'Invalid current password' };
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { email: newEmail.toLowerCase().trim() },
    });

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Error updating email:', error);
    return { success: false, error: error.message || 'Failed to update email' };
  }
}

export async function changeUserPasswordAction(currentPassword: string, newPassword: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return { success: false, error: 'User not found' };
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: 'Invalid current password' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error changing password:', error);
    return { success: false, error: error.message || 'Failed to change password' };
  }
}
