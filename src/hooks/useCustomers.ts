import { dataService } from '@/lib/dataService'
import useSWR from 'swr'

export function useCustomers() {
    const { data, error, mutate, isLoading } = useSWR('customers', dataService.getCustomers)

    return {
        customers: data || [],
        isLoading,
        isError: error,
        mutate
    }
}
