import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfile, updateProfileStatus, type Profile } from '@/services/profile.service'
import { queryKeys } from '@/lib/queryKeys'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<Profile> }) =>
      updateProfile(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allProfilesLists })
      queryClient.refetchQueries({ queryKey: queryKeys.allProfilesLists })
    },
  })
}

export function useUpdateProfileStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: 'active' | 'disabled' }) =>
      updateProfileStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allProfilesLists })
      queryClient.refetchQueries({ queryKey: queryKeys.allProfilesLists })
    },
  })
}