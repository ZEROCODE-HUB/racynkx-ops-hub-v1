import { mockUsers, mockPosts, mockCompanies, mockReports } from "@/data/mockData";

const KpiCard = ({ title, value, sub, danger }: { title: string; value: string; sub: string; danger?: boolean }) => (
  <div className="card-surface p-6">
    <div className="table-header mb-3">{title}</div>
    <div className={`font-display text-[42px] leading-none ${danger ? 'text-rx-danger' : 'text-foreground'}`}>{value}</div>
    <div className="font-ui text-xs text-rx-text-secondary mt-2">{sub}</div>
  </div>
);

const Dashboard = () => {
  const totalUsers = mockUsers.length;
  const totalPosts = mockPosts.length;
  const totalCompanies = mockCompanies.length;
  const pendingReports = mockReports.filter(r => r.status === 'pending').length;
  const recentUsers = mockUsers.slice(0, 10);
  const recentReports = mockReports.filter(r => r.status === 'pending').slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-display text-foreground text-3xl uppercase">Tableau de bord</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="UTILISATEURS" value={totalUsers.toLocaleString()} sub="+42 ce mois" />
        <KpiCard title="PUBLICATIONS" value={totalPosts.toLocaleString()} sub="+189 / 7j" />
        <KpiCard title="ENTREPRISES" value={totalCompanies.toLocaleString()} sub="+12 / 30j" />
        <KpiCard title="SIGNALEMENTS" value={String(pendingReports)} sub="en attente" danger={pendingReports > 0} />
      </div>

      {/* Two panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card-surface p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-foreground text-lg uppercase">Dernières inscriptions</h2>
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
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.id} className="border-b border-[hsl(0_0%_100%/0.03)] hover:bg-rx-elevated transition-colors cursor-pointer">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rx-elevated flex items-center justify-center text-xs font-ui text-rx-text-secondary">
                          {u.first_name[0]}{u.last_name[0]}
                        </div>
                        <span className="font-ui font-semibold text-sm text-foreground">{u.first_name} {u.last_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3"><span className="badge-pill">{u.user_type}</span></td>
                    <td className="px-3 py-3 font-ui text-sm text-rx-text-secondary">{u.country_flag} {u.country}</td>
                    <td className="px-3 py-3 font-mono-data text-xs text-rx-text-secondary">{u.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="card-surface p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-foreground text-lg uppercase">Signalements récents</h2>
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
              <tbody>
                {recentReports.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-rx-text-muted font-ui text-sm">🚩 Aucun signalement en attente.</td></tr>
                ) : recentReports.map(r => (
                  <tr key={r.id} className="border-b border-[hsl(0_0%_100%/0.03)] hover:bg-rx-elevated transition-colors cursor-pointer">
                    <td className="px-5 py-3 font-ui text-sm text-foreground">{r.reporter_name}</td>
                    <td className="px-3 py-3 font-ui text-sm text-rx-text-secondary">{r.content_type}</td>
                    <td className="px-3 py-3">
                      <span className={`badge-pill ${r.reason === 'Offensant' ? '!text-rx-danger' : r.reason.includes('Inapproprié') ? '!text-rx-warning' : ''}`}>
                        {r.reason}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono-data text-xs text-rx-text-secondary">{r.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
