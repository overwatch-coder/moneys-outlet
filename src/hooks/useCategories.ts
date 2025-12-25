import { dataService } from '@/lib/dataService'
import useSWR from 'swr'

export function useCategories() {
    const { data, error, mutate, isLoading } = useSWR('categories', dataService.getCategories)

    return {
        categories: data || [],
        isLoading,
        isError: error,
        mutate
    }
}
