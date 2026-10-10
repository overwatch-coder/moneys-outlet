'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getCategoriesServer() {
  try {
    return await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function createCategoryAction(data: { name: string; slug: string }) {
  try {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/categories');

    return { success: true, data: category };
  } catch (error: any) {
    console.error('Error creating category:', error);
    return { success: false, error: error.message || 'Failed to create category' };
  }
}

export async function updateCategoryAction(id: string, data: { name?: string; slug?: string }) {
  try {
    const category = await prisma.category.update({
      where: { id },
      data,
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/categories');

    return { success: true, data: category };
  } catch (error: any) {
    console.error('Error updating category:', error);
    return { success: false, error: error.message || 'Failed to update category' };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await prisma.category.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/categories');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return { success: false, error: error.message || 'Failed to delete category' };
  }
}
