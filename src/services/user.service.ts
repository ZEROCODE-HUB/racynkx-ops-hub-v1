import { supabase } from '@/lib/supabase'

export async function deleteUser(userId?: string): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession()
  const accessToken = sessionData.session?.access_token

  if (!accessToken) {
    throw new Error('No se encontró una sesión activa')
  }

  const { data, error } = await supabase.functions.invoke('deleteUser', {
    body: userId ? { userId } : {},
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (error) {
    throw new Error(error.message || 'Error al eliminar el usuario')
  }
}
