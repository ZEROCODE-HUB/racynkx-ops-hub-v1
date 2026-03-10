import { useState, useEffect } from "react";
import { mockUsers, mockPosts, mockCompanies, mockReports } from "@/data/mockData";
import { RefreshCw } from "lucide-react";
import TableSkeleton from "@/components/ui/TableSkeleton";
import EmptyState from "@/components/ui/EmptyState";

const KpiCard = ({ title, value, sub, danger }: { title: string; value: string; sub: string; danger?: boolean }) => (
  <div className="card-surface p-5">
    <div className="table-header mb-3">{title}</div>
    <div className={`font-display text-[40px] leading-none tracking-tight ${danger ? 'text-rx-danger' : 'text-foreground'}`}>{value}</div>
    <div className="font-ui text-xs text-rx-text-secondary mt-2">{sub}</div>
  </div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const totalUsers = mockUsers.length;
  const totalPosts = mockPosts.length;
  const totalCompanies = mockCompanies.length;
  const pendingReports = mockReports.filter(r => r.status === 'pending').length;
  const recentUsers = mockUsers.slice(0, 10);
  const recentReports = mockReports.filter(r => r.status === 'pending').slice(0, 5);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-foreground text-[28px] uppercase tracking-tight">Tableau de bord</h1>
        <button onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 text-rx-text-secondary hover:text-foreground font-ui text-[13px] transition-colors rounded-lg hover:bg-[hsl(0_0%_100%/0.04)]">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Utilisateurs" value={totalUsers.toLocaleString()} sub="+42 ce mois" />
        <KpiCard title="Publications" value={totalPosts.toLocaleString()} sub="+189 / 7j" />
        <KpiCard title="Entreprises" value={totalCompanies.toLocaleString()} sub="+12 / 30j" />
        <KpiCard title="Signalements" value={String(pendingReports)} sub="en attente" danger={pendingReports > 0} />
      </div>

      {/* Two panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Users */}
        <div className="card-surface p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display text-foreground text-lg uppercase tracking-tight">Dernières inscriptions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="table-header text-left px-5 py-3">Nom</th>
                  <th className="table-header text-left px-3 py-3">Type</th>
                  <th className="table-header text-left px-3 py-3">Pays</th>
                  <th className="table-header text-left px-3 py-3">Inscrit le</th>
                </tr>
              </thead>
              {loading ? <TableSkeleton cols={4} rows={5} /> : (
                <tbody>
                  {recentUsers.map(u => (
                    <tr key={u.id} className="border-b border-[hsl(0_0%_100%/0.03)] hover:bg-rx-elevated transition-colors cursor-pointer">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-rx-elevated flex items-center justify-center text-[11px] font-ui font-medium text-rx-text-secondary">
                            {u.first_name[0]}{u.last_name[0]}
                          </div>
                          <span className="font-ui font-semibold text-[13px] text-foreground">{u.first_name} {u.last_name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3"><span className="badge-pill">{u.user_type}</span></td>
                      <td className="px-3 py-3 font-ui text-[13px] text-rx-text-secondary">{u.country_flag} {u.country}</td>
                      <td className="px-3 py-3 font-mono-data text-xs text-rx-text-secondary">{u.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card-surface p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display text-foreground text-lg uppercase tracking-tight">Signalements récents</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="table-header text-left px-5 py-3">Signaleur</th>
                  <th className="table-header text-left px-3 py-3">Type</th>
                  <th className="table-header text-left px-3 py-3">Motif</th>
                  <th className="table-header text-left px-3 py-3">Date</th>
                </tr>
              </thead>
              {loading ? <TableSkeleton cols={4} rows={5} /> : (
                <tbody>
                  {recentReports.length === 0 ? (
                    <tr><td colSpan={4}><EmptyState icon="🚩" title="Aucun signalement en attente" subtitle="Tout est calme pour le moment." /></td></tr>
                  ) : recentReports.map(r => (
                    <tr key={r.id} className="border-b border-[hsl(0_0%_100%/0.03)] hover:bg-rx-elevated transition-colors cursor-pointer">
                      <td className="px-5 py-3 font-ui text-[13px] text-foreground">{r.reporter_name}</td>
                      <td className="px-3 py-3 font-ui text-[13px] text-rx-text-secondary">{r.content_type}</td>
                      <td className="px-3 py-3">
                        <span className={`badge-pill ${r.reason === 'Offensant' ? '!text-rx-danger' : r.reason.includes('Inapproprié') ? '!text-rx-warning' : ''}`}>
                          {r.reason}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono-data text-xs text-rx-text-secondary">{r.created_at}</td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
