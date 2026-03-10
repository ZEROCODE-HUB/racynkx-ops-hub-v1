import { useState, useMemo, useEffect } from "react";
import { mockCompanies } from "@/data/mockData";
import type { Company } from "@/data/mockData";
import CompanyDetailDrawer from "@/components/drawers/CompanyDetailDrawer";
import { BlockModal, DeleteModal } from "@/components/ui/ConfirmModal";
import TableSkeleton from "@/components/ui/TableSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import { Search, Eye, Pencil, Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";

const CompaniesPage = () => {
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [blockTarget, setBlockTarget] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const perPage = 25;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const countries = [...new Set(mockCompanies.map(c => c.country))];

  const filtered = useMemo(() => {
    return mockCompanies.filter(c => {
      if (search.length >= 3 && !`${c.name} ${c.city}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (countryFilter && c.country !== countryFilter) return false;
      return true;
    });
  }, [search, countryFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-6 space-y-4 max-w-[1400px]">
      <h1 className="font-display text-foreground text-[28px] uppercase tracking-tight">Entreprises</h1>

      <div className="flex flex-wrap gap-3 items-center sticky top-0 z-10 bg-background py-3 border-b border-border -mx-6 px-6">
        <div className="relative flex-1 min-w-[220px] max-w-[300px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-rx-text-muted" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par nom, ville…" className="input-field w-full pl-9 pr-4 py-2.5" />
        </div>
        <select value={countryFilter} onChange={e => { setCountryFilter(e.target.value); setPage(1); }}
          className="input-field px-3 py-2.5">
          <option value="">Tous les pays</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card-surface p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(0_0%_100%/0.1)]">
                {['', 'Nom', 'Pays', 'Ville', 'Inscrit le', 'Abonnés', 'Publications', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="table-header text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            {loading ? <TableSkeleton cols={9} rows={8} /> : (
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={9}><EmptyState icon="🏢" title="Aucune entreprise trouvée" subtitle="Essayez de modifier vos filtres." /></td></tr>
                ) : paged.map(c => (
                  <tr key={c.id} className="border-b border-[hsl(0_0%_100%/0.03)] hover:bg-rx-elevated transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-9 h-9 rounded-lg bg-rx-elevated flex items-center justify-center text-[11px] font-ui font-medium text-rx-text-secondary">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-ui font-semibold text-[13px] text-foreground">{c.name}</td>
                    <td className="px-4 py-3 font-ui text-[13px] text-rx-text-secondary">{c.country_flag} {c.country}</td>
                    <td className="px-4 py-3 font-ui text-[13px] text-rx-text-secondary">{c.city}</td>
                    <td className="px-4 py-3 font-mono-data text-xs text-rx-text-secondary">{c.created_at}</td>
                    <td className="px-4 py-3 font-ui text-[13px] text-rx-text-secondary">{c.followers.toLocaleString()}</td>
                    <td className="px-4 py-3 font-ui text-[13px] text-rx-text-secondary">{c.posts_count}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1.5 text-xs font-ui ${c.status === 'active' ? 'text-rx-success' : 'text-rx-danger'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'active' ? 'bg-rx-success' : 'bg-rx-danger'}`} />
                        {c.status === 'active' ? 'Actif' : 'Bloqué'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        <button onClick={() => setSelectedCompany(c)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-rx-elevated text-rx-text-secondary hover:text-foreground transition-colors"><Eye size={14} /></button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-rx-elevated text-rx-text-secondary hover:text-foreground transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => setBlockTarget(c)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-rx-elevated text-rx-text-secondary hover:text-foreground transition-colors"><Ban size={14} /></button>
                        <button onClick={() => setDeleteTarget(c)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[hsl(0_72%_57%/0.08)] text-rx-danger transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-[13px] font-ui text-rx-text-secondary">
        <span>Page {page} sur {totalPages} · {filtered.length} résultats</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 border border-[hsl(0_0%_100%/0.12)] rounded-md text-[13px] disabled:opacity-30 hover:text-foreground transition-colors">Précédent</button>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 border border-[hsl(0_0%_100%/0.12)] rounded-md text-[13px] disabled:opacity-30 hover:text-foreground transition-colors">Suivant</button>
        </div>
      </div>

      {selectedCompany && <CompanyDetailDrawer company={selectedCompany} onClose={() => setSelectedCompany(null)} />}
      {blockTarget && (
        <BlockModal userName={blockTarget.name} isBlocked={blockTarget.status === 'blocked'}
          onConfirm={() => { toast.success(`Entreprise ${blockTarget.status === 'blocked' ? 'débloquée' : 'bloquée'}.`); setBlockTarget(null); }}
          onCancel={() => setBlockTarget(null)} />
      )}
      {deleteTarget && (
        <DeleteModal userName={deleteTarget.name}
          onConfirm={() => { toast.success('Entreprise supprimée.'); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
};

export default CompaniesPage;
