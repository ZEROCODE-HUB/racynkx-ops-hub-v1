import { useState, useMemo, useEffect } from "react";
import { mockUsers, USER_TYPES, DISCIPLINES } from "@/data/mockData";
import type { User } from "@/data/mockData";
import UserDetailDrawer from "@/components/drawers/UserDetailDrawer";
import { BlockModal, DeleteModal } from "@/components/ui/ConfirmModal";
import TableSkeleton from "@/components/ui/TableSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import { Search, Download, Eye, Pencil, Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";

const UsersPage = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit'>('view');
  const [blockTarget, setBlockTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const perPage = 25;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    return mockUsers.filter(u => {
      if (search.length >= 3) {
        const s = search.toLowerCase();
        if (!`${u.first_name} ${u.last_name} ${u.city}`.toLowerCase().includes(s)) return false;
      }
      if (typeFilter && u.user_type !== typeFilter) return false;
      if (statusFilter && u.status !== statusFilter) return false;
      if (disciplineFilter && !u.disciplines.includes(disciplineFilter)) return false;
      return true;
    });
  }, [search, typeFilter, statusFilter, disciplineFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleExportCSV = () => {
    const headers = ['Prénom', 'Nom', 'Type', 'Email', 'Pays', 'Ville', 'XP', 'Statut', 'Inscrit le'];
    const rows = filtered.map(u => [u.first_name, u.last_name, u.user_type, u.email, u.country, u.city, u.xp_score, u.status, u.created_at]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'racynkx_users.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV téléchargé.');
  };

  return (
    <div className="p-6 space-y-4 max-w-[1400px]">
      <h1 className="font-display text-foreground text-[28px] uppercase tracking-tight">Utilisateurs</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center sticky top-0 z-10 bg-background py-3 border-b border-border -mx-6 px-6">
        <div className="relative flex-1 min-w-[220px] max-w-[300px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-rx-text-muted" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par nom, ville…"
            className="input-field w-full pl-9 pr-4 py-2.5" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="input-field px-3 py-2.5 min-w-[150px]">
          <option value="">Type</option>
          {USER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field px-3 py-2.5">
          <option value="">Statut</option>
          <option value="active">Actif</option>
          <option value="blocked">Bloqué</option>
        </select>
        <select value={disciplineFilter} onChange={e => { setDisciplineFilter(e.target.value); setPage(1); }}
          className="input-field px-3 py-2.5 min-w-[130px]">
          <option value="">Discipline</option>
          {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button onClick={handleExportCSV}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 border border-[hsl(0_0%_100%/0.12)] rounded-lg text-rx-text-secondary hover:text-foreground hover:border-[hsl(0_0%_100%/0.2)] font-ui text-[13px] transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="card-surface p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(0_0%_100%/0.1)]">
                {['', 'Nom complet', 'Type', 'Discipline(s)', 'Pays', 'Inscrit le', 'XP', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="table-header text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            {loading ? <TableSkeleton cols={9} rows={8} /> : (
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={9}><EmptyState icon="👤" title="Aucun utilisateur trouvé" subtitle="Essayez de modifier vos filtres." /></td></tr>
                ) : paged.map(u => (
                  <tr key={u.id} className="border-b border-[hsl(0_0%_100%/0.03)] hover:bg-rx-elevated transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-rx-elevated flex items-center justify-center text-[11px] font-ui font-medium text-rx-text-secondary shrink-0">
                        {u.first_name[0]}{u.last_name[0]}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-ui font-semibold text-[13px] text-foreground whitespace-nowrap">
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="px-4 py-3"><span className="badge-pill">{u.user_type}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {u.disciplines.slice(0, 2).map(d => <span key={d} className="badge-pill text-[10px]">{d}</span>)}
                        {u.disciplines.length > 2 && <span className="badge-pill text-[10px]">+{u.disciplines.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-ui text-[13px] text-rx-text-secondary whitespace-nowrap">{u.country_flag} {u.country}</td>
                    <td className="px-4 py-3 font-mono-data text-xs text-rx-text-secondary">{u.created_at}</td>
                    <td className="px-4 py-3 font-mono-data text-[13px] text-rx-gold-light">{u.xp_score.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 text-xs font-ui ${u.status === 'active' ? 'text-rx-success' : 'text-rx-danger'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-rx-success' : 'bg-rx-danger'}`} />
                        {u.status === 'active' ? 'Actif' : 'Bloqué'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        <button onClick={() => { setSelectedUser(u); setDrawerMode('view'); }}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-rx-elevated text-rx-text-secondary hover:text-foreground transition-colors"><Eye size={14} /></button>
                        <button onClick={() => { setSelectedUser(u); setDrawerMode('edit'); }}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-rx-elevated text-rx-text-secondary hover:text-foreground transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => setBlockTarget(u)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-rx-elevated text-rx-text-secondary hover:text-foreground transition-colors"><Ban size={14} /></button>
                        <button onClick={() => setDeleteTarget(u)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[hsl(0_72%_57%/0.08)] text-rx-danger transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-[13px] font-ui text-rx-text-secondary">
        <span>Page {page} sur {totalPages} · {filtered.length} résultats</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 border border-[hsl(0_0%_100%/0.12)] rounded-md text-[13px] disabled:opacity-30 hover:text-foreground hover:border-[hsl(0_0%_100%/0.2)] transition-colors">
            Précédent
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 border border-[hsl(0_0%_100%/0.12)] rounded-md text-[13px] disabled:opacity-30 hover:text-foreground hover:border-[hsl(0_0%_100%/0.2)] transition-colors">
            Suivant
          </button>
        </div>
      </div>

      {/* Drawers & Modals */}
      {selectedUser && (
        <UserDetailDrawer user={selectedUser} mode={drawerMode} onClose={() => setSelectedUser(null)}
          onSwitchMode={m => setDrawerMode(m)}
          onBlock={u => { setSelectedUser(null); setBlockTarget(u); }}
          onDelete={u => { setSelectedUser(null); setDeleteTarget(u); }}
        />
      )}
      {blockTarget && (
        <BlockModal
          userName={`${blockTarget.first_name} ${blockTarget.last_name}`}
          isBlocked={blockTarget.status === 'blocked'}
          onConfirm={() => { toast.success(`Utilisateur ${blockTarget.status === 'blocked' ? 'débloqué' : 'bloqué'}.`); setBlockTarget(null); }}
          onCancel={() => setBlockTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          userName={`${deleteTarget.first_name} ${deleteTarget.last_name}`}
          onConfirm={() => { toast.success('Utilisateur supprimé.'); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default UsersPage;
