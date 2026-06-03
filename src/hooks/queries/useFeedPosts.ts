import { useInfiniteQuery } from '@tanstack/react-query'
import { getFeedPosts, type GetFeedPostsOptions } from '@/services/posts.service'
import { queryKeys } from '@/lib/queryKeys'

export function useFeedPosts(options: GetFeedPostsOptions = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.feedPosts(options.userId),
    queryFn: ({ pageParam }) => getFeedPosts({ ...options, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
  })
}