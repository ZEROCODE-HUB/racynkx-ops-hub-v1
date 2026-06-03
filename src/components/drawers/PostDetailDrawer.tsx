import { useState } from "react"
import type { FeedPost, MediaItem } from "@/types/database"
import { X, Heart, MessageCircle, Share2, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import { useDeletePost } from "@/hooks/mutations/useDeletePost"

interface Props {
  post: FeedPost
  onClose: () => void
  onDeleted?: () => void
}

const PostDetailDrawer = ({ post, onClose, onDeleted }: Props) => {
  const deletePost = useDeletePost()
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)

  const authorName = [post.author_first_name, post.author_last_name].filter(Boolean).join(' ') || 'Anonyme'
  const contentText = post.description || post.title || ''

  const mediaItems: MediaItem[] = post.media_items || []
  const activeMedia = mediaItems[activeMediaIndex]

  const handleDelete = () => {
    deletePost.mutate(post.id, {
      onSuccess: () => {
        onDeleted?.()
        onClose()
      }
    })
  }

  const goToPrevMedia = () => {
    setActiveMediaIndex(i => Math.max(0, i - 1))
  }

  const goToNextMedia = () => {
    setActiveMediaIndex(i => Math.min(mediaItems.length - 1, i + 1))
  }

  return (
    <>
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[520px] bg-rx-surface border-l border-border z-50 flex flex-col animate-slide-in-right">
        <div className="p-5 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="font-display text-xl text-foreground uppercase tracking-tight">Détail publication</h2>
          <button onClick={onClose} className="text-rx-text-secondary hover:text-foreground transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {mediaItems.length > 0 && (
            <div className="relative bg-black">
              <div className="aspect-video bg-rx-elevated flex items-center justify-center">
                {activeMedia?.type === 'video' ? (
                  <video
                    src={activeMedia.url || undefined}
                    controls
                    className="w-full h-full object-contain"
                    poster={activeMedia.thumbnail_url || undefined}
                  />
                ) : (
                  <img
                    src={activeMedia?.url || undefined}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {mediaItems.length > 1 && (
                <>
                  <button
                    onClick={goToPrevMedia}
                    disabled={activeMediaIndex === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={goToNextMedia}
                    disabled={activeMediaIndex === mediaItems.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>

                  <div className="p-3 flex gap-2 overflow-x-auto">
                    {mediaItems.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveMediaIndex(i)}
                        className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === activeMediaIndex ? 'border-rx-blue' : 'border-transparent'
                          }`}
                      >
                        {item.type === 'video' ? (
                          <div className="w-full h-full bg-rx-elevated flex items-center justify-center">
                            <video
                              src={item.url || undefined}
                              className="w-full h-full object-cover"
                              poster={item.thumbnail_url || undefined}
                            />
                          </div>
                        ) : (
                          <img
                            src={item.url || undefined}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="absolute bottom-20 right-3 px-2 py-1 rounded bg-black/60 text-white text-[11px] font-ui">
                    {activeMediaIndex + 1} / {mediaItems.length}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="p-5 space-y-4">
            {contentText && (
              <div className="card-elevated p-4">
                <p className="font-ui text-[13px] text-foreground leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                  {contentText}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              {post.author_profile_photo_url ? (
                <img src={post.author_profile_photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-rx-elevated flex items-center justify-center text-[11px] font-ui font-medium text-rx-text-secondary">
                  {(post.author_first_name?.[0] || post.author_last_name?.[0] || '?').toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-ui font-semibold text-[13px] text-foreground">{authorName}</div>
                <div className="flex items-center gap-2">
                  {post.author_role && <span className="badge-pill text-[10px]">{post.author_role}</span>}
                  <span className="font-mono-data text-[11px] text-rx-text-muted">
                    {post.created_at ? new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                </div>
              </div>
            </div>

            {post.author_bio && (
              <div className="card-elevated p-3">
                <p className="text-[12px] font-ui text-rx-text-secondary">{post.author_bio}</p>
              </div>
            )}

            <div className="flex gap-5 text-[13px] font-ui text-rx-text-secondary">
              <span className="flex items-center gap-1.5">
                <Heart size={14} className={post.liked_by_me ? 'fill-rx-danger text-rx-danger' : ''} />
                {post.likes_count.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle size={14} />
                {post.comments_count.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Share2 size={14} />
                {post.celebrations_count?.toLocaleString() || 0}
              </span>
            </div>

            <div className="text-[12px] font-ui text-rx-text-muted truncate">
              ID: <span className="font-mono-data">{String(post.id).slice(0, 8)}...</span>
              <span className="mx-2">·</span>
              Visibilité: {post.visibility}
              {post.public_id && (
                <>
                  <span className="mx-2">·</span>
                  Public ID: {post.public_id}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-3 shrink-0">
          <button
            onClick={handleDelete}
            disabled={deletePost.isPending}
            className="flex-1 h-10 bg-[hsl(0_47%_11%)] text-rx-danger font-ui font-medium text-[13px] rounded-lg hover:bg-[hsl(0_47%_15%)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {deletePost.isPending ? <RotateCcw size={14} className="animate-spin" /> : 'Supprimer la publication'}
          </button>
        </div>
      </div>
    </>
  )
}

export default PostDetailDrawer