import useSWR from 'swr'
import { Complaint } from './db'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useComplaints() {
    const { data, error, isLoading, mutate } = useSWR<Complaint[]>(
        '/api/complaints',
        fetcher,
        {
            dedupingInterval: 2000,
            revalidateOnFocus: false,
            revalidateOnMount: true,
            refreshInterval: 0,
        }
    );

    return {
        complaints: data,
        error,
        isLoading,
        mutate
    };
}

export function useComplaint(id: string) {
    const { data, error, isLoading, mutate } = useSWR<Complaint>(
        id ? `/api/complaints/${id}` : null,
        fetcher,
        {
            dedupingInterval: 2000,
            revalidateOnFocus: false,
            revalidateOnMount: true,
            refreshInterval: 0,
        }
    );

    return {
        complaint: data,
        error,
        isLoading,
        mutate
    };
}
