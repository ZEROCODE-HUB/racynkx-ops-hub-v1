import { useState, useMemo } from "react";
import { mockPosts } from "@/data/mockData";
import type { Post } from "@/data/mockData";
import PostDetailDrawer from "@/components/drawers/PostDetailDrawer";
import { Search, Eye, Trash2, Image as ImageIcon, Video, Type } from "lucide-react";

const PostsPage = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const perPage = 25;

  const filtered = useMemo(() => {
    return mockPosts.filter(p => {
      if (search.length >= 3 && !p.text.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter && p.content_type !== typeFilter) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      return true;
    });
  }, [search, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const typeIcon = (t: string) => {
    if (t === 'photo') return <ImageIcon size={14} />;
    if (t === 'video') return <Video size={14} />;
    return <Type size={14} />;
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="font-display text-foreground text-3xl uppercase">Publications</h1>

      <div className="flex flex-wrap gap-3 items-center sticky top-0 z-10 bg-background py-3 border-b border-border -mx-6 px-6">
        <div className="relative flex-1 min-w-[240px] max-w-[320px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rx-text-muted" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par contenu…" className="input-field w-full pl-10 pr-4 py-2 text-sm" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="input-field px-3 py-2 text-sm">
          <option value="">Tous types</option>
          <option value="photo">Photo</option>
          <option value="video">Vidéo</option>
          <option value="text">Texte</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field px-3 py-2 text-sm">
          <option value="">Tous statuts</option>
          <option value="active">Actif</option>
          <option value="reported">Signalé</option>
          <option value="deleted">Supprimé</option>
        </select>
      </div>

      <div className="card-surface p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(0_0%_100%/0.1)]">
                {['', 'Auteur', 'Type', 'Extrait', 'Date', 'Likes', 'Com.', 'Signalements', 'Statut', ''].map(h => (
                  <th key={h} className="table-header text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(p => (
                <tr key={p.id} className={`border-b border-[hsl(0_0%_100%/0.03)] hover:bg-rx-elevated transition-colors ${p.status === 'deleted' ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-md bg-rx-elevated flex items-center justify-center text-rx-text-secondary">
                      {typeIcon(p.content_type)}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-ui text-sm text-foreground whitespace-nowrap">{p.author_name}</td>
                  <td className="px-4 py-3"><span className="badge-pill">{p.content_type}</span></td>
                  <td className="px-4 py-3 font-ui text-sm text-rx-text-secondary max-w-[200px] truncate">
                    <span className={p.status === 'deleted' ? 'line-through' : ''}>{p.text.slice(0, 60)}</span>
                  </td>
                  <td className="px-4 py-3 font-mono-data text-xs text-rx-text-secondary">{p.created_at}</td>
                  <td className="px-4 py-3 font-ui text-sm text-rx-text-secondary">{p.likes_count}</td>
                  <td className="px-4 py-3 font-ui text-sm text-rx-text-secondary">{p.comments_count}</td>
                  <td className="px-4 py-3 font-ui text-sm text-rx-text-secondary">{p.reports_count > 0 ? <span className="text-rx-warning">⚠ {p.reports_count}</span> : '—'}</td>
                  <td className="px-4 py-3">
                    {p.status === 'active' && <span className="badge-pill !text-rx-success">Actif</span>}
                    {p.status === 'reported' && <span className="badge-pill !text-rx-warning">⚠ Signalé</span>}
                    {p.status === 'deleted' && <span className="badge-pill !text-rx-danger">Supprimé</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setSelectedPost(p)}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-rx-elevated text-rx-text-secondary hover:text-foreground transition-colors">
                        <Eye size={14} />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-rx-elevated text-rx-danger transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm font-ui text-rx-text-secondary">
        <span>Page {page} sur {totalPages} · {filtered.length} résultats</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 border border-[hsl(0_0%_100%/0.15)] rounded text-sm disabled:opacity-30 hover:text-foreground transition-colors">Précédent</button>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 border border-[hsl(0_0%_100%/0.15)] rounded text-sm disabled:opacity-30 hover:text-foreground transition-colors">Suivant</button>
        </div>
      </div>

      {selectedPost && <PostDetailDrawer post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  );
};

export default PostsPage;
