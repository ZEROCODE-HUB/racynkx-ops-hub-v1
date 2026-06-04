import { useMemo } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateReportDecision } from '@/hooks/mutations/useReportMutations'
import type { ReportDecision, ReportListItem } from '@/types/database'

interface Props {
  report: ReportListItem
  onClose: () => void
}

const formatDate = (value: string | null) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const initials = (name: string) => name.split(' ').filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase()

const profileSummary = (profile?: ReportListItem['reported_user']) => {
  if (!profile) return 'Profil supprimé'
  const location = [profile.city, profile.region, profile.country].filter(Boolean).join(', ')
  const extras = [profile.role, profile.badge_name].filter(Boolean).join(' · ')
  return [extras, location].filter(Boolean).join(' · ') || '—'
}

const decisionMeta: Record<ReportDecision, { label: string; note: string; className: string }> = {
  rejected: {
    label: 'Rejeter',
    note: 'Signalement rejeté après examen.',
    className: 'border border-border text-rx-text-secondary hover:text-foreground',
  },
  deleted: {
    label: 'Supprimer',
    note: 'Contenu supprimé depuis le tableau de modération.',
    className: 'bg-[hsl(0_47%_11%)] text-rx-danger hover:bg-[hsl(0_47%_15%)]',
  },
  warning: {
    label: 'Avertir',
    note: 'Avertissement envoyé depuis le tableau de modération.',
    className: 'bg-rx-warning text-background hover:brightness-110',
  },
}

const ReportDetailDrawer = ({ report, onClose }: Props) => {
  const { user } = useAuth()
  const updateDecision = useUpdateReportDecision()

  const people = useMemo(() => ([
    {
      title: 'Signaleur',
      name: report.reporter_name,
      profile: report.reporter,
    },
    {
      title: 'Utilisateur signalé',
      name: report.reported_user_name,
      profile: report.reported_user,
    },
  ]), [report])

  const handleDecision = async (decision: ReportDecision) => {
    if (!user?.id) {
      toast.error('Session admin introuvable.')
      return
    }

    await updateDecision.mutateAsync({
      reportId: report.id,
      status: 'resolved',
      adminDecision: decision,
      adminNote: decisionMeta[decision].note,
      resolvedBy: user.id,
    })

    toast.success(`Signalement ${decisionMeta[decision].label.toLowerCase()}.`)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[520px] bg-rx-surface border-l border-border z-50 flex flex-col animate-slide-in-right">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl text-foreground uppercase tracking-tight">Détail signalement</h2>
            <p className="font-ui text-xs text-rx-text-secondary mt-1">#{report.report_number}</p>
          </div>
          <button onClick={onClose} className="text-rx-text-secondary hover:text-foreground transition-colors p-1"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          <div className="card-elevated p-4 space-y-3">
            <h3 className="table-header">Infos du signalement</h3>
            <div className="grid grid-cols-2 gap-3 text-[13px] font-ui">
              <div>
                <span className="text-rx-text-secondary block text-[11px] mb-0.5">ID</span>
                <div className="font-mono-data text-xs text-rx-text-muted break-all">{report.id}</div>
              </div>
              <div>
                <span className="text-rx-text-secondary block text-[11px] mb-0.5">Créé le</span>
                <div className="font-mono-data text-xs text-rx-text-secondary">{formatDate(report.created_at)}</div>
              </div>
              <div>
                <span className="text-rx-text-secondary block text-[11px] mb-0.5">Type</span>
                <span className="badge-pill">{report.content_label}</span>
              </div>
              <div>
                <span className="text-rx-text-secondary block text-[11px] mb-0.5">Motif</span>
                <span className={`badge-pill ${report.reason === 'inappropriate' ? '!text-rx-warning' : report.reason === 'offensive' ? '!text-rx-danger' : '!text-rx-text-secondary'}`}>
                  {report.reason_label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[13px] font-ui">
              <div>
                <span className="text-rx-text-secondary block text-[11px] mb-0.5">Statut</span>
                <div className="font-medium text-foreground">{report.status_label}</div>
              </div>
              <div>
                <span className="text-rx-text-secondary block text-[11px] mb-0.5">Décision admin</span>
                <div className="font-medium text-foreground">{report.admin_decision || '—'}</div>
              </div>
            </div>

            {report.description && (
              <div className="border-l-2 border-rx-blue bg-[hsl(var(--bg-elevated)/0.5)] p-3 rounded-r-lg">
                <p className="font-ui text-[13px] text-rx-text-secondary leading-relaxed">{report.description}</p>
              </div>
            )}
          </div>

          <div className="card-elevated p-4 space-y-3">
            <h3 className="table-header">Personnes impliquées</h3>
            {people.map(person => (
              <div key={person.title}>
                <p className="text-[11px] font-ui text-rx-text-secondary mb-2">{person.title}</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rx-elevated flex items-center justify-center text-[11px] font-ui font-medium text-rx-text-secondary">
                    {initials(person.name)}
                  </div>
                  <div>
                    <div className="font-ui text-[13px] text-foreground">{person.name}</div>
                    <div className="text-[11px] text-rx-text-secondary">
                      {person.profile?.role || '—'}{person.profile?.city || person.profile?.country ? ` · ${[person.profile?.city, person.profile?.country].filter(Boolean).join(', ')}` : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-elevated p-4 space-y-3">
            <h3 className="table-header">Contenu signalé</h3>
            <div className="space-y-1">
              <div className="font-ui font-semibold text-[13px] text-foreground">{report.target?.title || report.content_label}</div>
              {report.target?.subtitle && (
                <div className="font-ui text-[12px] text-rx-text-secondary">{report.target.subtitle}</div>
              )}
              {report.target?.author_name && (
                <div className="text-[11px] text-rx-text-muted">Auteur: {report.target.author_name}</div>
              )}
            </div>
            <p className="font-ui text-[13px] text-rx-text-secondary leading-relaxed break-words">{report.target?.body || report.content_preview}</p>
            <div className="font-mono-data text-[11px] text-rx-text-muted break-all">Target: {report.target?.link_label || report.target_id}</div>
            {report.target?.author_profile && (
              <div className="border-t border-border pt-3 text-[11px] text-rx-text-secondary space-y-1">
                <div>Profil auteur: {profileSummary(report.target.author_profile)}</div>
                <div>{report.target.author_profile.followers_count} followers · {report.target.author_profile.experience_xp ?? 0} xp · {report.target.author_profile.account_role}</div>
              </div>
            )}
          </div>

          {report.admin_note && (
            <div className="card-elevated p-4 space-y-2">
              <h3 className="table-header">Note admin</h3>
              <p className="font-ui text-[13px] text-rx-text-secondary leading-relaxed">{report.admin_note}</p>
              <p className="text-[11px] text-rx-text-muted">Résolu le {formatDate(report.resolved_at)}{report.resolved_by_name ? ` par ${report.resolved_by_name}` : ''}</p>
            </div>
          )}
        </div>

        {report.status === 'pending' && (
          <div className="p-4 border-t border-border bg-rx-surface space-y-3 shrink-0">
            <div className="table-header">Décision admin</div>
            <div className="flex gap-3">
              {(Object.keys(decisionMeta) as ReportDecision[]).map(decision => (
                <button
                  key={decision}
                  onClick={() => handleDecision(decision)}
                  disabled={updateDecision.isPending}
                  className={`flex-1 h-10 font-ui font-medium text-[13px] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${decisionMeta[decision].className}`}
                >
                  {decisionMeta[decision].label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ReportDetailDrawer
