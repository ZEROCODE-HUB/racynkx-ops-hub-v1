// TODO: Generar tipos automáticamente cuando tengas el project ID:
// npx supabase gen types typescript --project-id tu_project_id > src/types/database.ts

// Basado en tu schema actual de public.profiles
export interface Profile {
  user_id: string
  first_name: string | null
  last_name: string | null
  birth_date: string | null
  gender: string | null
  nationality: string | null
  country: string | null
  region: string | null
  city: string | null
  disciplines: string[] | null
  start_year: number | null
  profile_photo_url: string | null
  banner_photo_url: string | null
  bio: string | null
  social_links: Record<string, any> | null
  deactivated_at: string | null
  status: 'active' | 'disabled'
  role: string | null
  account_role: 'user' | 'admin' | null
  vcard_photo_url: string | null
  followers_count: number
  badge_name: string | null
  experience_xp: number | null
  selected_vcard_theme: string
  subscription_status: 'free' | 'pro' | 'enterprise'
  active_entitlement_id: string | null
  // Campos adicionales para el dashboard (pueden no existir aún en BD)
  created_at?: string
  user_type?: string
  country_flag?: string
  xp_score?: number
  disciplines_list?: string[]
}

export interface User {
  id: string
  email: string
  created_at: string
}

// Tipos temporales para módulos no implementados aún
export interface Post {
  id: string
  author_id: string
  author_name: string
  content_type: 'photo' | 'video' | 'text'
  text: string
  media_url: string | null
  likes_count: number
  comments_count: number
  shares_count: number
  reports_count: number
  status: 'active' | 'reported' | 'deleted'
  created_at: string
}

export interface FeedPost {
  id: string
  user_id: string
  title: string | null
  description: string | null
  media_count: number
  visibility: string
  created_at: string
  updated_at: string
  likes_count: number
  comments_count: number
  celebrations_count: number
  liked_by_me: boolean
  celebrated_by_me: boolean
  public_id: string | null
  media_urls: string[]
  media_items: MediaItem[]
  author_first_name: string | null
  author_last_name: string | null
  author_role: string | null
  author_profile_photo_url: string | null
  author_banner_photo_url: string | null
  author_bio: string | null
  author_city: string | null
  author_country: string | null
  author_followers_count: number
  author_social_links: Record<string, any> | null
  author_badge_name: string | null
  author_experience_xp: number | null
  author_subscription_status: string | null
  author_selected_vcard_theme: string | null
}

export interface MediaItem {
  url: string | null
  type: string | null
  thumbnail_url: string | null
  order_index: number
}

export interface Company {
  id: string
  name: string
  logo_url: string | null
  country: string
  country_flag: string
  city: string
  address: string
  phone: string
  created_at: string
  followers: number
  posts_count: number
  status: 'active' | 'blocked' | 'deleted'
  disciplines: string[]
}

export interface Report {
  id: string
  reporter_id: string
  reporter_name: string
  reported_user_id: string
  reported_user_name: string
  reported_user_email: string
  content_type: 'post' | 'comment' | 'profile'
  content_id: string
  content_preview: string
  reason: string
  free_text: string
  status: 'pending' | 'resolved_rejected' | 'resolved_deleted' | 'resolved_warned'
  created_at: string
  resolved_at: string | null
}