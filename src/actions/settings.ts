'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getStoreSettingServer(key: string) {
  try {
    const setting = await prisma.storeSetting.findUnique({
      where: { key },
    });
    return setting?.value || null;
  } catch (error) {
    console.error(`Error fetching store setting ${key}:`, error);
    return null;
  }
}

export async function updateStoreSettingAction(key: string, value: string) {
  try {
    const setting = await prisma.storeSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    revalidatePath('/admin/settings');
    revalidatePath('/shop');
    return { success: true, data: setting };
  } catch (error: any) {
    console.error(`Error updating store setting ${key}:`, error);
    return { success: false, error: error.message || 'Failed to update setting' };
  }
}
