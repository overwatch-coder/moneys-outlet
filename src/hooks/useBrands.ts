import { dataService } from '@/lib/dataService'
import useSWR from 'swr'

export function useBrands() {
    const { data, error, mutate, isLoading } = useSWR('brands', dataService.getBrands)

    return {
        brands: data || [],
        isLoading,
        isError: error,
        mutate
    }
}
