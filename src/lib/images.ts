/**
 * Image helper utility for Money's Outlet.
 * Ensures image URLs work consistently across:
 * - Local development (http://localhost:3000 or 3001)
 * - Vercel preview deployments (https://*.vercel.app)
 * - Production custom domains
 * - Vercel Blob CDN (https://*.public.blob.vercel-storage.com)
 */

const BLOB_BASE = 'https://eidlqojhxhr24tg7.public.blob.vercel-storage.com';

export function normalizeImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return '/images/jordan_4_cement.jpg';
  }

  const cleanUrl = url.trim();

  // If already a valid Vercel Blob or external HTTPS URL, return directly
  if (cleanUrl.startsWith('https://') || cleanUrl.startsWith('http://') && !cleanUrl.includes('localhost')) {
    return cleanUrl;
  }

  // If it contains a hardcoded localhost URL, strip host to maintain portability
  if (cleanUrl.includes('localhost:') || cleanUrl.includes('127.0.0.1:')) {
    try {
      const parsed = new URL(cleanUrl);
      return parsed.pathname + parsed.search;
    } catch {
      // Fall through
    }
  }

  // Ensure root-relative paths start with /
  if (!cleanUrl.startsWith('/')) {
    return `/${cleanUrl}`;
  }

  return cleanUrl;
}

export function getVercelBlobUrl(filename: string, folder: 'products' | 'logos' = 'products'): string {
  const cleanName = filename.replace(/^\/+/, '').replace(/^(products|logos|images)\//, '');
  return `${BLOB_BASE}/${folder}/${cleanName}`;
}
