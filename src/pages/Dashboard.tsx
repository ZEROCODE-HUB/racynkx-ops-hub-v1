import { RefreshCw } from "lucide-react";
import { useProfiles } from "@/hooks/queries/useProfiles";
import { useDashboardStats } from "@/hooks/queries/useDashboardStats";
import TableSkeleton from "@/components/ui/TableSkeleton";
import EmptyState from "@/components/ui/EmptyState";

const KpiCard = ({ title, value, sub, danger }: { title: string; value: string; sub: string; danger?: boolean }) => (
  <div className="card-surface p-5">
    <div className="table-header mb-3">{title}</div>
    <div className={`font-display text-[40px] leading-none tracking-tight ${danger ? 'text-rx-danger' : 'text-foreground'}`}>{value}</div>
    <div className="font-ui text-xs text-rx-text-secondary mt-2">{sub}</div>
  </div>
);

const PlaceholderCard = ({ title }: { title: string }) => (
  <div className="card-surface p-5">
    <div className="table-header mb-3">{title}</div>
    <div className="font-display text-[40px] leading-none tracking-tight text-rx-text-muted">—</div>
    <div className="font-ui text-xs text-rx-text-muted mt-2">Module en développement</div>
  </div>
);

const Dashboard = () => {
  const { data: profilesData, isLoading: profilesLoading } = useProfiles({ perPage: 10 });
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  const handleRefresh = () => {
    window.location.reload();
  };

  const recentUsers = profilesData?.data ?? [];
  const isLoading = profilesLoading || statsLoading;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-foreground text-[28px] uppercase tracking-tight">Tableau de bord</h1>
        <button onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-1.5 text-rx-text-secondary hover:text-foreground font-ui text-[13px] transition-colors rounded-lg hover:bg-[hsl(0_0%_100%/0.04)]">
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Utilisateurs"
          value={stats?.activeUsers?.toLocaleString() ?? '—'}
          sub={stats ? `+${stats.newUsersThisMonth} ce mois` : 'Chargement...'}
        />
        <KpiCard
          title="Publications"
          value={stats?.totalPosts?.toLocaleString() ?? '—'}
          sub={stats ? `+${stats.newPostsThisWeek || 0} / 7j` : 'Chargement...'}
        />
        <KpiCard
          title="Entreprises"
          value={stats?.totalEnterprises?.toLocaleString() ?? '—'}
          sub="+0 / 30j"
        />
        <KpiCard
          title="Signalements"
          value={stats?.pendingReports?.toLocaleString() ?? '0'}
          sub={stats?.pendingReports && stats.pendingReports > 0 ? 'en attente' : 'Aucun'}
          danger={stats?.pendingReports && stats.pendingReports > 0}
        />
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
                  <th className="table-header text-left px-3 py-3">Role</th>
                  <th className="table-header text-left px-3 py-3">Pays</th>
                  <th className="table-header text-left px-3 py-3">Inscrit le</th>
                </tr>
              </thead>
              {profilesLoading ? <TableSkeleton cols={4} rows={5} /> : (
                <tbody>
                  {recentUsers.length === 0 ? (
                    <tr><td colSpan={4}><EmptyState icon="👤" title="Aucun utilisateur trouvé" subtitle="Aucun utilisateur n'a encore été créé." /></td></tr>
                  ) : recentUsers.map(u => (
                    <tr key={u.user_id} className="border-b border-[hsl(0_0%_100%/0.03)] hover:bg-rx-elevated transition-colors cursor-pointer">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {u.profile_photo_url ? (
                            <img src={u.profile_photo_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-rx-elevated flex items-center justify-center text-[11px] font-ui font-medium text-rx-text-secondary">
                              {u.first_name?.[0] ?? '?'}{u.last_name?.[0] ?? ''}
                            </div>
                          )}
                          <span className="font-ui font-semibold text-[13px] text-foreground">
                            {u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.first_name || 'Sans nom'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3"><span className="badge-pill">{u.account_role || 'user'}</span></td>
                      <td className="px-3 py-3 font-ui text-[13px] text-rx-text-secondary capitalize">{u.country || '—'}</td>
                      <td className="px-3 py-3 font-mono-data text-xs text-rx-text-secondary">{u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </div>

        {/* Recent Reports - Placeholder */}
        <div className="card-surface p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display text-foreground text-lg uppercase tracking-tight">Signalements récents</h2>
          </div>
          <div className="p-12 text-center">
            <EmptyState icon="🚧" title="Module en développement" subtitle="La gestion des signalements sera bientôt disponible." />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;