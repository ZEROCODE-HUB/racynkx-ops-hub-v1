import { useState, useMemo, useEffect } from "react";
import { mockReports } from "@/data/mockData";
import type { Report } from "@/data/mockData";
import ReportDetailDrawer from "@/components/drawers/ReportDetailDrawer";
import TableSkeleton from "@/components/ui/TableSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import { Eye } from "lucide-react";

const statusLabel = (s: Report['status']) => {
  switch (s) {
    case 'pending': return { label: 'En attente', cls: 'text-rx-warning' };
    case 'resolved_rejected': return { label: 'Résolu — Rejeté', cls: 'text-rx-text-muted' };
    case 'resolved_deleted': return { label: 'Résolu — Supprimé', cls: 'text-rx-danger' };
    case 'resolved_warned': return { label: 'Résolu — Avertissement', cls: 'text-rx-blue' };
  }
};

const ReportsPage = () => {
  const [tab, setTab] = useState<'pending' | 'resolved' | 'all'>('pending');
  const [contentFilter, setContentFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    let result = mockReports;
    if (tab === 'pending') result = result.filter(r => r.status === 'pending');
    if (tab === 'resolved') result = result.filter(r => r.status !== 'pending');
    if (contentFilter) result = result.filter(r => r.content_type === contentFilter);
    if (reasonFilter) result = result.filter(r => r.reason === reasonFilter);
    return result;
  }, [tab, contentFilter, reasonFilter]);

  const pendingCount = mockReports.filter(r => r.status === 'pending').length;

  const tabs = [
    { key: 'pending' as const, label: 'En attente', badge: pendingCount },
    { key: 'resolved' as const, label: 'Résolus' },
    { key: 'all' as const, label: 'Tous' },
  ];

  return (
    <div className="p-6 space-y-4 max-w-[1400px]">
      <h1 className="font-display text-foreground text-[28px] uppercase tracking-tight">Signalements</h1>

      {/* Status tabs */}
      <div className="flex gap-6 border-b border-border">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`font-ui font-medium text-[13px] pb-3 tracking-wide transition-colors flex items-center gap-2 ${
              tab === t.key ? 'text-foreground border-b-2 border-rx-blue' : 'text-rx-text-muted hover:text-rx-text-secondary'
            }`}>
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="bg-rx-danger text-foreground text-[10px] font-ui font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select value={contentFilter} onChange={e => setContentFilter(e.target.value)}
          className="input-field px-3 py-2.5">
          <option value="">Type de contenu</option>
          <option value="post">Publication</option>
          <option value="comment">Commentaire</option>
          <option value="profile">Profil</option>
        </select>
        <select value={reasonFilter} onChange={e => setReasonFilter(e.target.value)}
          className="input-field px-3 py-2.5">
          <option value="">Catégorie de motif</option>
          <option value="Inapproprié / Non autorisé">Inapproprié / Non autorisé</option>
          <option value="Offensant">Offensant</option>
          <option value="Autre motif">Autre motif</option>
        </select>
      </div>

      {loading ? (
        <div className="card-surface p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(0_0%_100%/0.1)]">
                {['#', 'Contenu', 'Type', 'Motif', 'Signaleur', 'Signalé', 'Date', 'Statut', ''].map(h => (
                  <th key={h} className="table-header text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <TableSkeleton cols={9} rows={6} />
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🚩" title="Aucun signalement en attente" subtitle="Tout est calme pour le moment." />
      ) : (
        <div className="card-surface p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[hsl(0_0%_100%/0.1)]">
                  {['#', 'Contenu', 'Type', 'Motif', 'Signaleur', 'Signalé', 'Date', 'Statut', ''].map(h => (
                    <th key={h} className="table-header text-left px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const st = statusLabel(r.status);
                  const isMuted = r.status !== 'pending';
                  return (
                    <tr key={r.id} className={`border-b border-[hsl(0_0%_100%/0.03)] hover:bg-rx-elevated transition-colors ${isMuted ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3 font-mono-data text-xs text-rx-text-muted">{r.id}</td>
                      <td className="px-4 py-3 font-ui text-[13px] text-rx-text-secondary max-w-[140px] truncate">{r.content_preview.slice(0, 40)}…</td>
                      <td className="px-4 py-3"><span className="badge-pill">{r.content_type}</span></td>
                      <td className="px-4 py-3">
                        <span className={`badge-pill ${r.reason === 'Offensant' ? '!text-rx-danger' : r.reason.includes('Inapproprié') ? '!text-rx-warning' : ''}`}>
                          {r.reason}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-ui text-[13px] text-foreground whitespace-nowrap">{r.reporter_name}</td>
                      <td className="px-4 py-3 font-ui text-[13px] text-foreground whitespace-nowrap">{r.reported_user_name}</td>
                      <td className="px-4 py-3 font-mono-data text-xs text-rx-text-secondary">{r.created_at}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-ui font-medium ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedReport(r)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-rx-elevated text-rx-text-secondary hover:text-foreground transition-colors">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReport && <ReportDetailDrawer report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </div>
  );
};

export default ReportsPage;
