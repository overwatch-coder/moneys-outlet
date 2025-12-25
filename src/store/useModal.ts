import { type Product } from '../types/index'
import { create } from 'zustand'

interface ModalStore {
    selectedProduct: Product | null
    isProductModalOpen: boolean
    openProductModal: (product: Product) => void
    closeProductModal: () => void
}

export const useModal = create<ModalStore>((set) => ({
    selectedProduct: null,
    isProductModalOpen: false,
    openProductModal: (product) => set({ selectedProduct: product, isProductModalOpen: true }),
    closeProductModal: () => set({ selectedProduct: null, isProductModalOpen: false }),
}))
