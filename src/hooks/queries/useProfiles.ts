import { useQuery } from '@tanstack/react-query'
import { getProfiles, type GetProfilesOptions } from '@/services/profile.service'
import { queryKeys } from '@/lib/queryKeys'

export function useProfiles(options: GetProfilesOptions = {}) {
  const { page = 1, perPage = 10, search, role, country, status, gender } = options

  return useQuery({
    queryKey: queryKeys.profilesList({ page, perPage, search, role, country, status, gender }),
    queryFn: () => getProfiles({ page, perPage, search, role, country, status, gender }),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2,
  })
}