import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
    id: string
    name: string
    price: number
    image: string
    quantity: number
    size?: string
    color?: string
}

interface CartStore {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: string, size?: string, color?: string) => void
    updateQuantity: (id: string, quantity: number, size?: string, color?: string) => void
    clearCart: () => void
    totalItems: () => number
    totalPrice: () => number
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (newItem) => {
                const items = get().items
                const existingItem = items.find(
                    (item) =>
                        item.id === newItem.id &&
                        item.size === newItem.size &&
                        item.color === newItem.color
                )

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.id === newItem.id &&
                                item.size === newItem.size &&
                                item.color === newItem.color
                                ? { ...item, quantity: item.quantity + newItem.quantity }
                                : item
                        ),
                    })
                } else {
                    set({ items: [...items, newItem] })
                }
            },
            removeItem: (id, size, color) => {
                set({
                    items: get().items.filter(
                        (item) => !(item.id === id && item.size === size && item.color === color)
                    ),
                })
            },
            updateQuantity: (id, quantity, size, color) => {
                set({
                    items: get().items.map((item) =>
                        item.id === id && item.size === size && item.color === color
                            ? { ...item, quantity: Math.max(1, quantity) }
                            : item
                    ),
                })
            },
            clearCart: () => set({ items: [] }),
            totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        }),
        {
            name: 'cart-storage',
        }
    )
)
