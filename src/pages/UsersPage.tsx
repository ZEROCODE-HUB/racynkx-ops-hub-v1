import { useState, useMemo } from "react";
import { mockUsers, USER_TYPES, DISCIPLINES } from "@/data/mockData";
import type { User } from "@/data/mockData";
import UserDetailDrawer from "@/components/drawers/UserDetailDrawer";
import { Search, Download, Eye, Pencil, Ban, Trash2 } from "lucide-react";

const UsersPage = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit'>('view');
  const perPage = 25;

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

  return (
    <div className="p-6 space-y-4">
      <h1 className="font-display text-foreground text-3xl uppercase">Utilisateurs</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center sticky top-0 z-10 bg-background py-3 border-b border-border -mx-6 px-6">
        <div className="relative flex-1 min-w-[240px] max-w-[320px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rx-text-muted" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par nom, alias, ville…"
            className="input-field w-full pl-10 pr-4 py-2 text-sm" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="input-field px-3 py-2 text-sm min-w-[160px]">
          <option value="">Type d'utilisateur</option>
          {USER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field px-3 py-2 text-sm">
          <option value="">Tous statuts</option>
          <option value="active">Actif</option>
          <option value="blocked">Bloqué</option>
        </select>
        <select value={disciplineFilter} onChange={e => { setDisciplineFilter(e.target.value); setPage(1); }}
          className="input-field px-3 py-2 text-sm min-w-[140px]">
          <option value="">Discipline</option>
          {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <button className="ml-auto flex items-center gap-2 px-4 py-2 border border-[hsl(0_0%_100%/0.15)] rounded-lg text-rx-text-secondary hover:text-foreground font-ui text-sm transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="card-surface p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(0_0%_100%/0.1)]">
                {['', 'Nom complet', 'Type', 'Discipline(s)', 'Pays', 'Inscrit le', 'Score XP', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="table-header text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(u => (
                <tr key={u.id} className="border-b border-[hsl(0_0%_100%/0.03)] hover:bg-rx-elevated transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-9 h-9 rounded-full bg-rx-elevated flex items-center justify-center text-xs font-ui text-rx-text-secondary shrink-0">
                      {u.first_name[0]}{u.last_name[0]}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-ui font-semibold text-sm text-foreground whitespace-nowrap">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-4 py-3"><span className="badge-pill">{u.user_type}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {u.disciplines.slice(0, 2).map(d => <span key={d} className="badge-pill text-[10px]">{d}</span>)}
                      {u.disciplines.length > 2 && <span className="badge-pill text-[10px]">+{u.disciplines.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-ui text-sm text-rx-text-secondary whitespace-nowrap">{u.country_flag} {u.country}</td>
                  <td className="px-4 py-3 font-mono-data text-xs text-rx-text-secondary">{u.created_at}</td>
                  <td className="px-4 py-3 font-mono-data text-[13px] text-rx-gold-light">{u.xp_score.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 text-xs font-ui ${u.status === 'active' ? 'text-rx-success' : 'text-rx-danger'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-rx-success' : 'bg-rx-danger'}`} />
                      {u.status === 'active' ? 'Actif' : 'Bloqué'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {[
                        { icon: Eye, action: () => { setSelectedUser(u); setDrawerMode('view'); } },
                        { icon: Pencil, action: () => { setSelectedUser(u); setDrawerMode('edit'); } },
                        { icon: Ban, action: () => {} },
                        { icon: Trash2, action: () => {}, danger: true },
                      ].map(({ icon: Icon, action, danger }, i) => (
                        <button key={i} onClick={action}
                          className={`w-7 h-7 flex items-center justify-center rounded hover:bg-rx-elevated transition-colors ${danger ? 'text-rx-danger hover:text-rx-danger' : 'text-rx-text-secondary hover:text-foreground'}`}>
                          <Icon size={14} />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm font-ui text-rx-text-secondary">
        <span>Page {page} sur {totalPages} · {filtered.length} résultats</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 border border-[hsl(0_0%_100%/0.15)] rounded text-sm disabled:opacity-30 hover:text-foreground transition-colors">
            Précédent
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 border border-[hsl(0_0%_100%/0.15)] rounded text-sm disabled:opacity-30 hover:text-foreground transition-colors">
            Suivant
          </button>
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedUser && (
        <UserDetailDrawer user={selectedUser} mode={drawerMode} onClose={() => setSelectedUser(null)}
          onSwitchMode={m => setDrawerMode(m)} />
      )}
    </div>
  );
};

export default UsersPage;
