import { useEffect, useMemo, useState } from 'react'
import { Eye, Filter, Search } from 'lucide-react'
import ReportDetailDrawer from '@/components/drawers/ReportDetailDrawer'
import TableSkeleton from '@/components/ui/TableSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import { useReports } from '@/hooks/queries/useReports'
import type { ReportContentType, ReportListItem, ReportReason, ReportStatus } from '@/types/database'

const CONTENT_OPTIONS: Array<{ value: ReportContentType | ''; label: string }> = [
  { value: '', label: 'Type de contenu' },
  { value: 'post', label: 'Publication' },
  { value: 'comment', label: 'Commentaire' },
  { value: 'profile', label: 'Profil' },
  { value: 'paddock', label: 'Paddock' },
]

const REASON_OPTIONS: Array<{ value: ReportReason | ''; label: string }> = [
  { value: '', label: 'Motif' },
  { value: 'inappropriate', label: 'Inapproprié / Non autorisé' },
  { value: 'offensive', label: 'Offensant' },
  { value: 'other', label: 'Autre motif' },
]

const STATUS_OPTIONS: Array<{ value: ReportStatus | ''; label: string }> = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'under_review', label: 'En revue' },
  { value: 'resolved', label: 'Résolus' },
]

const statusBadgeClass = (status: ReportStatus) => {
  switch (status) {
    case 'pending':
      return 'text-rx-warning'
    case 'under_review':
      return 'text-rx-blue'
    case 'resolved':
      return 'text-rx-text-muted'
  }
}

const reasonBadgeClass = (reason: ReportReason) => {
  switch (reason) {
    case 'inappropriate':
      return '!text-rx-warning'
    case 'offensive':
      return '!text-rx-danger'
    case 'other':
      return '!text-rx-text-secondary'
  }
}

const formatDate = (value: string) => new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value))

const reportTargetContext = (report: ReportListItem) => {
  if (!report.target) return report.content_preview
  return [report.target.subtitle, report.target.body].filter(Boolean).join(' · ') || report.content_preview
}

