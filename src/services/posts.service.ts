import { supabase } from '@/lib/supabase'
import type { FeedPost } from '@/types/database'

export interface GetFeedPostsOptions {
  cursor?: string | null
  limit?: number
  userId?: string
}

export interface GetFeedPostsResult {
  data: FeedPost[]
  nextCursor: string | null
  hasMore: boolean
}

export interface GetPostsOptions {
  page?: number
  perPage?: number
  search?: string
}

export interface GetPostsResult {
  data: FeedPost[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface PostStats {
  totalPosts: number
  newPostsThisWeek: number
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  totalPosts: number
  newPostsThisWeek: number
  totalEnterprises: number
  pendingReports: number
}

export async function getPostsStats(): Promise<PostStats> {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [totalResult, weekResult] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString()),
  ])

  return {
    totalPosts: totalResult.count || 0,
    newPostsThisWeek: weekResult.count || 0,
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date()
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

  const [usersResult, activeUsersResult, monthUsersResult, postsResult, enterprisesResult, reportsResult] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', oneMonthAgo.toISOString()),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'Entreprise'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return {
    totalUsers: usersResult.count || 0,
    activeUsers: activeUsersResult.count || 0,
    newUsersThisMonth: monthUsersResult.count || 0,
    totalPosts: postsResult.count || 0,
    newPostsThisWeek: postsResult.count || 0,
    totalEnterprises: enterprisesResult.count || 0,
    pendingReports: reportsResult.count || 0,
  }
}

export async function getFeedPosts(options: GetFeedPostsOptions = {}): Promise<GetFeedPostsResult> {
  const { cursor = null, limit = 20, userId } = options

  const { data, error } = await supabase.rpc('get_feed_posts_v4', {
    p_cursor: cursor ? new Date(cursor) : null,
    p_limit: limit,
    p_user_id: userId || null,
  })

  if (error) throw error

  const posts = data as FeedPost[]
  const nextCursor = posts.length > 0 ? posts[posts.length - 1].created_at : null

  return {
    data: posts,
    nextCursor,
    hasMore: posts.length === limit,
  }
}

export async function getPosts(options: GetPostsOptions = {}): Promise<GetPostsResult> {
  const { page = 1, perPage = 10, search } = options
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('posts')
    .select(`
      id,
      user_id,
      title,
      description,
      media_count,
      visibility,
      created_at,
      updated_at,
      likes_count,
      celebrations_count,
      public_id
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search && search.length >= 2) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) throw error

  const posts = data as any[]

  if (posts.length === 0) {
    return {
      data: [],
      total: count || 0,
      page,
      perPage,
      totalPages: 0,
    }
  }

  const userIds = [...new Set(posts.map(p => p.user_id))]

  const { data: profilesData } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, role, profile_photo_url, banner_photo_url, bio, city, country, followers_count, social_links, badge_name, experience_xp, subscription_status, selected_vcard_theme')
    .in('user_id', userIds)

  const profilesMap = new Map((profilesData || []).map((p: any) => [p.user_id, p]))

  const enrichedPosts: FeedPost[] = posts.map(p => {
    const profile = profilesMap.get(p.user_id) || {}
    return {
      ...p,
      author_first_name: profile.first_name || null,
      author_last_name: profile.last_name || null,
      author_role: profile.role || null,
      author_profile_photo_url: profile.profile_photo_url || null,
      author_banner_photo_url: profile.banner_photo_url || null,
      author_bio: profile.bio || null,
      author_city: profile.city || null,
      author_country: profile.country || null,
      author_followers_count: profile.followers_count || 0,
      author_social_links: profile.social_links || null,
      author_badge_name: profile.badge_name || null,
      author_experience_xp: profile.experience_xp || null,
      author_subscription_status: profile.subscription_status || null,
      author_selected_vcard_theme: profile.selected_vcard_theme || null,
      liked_by_me: false,
      celebrated_by_me: false,
      comments_count: 0,
      media_urls: [],
      media_items: [],
    } as FeedPost
  })

  const { data: mediaData } = await supabase
    .from('post_media')
    .select('post_id, media_url, media_type, thumbnail_url, order_index')
    .in('post_id', posts.map(p => p.id))
    .order('order_index', { ascending: true })

  const mediaMap = new Map<string, any[]>()
  ;(mediaData || []).forEach((m: any) => {
    if (!mediaMap.has(m.post_id)) mediaMap.set(m.post_id, [])
    mediaMap.get(m.post_id)!.push(m)
  })

  enrichedPosts.forEach(p => {
    const media = mediaMap.get(p.id) || []
    p.media_urls = media.map((m: any) => m.media_url).filter(Boolean)
    p.media_items = media.map((m: any) => ({
      url: m.media_url,
      type: m.media_type,
      thumbnail_url: m.thumbnail_url,
      order_index: m.order_index,
    }))
  })

  return {
    data: enrichedPosts,
    total: count || 0,
    page,
    perPage,
    totalPages: Math.ceil((count || 0) / perPage),
  }
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) throw error
}

export async function getPostById(postId: string): Promise<FeedPost | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .single()

  if (error) return null
  return data as FeedPost
}