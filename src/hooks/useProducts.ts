import { dataService } from '@/lib/dataService'
import useSWR from 'swr'

export function useProducts() {
    const { data, error, mutate, isLoading } = useSWR('products', dataService.getProducts)

    return {
        products: data || [],
        isLoading,
        isError: error,
        mutate
    }
}

export function useProduct(id: string) {
    const { data, error, mutate, isLoading } = useSWR(['product', id], () => dataService.getProductById(id))

    return {
        product: data,
        isLoading,
        isError: error,
        mutate
    }
}