const ReportsPage = () => {
  const [tab, setTab] = useState<ReportStatus | 'all'>('pending')
  const [contentFilter, setContentFilter] = useState<ReportContentType | ''>('')
  const [reasonFilter, setReasonFilter] = useState<ReportReason | ''>('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedReport, setSelectedReport] = useState<ReportListItem | null>(null)
  const perPage = 25

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [tab, contentFilter, reasonFilter, search])

  const query = useReports({
    page,
    perPage,
    search: search.length >= 2 ? search : undefined,
    status: tab === 'all' ? '' : tab,
    contentType: contentFilter,
    reason: reasonFilter,
  })

  const reports = query.data?.data ?? []
  const total = query.data?.total ?? 0
  const totalPages = query.data?.totalPages ?? 0
  const pendingCount = query.data?.pendingCount ?? 0

  const tabs = useMemo(() => ([
    { key: 'pending' as const, label: 'En attente', badge: pendingCount },
    { key: 'under_review' as const, label: 'En revue' },
    { key: 'resolved' as const, label: 'Résolus' },
    { key: 'all' as const, label: 'Tous' },
  ]), [pendingCount])

  const emptyTitle = tab === 'all' ? 'Aucun signalement' : 'Aucun signalement dans cet état'
  const emptySubtitle = search || contentFilter || reasonFilter
    ? 'Essaie d’élargir les filtres pour retrouver des résultats.'
    : 'La file est vide pour le moment.'

  return (
    <div className="p-6 space-y-4 max-w-[1400px]">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-foreground text-[28px] uppercase tracking-tight">Signalements</h1>
          <p className="font-ui text-sm text-rx-text-secondary mt-1">{total.toLocaleString()} signalement{total > 1 ? 's' : ''} charg{total > 1 ? 'és' : 'é'} depuis la base.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-ui text-rx-text-muted">
          <Filter size={14} />
          Filtrage temps réel sur public.reports
        </div>
      </div>

      <div className="flex gap-6 border-b border-border overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`font-ui font-medium text-[13px] pb-3 tracking-wide transition-colors flex items-center gap-2 whitespace-nowrap ${tab === t.key ? 'text-foreground border-b-2 border-rx-blue' : 'text-rx-text-muted hover:text-rx-text-secondary'
              }`}
          >
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="bg-rx-danger text-foreground text-[10px] font-ui font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative min-w-[220px] flex-1 max-w-[340px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-rx-text-muted" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Rechercher dans les descriptions ou les IDs..."
            className="input-field w-full pl-9 pr-4 py-2.5"
          />
        </div>
        <select value={contentFilter} onChange={e => setContentFilter(e.target.value as ReportContentType | '')} className="input-field px-3 py-2.5">
          {CONTENT_OPTIONS.map(option => <option key={option.value || 'all-content'} value={option.value}>{option.label}</option>)}
        </select>
        <select value={reasonFilter} onChange={e => setReasonFilter(e.target.value as ReportReason | '')} className="input-field px-3 py-2.5">
          {REASON_OPTIONS.map(option => <option key={option.value || 'all-reasons'} value={option.value}>{option.label}</option>)}
        </select>
        <select value={tab} onChange={e => setTab(e.target.value as ReportStatus | 'all')} className="input-field px-3 py-2.5">
          {STATUS_OPTIONS.map(option => <option key={option.value || 'all-statuses'} value={option.value}>{option.label}</option>)}
        </select>
      </div>

      {query.isLoading ? (
        <div className="card-surface p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(0_0%_100%/0.1)]">
                {['#', 'Signalement', 'Contenu', 'Motif', 'Signaleur', 'Signalé', 'Créé', 'Statut', 'Décision', ''].map(h => (
                  <th key={h} className="table-header text-left px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <TableSkeleton cols={10} rows={6} />
          </table>
        </div>
      ) : reports.length === 0 ? (
        <EmptyState icon="🚩" title={emptyTitle} subtitle={emptySubtitle} />
      ) : (
        <div className="card-surface p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[hsl(0_0%_100%/0.1)]">
                  {['#', 'Objet', 'Motif', 'Signaleur', 'Signalé', 'Créé', 'Statut', 'Décision', ''].map(h => (
                    <th key={h} className="table-header text-left px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} className="border-b border-[hsl(0_0%_100%/0.03)] hover:bg-rx-elevated transition-colors">
                    <td className="px-4 py-3 font-mono-data text-xs text-rx-text-muted">{report.report_number}</td>
                    <td className="px-4 py-3">
                      <div className="max-w-[300px] space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="badge-pill">{report.content_label}</span>
                          <span className="font-ui text-[13px] text-foreground">{report.target?.title || report.content_label}</span>
                        </div>
                        {report.target?.subtitle && (
                          <div className="font-ui text-[12px] text-rx-text-secondary line-clamp-2">{report.target.subtitle}</div>
                        )}
                        <div className="font-ui text-[13px] text-rx-text-secondary line-clamp-2">{reportTargetContext(report)}</div>
                        <div className="font-mono-data text-[11px] text-rx-text-muted break-all">{report.target?.link_label || report.target_id}</div>
                        {report.target?.author_name && (
                          <div className="text-[11px] text-rx-text-muted">Par {report.target.author_name}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge-pill ${reasonBadgeClass(report.reason)}`}>{report.reason_label}</span>
                    </td>
                    <td className="px-4 py-3 font-ui text-[13px] text-foreground whitespace-nowrap">{report.reporter_name}</td>
                    <td className="px-4 py-3">
                      <div className="font-ui text-[13px] text-foreground whitespace-nowrap">{report.reported_user_name}</div>
                      <div className="text-[11px] text-rx-text-muted">{report.reported_user?.role || '—'}{report.reported_user?.city || report.reported_user?.country ? ` · ${[report.reported_user?.city, report.reported_user?.country].filter(Boolean).join(', ')}` : ''}</div>
                    </td>
                    <td className="px-4 py-3 font-mono-data text-xs text-rx-text-secondary whitespace-nowrap">{formatDate(report.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-ui font-medium ${statusBadgeClass(report.status)}`}>{report.status_label}</span>
                    </td>
                    <td className="px-4 py-3 font-ui text-[13px] text-rx-text-secondary whitespace-nowrap">
                      {report.admin_decision || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-rx-elevated text-rx-text-secondary hover:text-foreground transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 text-sm font-ui text-rx-text-secondary">
          <span>Page {page} sur {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="input-field px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="input-field px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {selectedReport && <ReportDetailDrawer report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </div>
  )
}

export default ReportsPage
