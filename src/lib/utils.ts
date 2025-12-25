import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatPrice = (price: number) => {
  return "₵" + price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}