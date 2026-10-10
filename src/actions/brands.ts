'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getBrandsServer() {
  try {
    return await prisma.brand.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

export async function createBrandAction(data: {
  name: string;
  logoUrl: string;
  defaultImage?: string | null;
  promoPercentage?: number | null;
  description?: string | null;
}) {
  try {
    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        logoUrl: data.logoUrl,
        defaultImage: data.defaultImage,
        promoPercentage: data.promoPercentage,
        description: data.description,
      },
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/brands');

    return { success: true, data: brand };
  } catch (error: any) {
    console.error('Error creating brand:', error);
    return { success: false, error: error.message || 'Failed to create brand' };
  }
}

export async function updateBrandAction(
  id: string,
  data: Partial<{
    name: string;
    logoUrl: string;
    defaultImage: string | null;
    promoPercentage: number | null;
    description: string | null;
  }>
) {
  try {
    const brand = await prisma.brand.update({
      where: { id },
      data,
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/brands');

    return { success: true, data: brand };
  } catch (error: any) {
    console.error('Error updating brand:', error);
    return { success: false, error: error.message || 'Failed to update brand' };
  }
}

export async function deleteBrandAction(id: string) {
  try {
    await prisma.brand.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/brands');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting brand:', error);
    return { success: false, error: error.message || 'Failed to delete brand' };
  }
}
