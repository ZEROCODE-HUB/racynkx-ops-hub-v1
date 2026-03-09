import { useState, useMemo } from "react";
import { mockReports } from "@/data/mockData";
import type { Report } from "@/data/mockData";
import ReportDetailDrawer from "@/components/drawers/ReportDetailDrawer";
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
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filtered = useMemo(() => {
    if (tab === 'pending') return mockReports.filter(r => r.status === 'pending');
    if (tab === 'resolved') return mockReports.filter(r => r.status !== 'pending');
    return mockReports;
  }, [tab]);

  const pendingCount = mockReports.filter(r => r.status === 'pending').length;

  const tabs = [
    { key: 'pending' as const, label: 'EN ATTENTE', badge: pendingCount },
    { key: 'resolved' as const, label: 'RÉSOLUS' },
    { key: 'all' as const, label: 'TOUS' },
  ];

  return (
    <div className="p-6 space-y-4">
      <h1 className="font-display text-foreground text-3xl uppercase">Signalements</h1>

      {/* Status tabs */}
      <div className="flex gap-6 border-b border-border">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`font-display uppercase text-sm pb-3 tracking-wide transition-colors flex items-center gap-2 ${
              tab === t.key ? 'text-foreground border-b-2 border-rx-blue' : 'text-rx-text-muted hover:text-rx-text-secondary'
            }`}>
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="bg-rx-danger text-foreground text-[10px] font-ui font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4 text-rx-text-muted">🚩</div>
          <p className="font-display text-foreground text-xl">Aucun signalement en attente.</p>
          <p className="font-ui text-sm text-rx-text-secondary mt-1">Tout est calme pour le moment.</p>
        </div>
      ) : (
        <div className="card-surface p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[hsl(0_0%_100%/0.1)]">
                  {['#', 'Contenu', 'Type', 'Motif', 'Signaleur', 'Utilisateur signalé', 'Date', 'Statut', ''].map(h => (
                    <th key={h} className="table-header text-left px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const st = statusLabel(r.status);
                  const isMuted = r.status !== 'pending';
                  return (
                    <tr key={r.id} className={`border-b border-[hsl(0_0%_100%/0.03)] hover:bg-rx-elevated transition-colors ${isMuted ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3 font-mono-data text-xs text-rx-text-muted">{r.id}</td>
                      <td className="px-4 py-3 font-ui text-sm text-rx-text-secondary max-w-[150px] truncate">{r.content_preview.slice(0, 40)}…</td>
                      <td className="px-4 py-3"><span className="badge-pill">{r.content_type}</span></td>
                      <td className="px-4 py-3">
                        <span className={`badge-pill ${r.reason === 'Offensant' ? '!text-rx-danger' : r.reason.includes('Inapproprié') ? '!text-rx-warning' : ''}`}>
                          {r.reason}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-ui text-sm text-foreground whitespace-nowrap">{r.reporter_name}</td>
                      <td className="px-4 py-3 font-ui text-sm text-foreground whitespace-nowrap">{r.reported_user_name}</td>
                      <td className="px-4 py-3 font-mono-data text-xs text-rx-text-secondary">{r.created_at}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-ui ${st.cls}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedReport(r)}
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-rx-elevated text-rx-text-secondary hover:text-foreground transition-colors">
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
