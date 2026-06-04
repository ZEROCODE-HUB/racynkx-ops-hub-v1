import { useQuery } from '@tanstack/react-query'
import { getReports, type GetReportsOptions } from '@/services/reports.service'
import { queryKeys } from '@/lib/queryKeys'

export function useReports(options: GetReportsOptions = {}) {
    const { page = 1, perPage = 25, search, status, contentType, reason } = options

    return useQuery({
        queryKey: queryKeys.reportsList({ page, perPage, search, status, contentType, reason }),
        queryFn: () => getReports({ page, perPage, search, status, contentType, reason }),
        placeholderData: previousData => previousData,
        staleTime: 1000 * 60 * 2,
    })
}