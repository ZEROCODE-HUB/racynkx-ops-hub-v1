import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

export interface PaginatedProfiles {
  data: Profile[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface GetProfilesOptions {
  page?: number
  perPage?: number
  search?: string
  role?: string
  country?: string
  status?: 'active' | 'disabled'
  gender?: string
}

export async function getProfiles(options: GetProfilesOptions = {}): Promise<PaginatedProfiles> {
  const { page = 1, perPage = 25, search, role, country, status, gender } = options
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('v_admin_profiles')
    .select('*', { count: 'exact' })
    .range(from, to)

  if (search && search.length >= 2) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,country.ilike.%${search}%`)
  }

  if (role) {
    query = query.eq('role', role)
  }

  if (country) {
    query = query.eq('country', country)
  }

  if (status) {
    query = query.eq('status', status)
  }

  if (gender) {
    query = query.eq('gender', gender)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: data as Profile[],
    total: count || 0,
    page,
    perPage,
    totalPages: Math.ceil((count || 0) / perPage)
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data as Profile
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data as Profile
}

export async function updateProfileStatus(userId: string, status: 'active' | 'disabled'): Promise<Profile | null> {
  const updates: Partial<Profile> = { status }
  if (status === 'disabled') {
    updates.deactivated_at = new Date().toISOString()
  } else {
    updates.deactivated_at = null
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data as Profile
}