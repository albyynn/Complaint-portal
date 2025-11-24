import useSWR from 'swr'
import { Complaint } from './db'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useComplaints() {
    const { data, error, isLoading, mutate } = useSWR<Complaint[]>('/api/complaints', fetcher, {
        dedupingInterval: 5000,
        revalidateOnFocus: false
    })

    return {
        complaints: data,
        isLoading,
        isError: error,
        mutate,
    }
}

export function useComplaint(id: string) {
    const { data, error, isLoading, mutate } = useSWR<Complaint>(id ? `/api/complaints/${id}` : null, fetcher, {
        dedupingInterval: 5000,
        revalidateOnFocus: false
    })

    return {
        complaint: data,
        isLoading,
        isError: error,
        mutate,
    }
}
