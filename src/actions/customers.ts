'use server';

import { prisma } from '@/lib/prisma';

export async function getCustomersServer() {
  try {
    return await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}
