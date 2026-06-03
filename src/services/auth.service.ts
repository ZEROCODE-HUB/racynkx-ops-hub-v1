import { supabase } from '@/lib/supabase'
import type { AuthError } from '@supabase/supabase-js'

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getCurrentSession() {
  return supabase.auth.getSession()
}

export async function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}