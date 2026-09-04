import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useProfiles } from "@/hooks/queries/useProfiles";
import { useUpdateProfileStatus } from "@/hooks/mutations/useProfileMutations";
import { useDeleteUser } from "@/hooks/mutations/useDeleteUser";
import { Search, Eye, Pencil, Ban, Trash2, ChevronLeft, ChevronRight, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import TableSkeleton from "@/components/ui/TableSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import UserDetailDrawer from "@/components/drawers/UserDetailDrawer";
import { DeleteModal } from "@/components/ui/ConfirmModal";
import type { Profile } from "@/types/database";

const COUNTRIES = [
  { value: 'france', label: 'France', code: 'FR' },
  { value: 'belgique', label: 'Belgique', code: 'BE' },
  { value: 'suisse', label: 'Suisse', code: 'CH' },
]

const getCountryFlagUrl = (country: string | null) => {
  const c = COUNTRIES.find(x => x.value === country)
  return c ? `https://flagsapi.com/${c.code}/flat/64.png` : null
}

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'active', label: 'Actifs' },
  { value: 'disabled', label: 'Inactifs' },
]

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

const CompaniesPage = () => {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit'>('view')
  const [banTarget, setBanTarget] = useState<Profile | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null)
  const perPage = 10

  const debouncedSearch = useDebounce(searchInput, 300)

  const { data, isLoading, isFetching } = useProfiles({
    page,
    perPage,
    search: debouncedSearch.length >= 2 ? debouncedSearch : undefined,
    role: 'Entreprise',
    country: countryFilter || undefined,
    status: statusFilter || undefined,
  })

  const profiles = data?.data ?? []
  const totalPages = data?.totalPages ?? 0
  const total = data?.total ?? 0

  const [postsCountMap, setPostsCountMap] = useState<Record<string, number>>({})

  useEffect(() => {
    if (profiles.length === 0) {
      setPostsCountMap({})
      return
    }

    const userIds = profiles.map(p => p.user_id)

    supabase
      .from('posts')
      .select('user_id')
      .in('user_id', userIds)
      .then(({ data: posts, error }) => {
        if (error) return
        const counts: Record<string, number> = {}
        posts?.forEach(post => {
          counts[post.user_id] = (counts[post.user_id] || 0) + 1
        })
        setPostsCountMap(counts)
      })
  }, [profiles])

  const updateStatus = useUpdateProfileStatus()
  const deleteUser = useDeleteUser()

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, countryFilter, statusFilter])

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    deleteUser.mutate(deleteTarget.user_id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  const handleBanConfirm = () => {
    if (!banTarget) return
    const newStatus: 'active' | 'disabled' = banTarget.status === 'disabled' ? 'active' : 'disabled'
    updateStatus.mutate(
      { userId: banTarget.user_id, status: newStatus },
      { onSuccess: () => setBanTarget(null) }
    )
  }

  const getPageNumbers = useCallback(() => {
    const pages: (number | 'ellipsis')[] = []
    const total = totalPages
    const current = page
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > 3) pages.push('ellipsis')
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
      if (current < total - 2) pages.push('ellipsis')
      pages.push(total)
    }
    return pages
  }, [totalPages, page])

  return (
    <div className="p-6 space-y-4 ">
      <h1 className="font-display text-foreground text-[28px] uppercase tracking-tight">Entreprises</h1>

      <div className="flex flex-wrap gap-3 items-center sticky top-0 z-10 bg-background py-3 border-b border-border -mx-6 px-6">
        <div className="relative flex-1 min-w-[220px] max-w-[300px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-rx-text-muted" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Rechercher par nom, pays..."
            className="input-field w-full pl-9 pr-4 py-2.5"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="input-field px-3 py-2.5 min-w-[140px]"
        >
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select
          value={countryFilter}
          onChange={e => setCountryFilter(e.target.value)}
          className="input-field px-3 py-2.5"
        >
          <option value="">Tous les pays</option>
          {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div className="card-surface p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="table-header text-left px-4 py-3">#</th>
                <th className="table-header text-left px-4 py-3">Avatar</th>
                <th className="table-header text-left px-4 py-3">Nom</th>
                <th className="table-header text-left px-4 py-3">Pays</th>
                <th className="table-header text-left px-4 py-3">Ville</th>
                <th className="table-header text-left px-4 py-3">Inscrit le</th>
                <th className="table-header text-left px-4 py-3">Abonnés</th>
                <th className="table-header text-left px-4 py-3">Publications</th>
                <th className="table-header text-left px-4 py-3">Statut</th>
                <th className="table-header text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton cols={10} rows={10} />
            ) : (
              <tbody>
                {profiles.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <EmptyState icon="🏢" title="Aucune entreprise trouvée" subtitle="Essayez de modifier vos filtres." />
                    </td>
                  </tr>
                ) : profiles.map((profile, index) => (
                  <tr key={profile.user_id} className="border-b border-[hsl(0_0%_100%/0.03)] hover:bg-rx-elevated transition-colors">
                    <td className="px-4 py-3 font-mono-data text-xs text-rx-text-muted">
                      {(page - 1) * perPage + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      {profile.profile_photo_url ? (
                        <img src={profile.profile_photo_url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-rx-elevated flex items-center justify-center text-[11px] font-ui font-medium text-rx-text-secondary">
                          {(profile.first_name?.[0] || profile.last_name?.[0] || '?').toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-ui font-semibold text-[13px] text-foreground">
                        {profile.first_name && profile.last_name
                          ? `${profile.first_name} ${profile.last_name}`
                          : profile.first_name || profile.last_name || 'Sans nom'}
                      </div>
                      <div className="font-mono-data text-[11px] text-rx-text-muted truncate max-w-[150px]">
                        {profile.user_id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {profile.country ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={getCountryFlagUrl(profile.country)}
                            alt=""
                            className="w-5 h-4 rounded-sm object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                          <span className="font-ui text-[13px] text-rx-text-secondary capitalize">{profile.country}</span>
                        </div>
                      ) : (
                        <span className="font-ui text-[13px] text-rx-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-ui text-[13px] text-rx-text-secondary">
                      {profile.city || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono-data text-xs text-rx-text-secondary">
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3 font-ui text-[13px] text-rx-text-secondary">
                      {profile.followers_count?.toLocaleString() ?? 0}
                    </td>
                    <td className="px-4 py-3 font-ui text-[13px] text-rx-text-secondary">
                      {postsCountMap[profile.user_id] ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updateStatus.mutate({ userId: profile.user_id, status: profile.status === 'active' ? 'disabled' : 'active' })}
                        className={`flex items-center gap-1.5 text-xs font-ui cursor-pointer hover:opacity-80 transition-opacity ${profile.status === 'active' ? 'text-rx-success' : 'text-rx-danger'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${profile.status === 'active' ? 'bg-rx-success' : 'bg-rx-danger'}`} />
                        {profile.status === 'active' ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        <button
                          onClick={() => { setSelectedProfile(profile); setDrawerMode('view'); }}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-rx-elevated text-rx-text-secondary hover:text-foreground transition-colors">
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => { setSelectedProfile(profile); setDrawerMode('edit'); }}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-rx-elevated text-rx-text-secondary hover:text-foreground transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setBanTarget(profile)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[hsl(0_47%_11%)] text-rx-text-secondary hover:text-rx-danger transition-colors">
                          <Ban size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(profile)}
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[hsl(0_72%_57%/0.08)] text-rx-danger transition-colors">
                          <Trash2 size={14} />
                        </button>
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
        <span>Page {page} sur {totalPages || 1} · {total} résultat{total !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-1">
          {isFetching && !isLoading && <Loader2 size={14} className="animate-spin text-rx-text-muted mr-2" />}
          <button
            disabled={page <= 1 || isLoading}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="w-8 h-8 flex items-center justify-center border border-border rounded-md hover:text-foreground hover:bg-rx-elevated transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft size={14} />
          </button>
          {getPageNumbers().map((p, i) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-rx-text-muted">...</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                disabled={isLoading}
                className={`w-8 h-8 flex items-center justify-center border rounded-md font-medium text-[13px] transition-colors disabled:cursor-not-allowed ${page === p
                    ? 'border-rx-blue bg-rx-blue/10 text-rx-blue'
                    : 'border-border text-rx-text-secondary hover:text-foreground hover:bg-rx-elevated'
                  }`}>
                {p}
              </button>
            )
          )}
          <button
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage(p => p + 1)}
            className="w-8 h-8 flex items-center justify-center border border-border rounded-md hover:text-foreground hover:bg-rx-elevated transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {selectedProfile && (
        <UserDetailDrawer
          profile={selectedProfile}
          mode={drawerMode}
          onClose={() => setSelectedProfile(null)}
          onSwitchMode={(m) => setDrawerMode(m)}
          onStatusChange={(updated) => setSelectedProfile(updated)}
          onProfileUpdate={(updated) => setSelectedProfile(updated)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          userName={`${deleteTarget.first_name ?? ''} ${deleteTarget.last_name ?? ''}`.trim() || 'Sans nom'}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isPending={deleteUser.isPending}
        />
      )}

      {banTarget && (
        <>
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-40 animate-fade-in" onClick={() => setBanTarget(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] bg-rx-surface border border-border rounded-xl z-50 p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${banTarget.status === 'active' ? 'bg-[hsl(0_47%_11%)]' : 'bg-rx-success/10'}`}>
                {banTarget.status === 'active' ? (
                  <AlertTriangle size={20} className="text-rx-danger" />
                ) : (
                  <CheckCircle size={20} className="text-rx-success" />
                )}
              </div>
              <h3 className="font-display text-lg text-foreground">
                {banTarget.status === 'active' ? 'Bloquer l\'entreprise' : 'Débloquer l\'entreprise'}
              </h3>
            </div>
            <p className="text-[13px] font-ui text-rx-text-secondary mb-6">
              {banTarget.status === 'active' ? (
                <>Êtes-vous sûr de vouloir bloquer <strong className="text-foreground">{banTarget.first_name} {banTarget.last_name}</strong> ? L&apos;entreprise ne sera plus visible.</>
              ) : (
                <>Le profil de <strong className="text-foreground">{banTarget.first_name} {banTarget.last_name}</strong> sera de nouveau visible pour tous.</>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBanTarget(null)}
                className="flex-1 h-10 border border-border text-rx-text-secondary font-ui font-medium text-[13px] rounded-lg hover:text-foreground hover:bg-rx-elevated transition-colors">
                Annuler
              </button>
              <button
                onClick={handleBanConfirm}
                disabled={updateStatus.isPending}
                className={`flex-1 h-10 font-ui font-medium text-[13px] rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${banTarget.status === 'active'
                    ? 'bg-rx-danger text-foreground hover:bg-[hsl(0_47%_51%)]'
                    : 'bg-rx-success text-foreground hover:bg-[hsl(142_76%_36%)]'
                  }`}>
                {updateStatus.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : (banTarget.status === 'active' ? 'Bloquer' : 'Débloquer')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CompaniesPage