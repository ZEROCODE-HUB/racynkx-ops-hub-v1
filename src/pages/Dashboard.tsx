import { RefreshCw } from "lucide-react";
import { useProfiles } from "@/hooks/queries/useProfiles";
import { useDashboardStats } from "@/hooks/queries/useDashboardStats";
import { useReports } from "@/hooks/queries/useReports";
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

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

const getUserLabel = (profile: { first_name: string | null; last_name: string | null; user_id: string }) => {
  return [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || profile.user_id
}

const getProfileMeta = (profile?: {
  role: string | null
  account_role: 'user' | 'admin'
  city: string | null
  region: string | null
  country: string | null
  badge_name: string | null
  followers_count: number
  experience_xp: number | null
  status: 'active' | 'disabled'
} | null) => {
  if (!profile) return 'Profil supprimé'
  const location = [profile.city, profile.region, profile.country].filter(Boolean).join(', ')
  const details = [profile.role || profile.account_role, profile.badge_name, location].filter(Boolean)
  return details.join(' · ')
}

const Dashboard = () => {
  const { data: profilesData, isLoading: profilesLoading } = useProfiles({ perPage: 10 });
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: reportsData, isLoading: reportsLoading } = useReports({ perPage: 5 });

  const handleRefresh = () => {
    window.location.reload();
  };

  const recentUsers = profilesData?.data ?? [];
  const recentReports = reportsData?.data ?? [];
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

        {/* Recent Reports */}
        <div className="card-surface p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-display text-foreground text-lg uppercase tracking-tight">Signalements récents</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="table-header text-left px-5 py-3">Signalement</th>
                  <th className="table-header text-left px-3 py-3">Signaleur</th>
                  <th className="table-header text-left px-3 py-3">Signalé</th>
                  <th className="table-header text-left px-3 py-3">Statut</th>
                  <th className="table-header text-left px-3 py-3">Créé le</th>
                </tr>
              </thead>
              {reportsLoading ? <TableSkeleton cols={5} rows={5} /> : (
                <tbody>
                  {recentReports.length === 0 ? (
                    <tr><td colSpan={5}><EmptyState icon="🚩" title="Aucun signalement récent" subtitle="La file de modération est vide pour le moment." /></td></tr>
                  ) : recentReports.map(report => (
                    <tr key={report.id} className="border-b border-[hsl(0_0%_100%/0.03)] hover:bg-rx-elevated transition-colors">
                      <td className="px-5 py-3">
                        <div className="space-y-1 max-w-[260px]">
                          <div className="flex items-center gap-2">
                            <span className="badge-pill">{report.content_label}</span>
                            <span className="font-mono-data text-[11px] text-rx-text-muted">#{report.report_number}</span>
                          </div>
                          <div className="font-ui text-[13px] text-foreground leading-snug">
                            {report.target?.title || report.content_label}
                          </div>
                          {report.target?.subtitle && (
                            <p className="font-ui text-[12px] text-rx-text-secondary line-clamp-2">{report.target.subtitle}</p>
                          )}
                          <p className="font-ui text-[13px] text-rx-text-secondary line-clamp-2">{report.content_preview}</p>
                          <p className="font-mono-data text-[11px] text-rx-text-muted break-all">{report.target_id}</p>
                          {report.target?.author_name && (
                            <p className="text-[11px] text-rx-text-muted">Par {report.target.author_name}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          <div className="font-ui font-semibold text-[13px] text-foreground">{getUserLabel(report.reporter ?? { user_id: report.reporter_id, first_name: null, last_name: null })}</div>
                          <div className="text-[11px] text-rx-text-secondary">{getProfileMeta(report.reporter)}</div>
                          <div className="text-[11px] text-rx-text-muted">{report.reporter?.followers_count ?? 0} followers · {report.reporter?.experience_xp ?? 0} xp</div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          <div className="font-ui font-semibold text-[13px] text-foreground">{getUserLabel(report.reported_user ?? { user_id: report.reported_user_id, first_name: null, last_name: null })}</div>
                          <div className="text-[11px] text-rx-text-secondary">{getProfileMeta(report.reported_user)}</div>
                          <div className="text-[11px] text-rx-text-muted">{report.reported_user?.badge_name || 'Sans badge'} · {report.reported_user?.status || '—'}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          <span className={`text-xs font-ui font-medium ${report.status === 'pending' ? 'text-rx-warning' : report.status === 'under_review' ? 'text-rx-blue' : 'text-rx-text-muted'}`}>
                            {report.status_label}
                          </span>
                          <div className="text-[11px] text-rx-text-muted">{report.admin_decision || 'En attente de décision'}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono-data text-xs text-rx-text-secondary whitespace-nowrap">{formatDate(report.created_at)}</td>
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