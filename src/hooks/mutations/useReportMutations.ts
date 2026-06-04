import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateReportDecision } from '@/services/reports.service'
import { queryKeys } from '@/lib/queryKeys'

export function useUpdateReportDecision() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateReportDecision,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.allReportsLists })
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats })
            queryClient.refetchQueries({ queryKey: queryKeys.allReportsLists })
        },
    })
}