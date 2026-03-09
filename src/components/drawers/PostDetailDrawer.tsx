import type { Post } from "@/data/mockData";
import { X, Heart, MessageCircle, Share2, Flag } from "lucide-react";

interface Props {
  post: Post;
  onClose: () => void;
}

const PostDetailDrawer = ({ post, onClose }: Props) => (
  <>
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-40" onClick={onClose} />
    <div className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-rx-surface border-l border-border z-50 flex flex-col animate-slide-in-right">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h2 className="font-display text-xl text-foreground uppercase">Détail publication</h2>
        <button onClick={onClose} className="text-rx-text-secondary hover:text-foreground"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {post.content_type !== 'text' && (
          <div className="w-full aspect-video rounded-xl bg-rx-elevated flex items-center justify-center text-rx-text-muted font-ui text-sm">
            {post.content_type === 'photo' ? '📷 Image' : '🎬 Vidéo'}
          </div>
        )}

        <div className="card-elevated p-4">
          <p className="font-ui text-sm text-foreground leading-relaxed">{post.text}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge-pill">Par: {post.author_name}</span>
          <span className="font-mono-data text-xs text-rx-text-muted">{post.created_at}</span>
        </div>

        <div className="flex gap-6 text-sm font-ui text-rx-text-secondary">
          <span className="flex items-center gap-1.5"><Heart size={14} /> {post.likes_count}</span>
          <span className="flex items-center gap-1.5"><MessageCircle size={14} /> {post.comments_count}</span>
          <span className="flex items-center gap-1.5"><Share2 size={14} /> {post.shares_count}</span>
          <span className="flex items-center gap-1.5"><Flag size={14} className={post.reports_count > 0 ? 'text-rx-warning' : ''} /> {post.reports_count}</span>
        </div>
      </div>

      <div className="p-4 border-t border-border flex gap-3">
        <button className="flex-1 h-11 bg-[hsl(0_47%_11%)] text-rx-danger font-display uppercase text-sm rounded-lg hover:bg-[hsl(0_47%_15%)] transition-colors">
          Supprimer la publication
        </button>
        {post.reports_count > 0 && (
          <button className="flex-1 h-11 border border-rx-warning text-rx-warning font-display uppercase text-sm rounded-lg hover:bg-[hsl(28_90%_65%/0.1)] transition-colors">
            Rejeter signalements
          </button>
        )}
      </div>
    </div>
  </>
);

export default PostDetailDrawer;
