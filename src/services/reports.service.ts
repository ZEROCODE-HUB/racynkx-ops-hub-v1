import { supabase } from '@/lib/supabase'
import type {
    Report,
    ReportContentType,
    ReportDecision,
    ReportListItem,
    ReportProfileRef,
    ReportTargetSummary,
    ReportReason,
    ReportStatus,
} from '@/types/database'

export interface GetReportsOptions {
    page?: number
    perPage?: number
    search?: string
    status?: ReportStatus | ''
    contentType?: ReportContentType | ''
    reason?: ReportReason | ''
}

export interface PaginatedReports {
    data: ReportListItem[]
    total: number
    page: number
    perPage: number
    totalPages: number
    pendingCount: number
}

export interface UpdateReportDecisionInput {
    reportId: string
    status: ReportStatus
    adminDecision: ReportDecision
    adminNote?: string | null
    resolvedBy: string
}

const CONTENT_LABELS: Record<ReportContentType, string> = {
    post: 'Publication',
    comment: 'Commentaire',
    profile: 'Profil',
    paddock: 'Paddock',
}

const REASON_LABELS: Record<ReportReason, string> = {
    inappropriate: 'Inapproprié / Non autorisé',
    offensive: 'Offensant',
    other: 'Autre motif',
}

const STATUS_LABELS: Record<ReportStatus, string> = {
    pending: 'En attente',
    under_review: 'En revue',
    resolved: 'Résolu',
}

const formatName = (profile?: ReportProfileRef | null) => {
    if (!profile) return 'Utilisateur supprimé'
    const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim()
    return fullName || profile.user_id
}

const isNumericId = (value: string) => /^\d+$/.test(value)

const toProfileRef = (profile: any): ReportProfileRef => profile as ReportProfileRef

const truncate = (value: string | null | undefined, length: number) => {
    if (!value) return null
    const trimmed = value.trim()
    return trimmed.length > length ? `${trimmed.slice(0, length).trimEnd()}…` : trimmed
}

const profileSelect = `
  user_id,
  first_name,
  last_name,
  birth_date,
  gender,
  nationality,
  profile_photo_url,
  banner_photo_url,
  bio,
  city,
  region,
  country,
  disciplines,
  start_year,
  role,
  followers_count,
  badge_name,
  experience_xp,
  selected_vcard_theme,
  subscription_status,
  account_role,
  status,
  created_at
`

