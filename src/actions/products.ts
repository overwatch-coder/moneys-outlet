'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getProductsServer() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        brand: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductByIdServer(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
      },
    });
    return product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

export async function createProductAction(data: {
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  images: string[];
  colors: string[];
  sizes: string[];
  categoryId: string;
  brandId: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isPromotion?: boolean;
}) {
  try {
    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        discountPrice: data.discountPrice,
        stock: data.stock,
        images: data.images,
        colors: data.colors,
        sizes: data.sizes,
        categoryId: data.categoryId,
        brandId: data.brandId,
        isFeatured: data.isFeatured ?? false,
        isNewArrival: data.isNewArrival ?? false,
        isPromotion: data.isPromotion ?? false,
      },
      include: {
        category: true,
        brand: true,
      },
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/products');
    revalidatePath('/admin/dashboard');

    return { success: true, data: newProduct };
  } catch (error: any) {
    console.error('Error creating product:', error);
    return { success: false, error: error.message || 'Failed to create product' };
  }
}

export async function updateProductAction(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    discountPrice?: number | null;
    stock: number;
    images: string[];
    colors: string[];
    sizes: string[];
    categoryId: string;
    brandId: string;
    isFeatured: boolean;
    isNewArrival: boolean;
    isPromotion: boolean;
  }>
) {
  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        brand: true,
      },
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/products');
    revalidatePath('/admin/dashboard');

    return { success: true, data: updatedProduct };
  } catch (error: any) {
    console.error('Error updating product:', error);
    return { success: false, error: error.message || 'Failed to update product' };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/admin/products');
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return { success: false, error: error.message || 'Failed to delete product' };
  }
}
