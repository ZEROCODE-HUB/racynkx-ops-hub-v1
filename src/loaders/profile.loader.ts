import { redirect } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export async function profileLoader() {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    throw redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, account_role')
    .eq('user_id', session.user.id)
    .single()

  if (error || !profile) {
    throw redirect('/login?error=profile')
  }

  return { profile }
}