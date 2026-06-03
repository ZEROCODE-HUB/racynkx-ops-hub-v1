import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/services/profile.service'
import { queryKeys } from '@/lib/queryKeys'

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: queryKeys.profile(userId ?? ''),
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}