export interface Product {
    id: string
    name: string
    description: string
    price: number
    discountPrice?: number | null
    stock: number
    images: string[]
    colors: string[]
    sizes: string[]
    categoryId: string
    brandId: string
    brand: Brand
    isFeatured: boolean
    isNewArrival: boolean
    isPromotion: boolean
}

export interface Brand {
    id: string
    name: string
    logoUrl: string
    defaultImage?: string | null
    promoPercentage?: number | null
    description?: string
}

export interface Category {
    id: string
    name: string
    slug: string
}

export interface FooterLink {
    name: string
    url: string
}

export const TYPES_VERSION = '1.0'

export interface ContactMessage {
    id: string
    name: string
    email: string
    subject?: string
    message: string
    status: 'UNREAD' | 'READ' | 'REPLIED'
    created_at: string
}

export interface AdminNotification {
    id: string
    type: 'ORDER' | 'CONTACT'
    referenceId?: string
    message: string
    isRead: boolean
    created_at: string
}
