import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteUser } from '@/services/user.service'
import { queryKeys } from '@/lib/queryKeys'

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId?: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allProfilesLists })
      queryClient.refetchQueries({ queryKey: queryKeys.allProfilesLists })
    },
  })
}
