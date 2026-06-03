/**
 * Query keys centralizadas para React Query.
 * Usar SIEMPRE estos keys para garantizar cache compartido.
 *
 * IMPORTANTE: No hardcodear ['profile', id] en ningún otro lugar.
 * Usar siempre queryKeys.profile(userId) para asegurar que
 * AdminRoute y AppLayout compartan el mismo cache.
 */
export const queryKeys = {
  profile: (id: string) => ['profile', id] as const,
  profiles: ['profiles'] as const,
  profilesList: (params: { page?: number; perPage?: number; search?: string; role?: string; country?: string; status?: string }) => ['profiles', 'list', params] as const,
  allProfilesLists: ['profiles', 'list'] as const,
  feedPosts: (userId?: string) => ['feedPosts', userId ?? 'anonymous'] as const,
  posts: (params: { page?: number; perPage?: number; search?: string }) => ['posts', params] as const,
}