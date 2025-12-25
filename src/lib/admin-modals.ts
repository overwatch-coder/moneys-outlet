import { create } from "zustand";

interface AdminModalStore {
  isAddProductOpen: boolean;
  openAddProduct: () => void;
  closeAddProduct: () => void;
  
  // You can add more global admin modals here if needed
}

export const useAdminModals = create<AdminModalStore>((set) => ({
  isAddProductOpen: false,
  openAddProduct: () => set({ isAddProductOpen: true }),
  closeAddProduct: () => set({ isAddProductOpen: false }),
}));
