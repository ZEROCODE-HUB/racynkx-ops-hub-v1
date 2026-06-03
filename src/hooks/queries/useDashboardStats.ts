import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '@/services/posts.service'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 2,
  })
}