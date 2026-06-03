import { useQuery } from '@tanstack/react-query'
import { getPosts, type GetPostsOptions } from '@/services/posts.service'
import { queryKeys } from '@/lib/queryKeys'

export function usePosts(options: GetPostsOptions = {}) {
  const { page = 1, perPage = 10, search } = options

  return useQuery({
    queryKey: queryKeys.posts({ page, perPage, search }),
    queryFn: () => getPosts({ page, perPage, search }),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2,
  })
}