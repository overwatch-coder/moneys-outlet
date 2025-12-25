import { dataService } from '@/lib/dataService'
import useSWR from 'swr'

export function useOrders() {
    const { data, error, mutate, isLoading } = useSWR('orders', dataService.getOrders)

    return {
        orders: data || [],
        isLoading,
        isError: error,
        mutate
    }
}
