import { useState, useEffect, useCallback } from "react"
import { usePosts } from "@/hooks/queries/usePosts"
import { useDeletePost } from "@/hooks/mutations/useDeletePost"
import { Search, Eye, Trash2, Image as ImageIcon, Video, Type, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from "lucide-react"
import TableSkeleton from "@/components/ui/TableSkeleton"
import EmptyState from "@/components/ui/EmptyState"
import PostDetailDrawer from "@/components/drawers/PostDetailDrawer"
import type { FeedPost } from "@/types/database"

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

const getMediaType = (mediaUrls: string[], mediaItems: any[]): 'photo' | 'video' | 'text' => {
  if (!mediaUrls || mediaUrls.length === 0) return 'text'
  const firstItem = mediaItems?.[0]
  if (firstItem?.type === 'video') return 'video'
  return 'photo'
}

const getContentExcerpt = (post: FeedPost): string => {
  return post.description || post.title || ''
}

const PostsPage = () => {
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<FeedPost | null>(null)
  const perPage = 10

  const debouncedSearch = useDebounce(searchInput, 300)

  const { data, isLoading, isFetching } = usePosts({
    page,
    perPage,
    search: debouncedSearch.length >= 2 ? debouncedSearch : undefined,
  })

  const deletePost = useDeletePost()

  const posts = data?.data ?? []
  const totalPages = data?.totalPages ?? 0
  const total = data?.total ?? 0

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    deletePost.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null)
    })
  }

  const typeIcon = (type: 'photo' | 'video' | 'text') => {
    if (type === 'photo') return <ImageIcon size={14} />
    if (type === 'video') return <Video size={14} />
    return <Type size={14} />
  }

  const getPageNumbers = useCallback(() => {
    const pages: (number | 'ellipsis')[] = []
    const total = totalPages
    const current = page
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > 3) pages.push('ellipsis')
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
      if (current < total - 2) pages.push('ellipsis')
      pages.push(total)
    }
    return pages
  }, [totalPages, page])

  return (
    <div className="p-6 space-y-4 ">
      <h1 className="font-display text-foreground text-[28px] uppercase tracking-tight">Publications</h1>

      <div className="flex flex-wrap gap-3 items-center sticky top-0 z-10 bg-background py-3 border-b border-border -mx-6 px-6">
        <div className="relative flex-1 min-w-[220px] max-w-[300px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-rx-text-muted" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Rechercher par contenu, auteur..."
            className="input-field w-full pl-9 pr-4 py-2.5"
          />
        </div>
      </div>

      <div className="card-surface p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="table-header text-left px-4 py-3">#</th>
                <th className="table-header text-left px-4 py-3">Auteur</th>
                <th className="table-header text-left px-4 py-3">Type</th>
                <th className="table-header text-left px-4 py-3">Extrait</th>
                <th className="table-header text-left px-4 py-3">Date</th>
                <th className="table-header text-left px-4 py-3">Likes</th>
                <th className="table-header text-left px-4 py-3">Com.</th>
                <th className="table-header text-left px-4 py-3">Statut</th>
                <th className="table-header text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton cols={9} rows={8} />
            ) : (
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <EmptyState icon="📸" title="Aucune publication trouvée" subtitle="Essayez de modifier vos filtres." />
                    </td>
                  </tr>
                ) : posts.map((post, index) => {
                  const contentType = getMediaType(post.media_urls, post.media_items)
                  const excerpt = getContentExcerpt(post)
                  const authorName = [post.author_first_name, post.author_last_name].filter(Boolean).join(' ') || 'Anonyme'
                  return (
                    <tr key={post.id} className="border-b border-[hsl(0_0%_100%/0.03)] hover:bg-rx-elevated transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-md bg-rx-elevated flex items-center justify-center text-rx-text-secondary">
                          {typeIcon(contentType)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {post.author_profile_photo_url ? (
                            <img src={post.author_profile_photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-rx-elevated flex items-center justify-center text-[11px] font-ui font-medium text-rx-text-secondary">
                              {(post.author_first_name?.[0] || post.author_last_name?.[0] || '?').toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-ui text-[13px] text-foreground whitespace-nowrap">{authorName}</div>
                            {post.author_role && <div className="font-mono-data text-[10px] text-rx-text-muted">{post.author_role}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="badge-pill">{contentType}</span></td>
                      <td className="px-4 py-3 font-ui text-[13px] text-rx-text-secondary max-w-[180px] truncate">
                        {excerpt || '—'}
                      </td>
                      <td className="px-4 py-3 font-mono-data text-xs text-rx-text-secondary">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td className="px-4 py-3 font-ui text-[13px] text-rx-text-secondary">
                        {post.likes_count.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-ui text-[13px] text-rx-text-secondary">
                        {post.comments_count.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge-pill">Actif</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => setSelectedPost(post)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-rx-elevated text-rx-text-secondary hover:text-foreground transition-colors">
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(post)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[hsl(0_72%_57%/0.08)] text-rx-danger transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-[13px] font-ui text-rx-text-secondary">
        <span>Page {page} sur {totalPages || 1} · {total} résultat{total !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-1">
          {isFetching && !isLoading && <Loader2 size={14} className="animate-spin text-rx-text-muted mr-2" />}
          <button
            disabled={page <= 1 || isLoading}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="w-8 h-8 flex items-center justify-center border border-border rounded-md hover:text-foreground hover:bg-rx-elevated transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft size={14} />
          </button>
          {getPageNumbers().map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-rx-text-muted">...</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                disabled={isLoading}
                className={`w-8 h-8 flex items-center justify-center border rounded-md font-medium text-[13px] transition-colors disabled:cursor-not-allowed ${page === p
                    ? 'border-rx-blue bg-rx-blue/10 text-rx-blue'
                    : 'border-border text-rx-text-secondary hover:text-foreground hover:bg-rx-elevated'
                  }`}>
                {p}
              </button>
            )
          )}
          <button
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage(p => p + 1)}
            className="w-8 h-8 flex items-center justify-center border border-border rounded-md hover:text-foreground hover:bg-rx-elevated transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {selectedPost && (
        <PostDetailDrawer
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onDeleted={() => setSelectedPost(null)}
        />
      )}

      {deleteTarget && (
        <>
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-40 animate-fade-in" onClick={() => setDeleteTarget(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] bg-rx-surface border border-border rounded-xl z-50 p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[hsl(0_47%_11%)] flex items-center justify-center">
                <AlertTriangle size={20} className="text-rx-danger" />
              </div>
              <h3 className="font-display text-lg text-foreground">Supprimer la publication</h3>
            </div>
            <p className="text-[13px] font-ui text-rx-text-secondary mb-6">
              Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-10 border border-border text-rx-text-secondary font-ui font-medium text-[13px] rounded-lg hover:text-foreground hover:bg-rx-elevated transition-colors">
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletePost.isPending}
                className="flex-1 h-10 bg-rx-danger text-foreground font-ui font-medium text-[13px] rounded-lg hover:bg-[hsl(0_47%_51%)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {deletePost.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Supprimer'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default PostsPage