export async function getReports(options: GetReportsOptions = {}): Promise<PaginatedReports> {
    const { page = 1, perPage = 25, search, status, contentType, reason } = options
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    let query = supabase
        .from('reports')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (status) {
        query = query.eq('status', status)
    }

    if (contentType) {
        query = query.eq('content_type', contentType)
    }

    if (reason) {
        query = query.eq('reason', reason)
    }

    if (search && search.length >= 2) {
        query = query.or(`description.ilike.%${search}%,content_snapshot.ilike.%${search}%,target_id.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    const reports = (data || []) as Report[]

    if (reports.length === 0) {
        const { count: pendingCount } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending')

        return {
            data: [],
            total: count || 0,
            page,
            perPage,
            totalPages: 0,
            pendingCount: pendingCount || 0,
        }
    }

    const participantIds = [...new Set([
        ...reports.map(report => report.reporter_id),
        ...reports.map(report => report.reported_user_id),
        ...reports.map(report => report.resolved_by).filter((value): value is string => Boolean(value)),
    ])]

    const { data: profilesData } = await supabase
        .from('profiles')
        .select(profileSelect)
        .in('user_id', participantIds)

    const profilesMap = new Map<string, ReportProfileRef>((profilesData || []).map((profile: any) => [profile.user_id, toProfileRef(profile)]))

    const postTargetIds = [...new Set(reports.filter(report => report.content_type === 'post').map(report => report.target_id))]
    const commentTargetIds = [...new Set(reports.filter(report => report.content_type === 'comment' && isNumericId(report.target_id)).map(report => Number(report.target_id)))]
    const paddockTargetIds = [...new Set(reports.filter(report => report.content_type === 'paddock').map(report => report.target_id))]

    const [postsResult, commentsResult, paddockResult] = await Promise.all([
        postTargetIds.length > 0
            ? supabase
                .from('posts')
                .select('id, user_id, title, description, public_id, created_at, visibility, likes_count, comments_count, celebrations_count')
                .in('public_id', postTargetIds)
            : Promise.resolve({ data: [], error: null }),
        commentTargetIds.length > 0
            ? supabase
                .from('post_comments')
                .select('id, post_id, user_id, content, created_at, likes_count, parent_comment_id')
                .in('id', commentTargetIds)
            : Promise.resolve({ data: [], error: null }),
        paddockTargetIds.length > 0
            ? supabase
                .from('paddock_posts')
                .select('id, author_user_id, vcard_user_id, title, body, created_at, deleted_at')
                .in('id', paddockTargetIds)
            : Promise.resolve({ data: [], error: null }),
    ])

    if (postsResult.error) throw postsResult.error
    if (commentsResult.error) throw commentsResult.error
    if (paddockResult.error) throw paddockResult.error

    const postRows = (postsResult.data || []) as any[]
    const commentRows = (commentsResult.data || []) as any[]
    const paddockRows = (paddockResult.data || []) as any[]

    const commentPostIds = [...new Set(commentRows.map(comment => comment.post_id).filter(Boolean))]
    const { data: commentPostsData } = commentPostIds.length > 0
        ? await supabase
            .from('posts')
            .select('id, title, public_id, user_id, created_at')
            .in('id', commentPostIds)
        : { data: [] as any[] }

    if (commentPostIds.length > 0) {
        const { error } = await supabase
            .from('posts')
            .select('id, title, public_id, user_id, created_at')
            .in('id', commentPostIds)
        if (error) throw error
    }

    const commentPostsMap = new Map<number, any>((commentPostIds.length > 0 ? (commentPostsData || []) : []).map((post: any) => [post.id, post]))

    const additionalProfileIds = [
        ...postRows.map(row => row.user_id),
        ...commentRows.map(row => row.user_id),
        ...paddockRows.map(row => row.author_user_id),
        ...paddockRows.map(row => row.vcard_user_id),
    ].filter(Boolean)

    if (additionalProfileIds.length > 0) {
        const missingProfileIds = [...new Set(additionalProfileIds)].filter(userId => !profilesMap.has(userId))
        if (missingProfileIds.length > 0) {
            const { data: extraProfilesData, error } = await supabase
                .from('profiles')
                .select(profileSelect)
                .in('user_id', missingProfileIds)
            if (error) throw error
                ; (extraProfilesData || []).forEach((profile: any) => {
                    profilesMap.set(profile.user_id, toProfileRef(profile))
                })
        }
    }

    const targetMap = new Map<string, ReportTargetSummary>()

    postRows.forEach(post => {
        const authorProfile = profilesMap.get(post.user_id) || null
        targetMap.set(String(post.public_id || post.id), {
            title: post.title || 'Publication sans titre',
            subtitle: truncate(post.description, 120),
            body: post.description || null,
            author_name: authorProfile ? formatName(authorProfile) : null,
            author_profile: authorProfile,
            created_at: post.created_at,
            target_id: String(post.public_id || post.id),
            link_label: `Post ${String(post.public_id || post.id)}`,
        })
    })

    commentRows.forEach(comment => {
        const authorProfile = profilesMap.get(comment.user_id) || null
        const parentPost = commentPostsMap.get(comment.post_id)
        targetMap.set(String(comment.id), {
            title: truncate(comment.content, 60) || 'Commentaire',
            subtitle: parentPost ? `Sur ${parentPost.title || parentPost.public_id || `post #${parentPost.id}`}` : `Sur la publication #${comment.post_id}`,
            body: comment.content,
            author_name: authorProfile ? formatName(authorProfile) : null,
            author_profile: authorProfile,
            created_at: comment.created_at,
            target_id: String(comment.id),
            link_label: `Commentaire #${comment.id}`,
        })
    })

    paddockRows.forEach(paddock => {
        const authorProfile = profilesMap.get(paddock.author_user_id) || null
        const vcardProfile = profilesMap.get(paddock.vcard_user_id) || null
        targetMap.set(String(paddock.id), {
            title: paddock.title,
            subtitle: paddock.deleted_at ? `Supprimé le ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(paddock.deleted_at))}` : truncate(paddock.body, 120),
            body: paddock.body,
            author_name: authorProfile ? formatName(authorProfile) : (vcardProfile ? formatName(vcardProfile) : null),
            author_profile: authorProfile || vcardProfile,
            created_at: paddock.created_at,
            target_id: String(paddock.id),
            link_label: `Paddock ${String(paddock.id).slice(0, 8)}`,
        })
    })

    const pendingReportsQuery = supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    const pendingCountResult = await pendingReportsQuery

    const enriched = reports.map(report => {
        const reporter = profilesMap.get(report.reporter_id) || null
        const reportedUser = profilesMap.get(report.reported_user_id) || null
        const resolvedByProfile = report.resolved_by ? profilesMap.get(report.resolved_by) || null : null
        const contentPreview = report.content_snapshot?.trim() || report.description?.trim() || report.target_id
        const target = targetMap.get(report.target_id) || targetMap.get(String(report.target_id)) || null

        return {
            ...report,
            reporter,
            reported_user: reportedUser,
            resolved_by_profile: resolvedByProfile,
            reporter_name: formatName(reporter),
            reported_user_name: formatName(reportedUser),
            resolved_by_name: resolvedByProfile ? formatName(resolvedByProfile) : null,
            content_label: CONTENT_LABELS[report.content_type],
            reason_label: REASON_LABELS[report.reason],
            status_label: STATUS_LABELS[report.status],
            content_preview: contentPreview,
            target,
        } satisfies ReportListItem
    })

    return {
        data: enriched,
        total: count || 0,
        page,
        perPage,
        totalPages: Math.ceil((count || 0) / perPage),
        pendingCount: pendingCountResult.count || 0,
    }
}

export async function updateReportDecision(input: UpdateReportDecisionInput): Promise<void> {
    const { error } = await supabase
        .from('reports')
        .update({
            status: input.status,
            admin_decision: input.adminDecision,
            admin_note: input.adminNote ?? null,
            resolved_by: input.resolvedBy,
            resolved_at: new Date().toISOString(),
        })
        .eq('id', input.reportId)

    if (error) throw error
}