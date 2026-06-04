import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/services/posts.service'
import { queryKeys } from '@/lib/queryKeys'

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 2,
  })
}