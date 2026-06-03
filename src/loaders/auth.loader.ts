import { redirect } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export async function authLoader() {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    throw redirect('/login')
  }

  return { user: session.user }
}