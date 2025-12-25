import useSWR from 'swr'
import api from '@/lib/axios'

const fetcher = (url: string) => api.get(url).then((res) => res.data)

export function useFetch<T>(url: string | null) {
    const { data, error, mutate, isValidating } = useSWR<T>(url, fetcher)

    return {
        data,
        isLoading: !error && !data,
        isError: error,
        mutate,
        isValidating
    }
}
