import type { Profile } from "@/types/database";
import { X, RotateCcw, AlertTriangle, CheckCircle, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { useUpdateProfile, useUpdateProfileStatus } from "@/hooks/mutations/useProfileMutations";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

interface Props {
  profile: Profile;
  mode: 'view' | 'edit';
  onClose: () => void;
  onSwitchMode: (m: 'view' | 'edit') => void;
  onStatusChange?: (profile: Profile) => void;
  onProfileUpdate?: (profile: Profile) => void;
}

const UserDetailDrawer = ({ profile, mode, onClose, onSwitchMode, onStatusChange, onProfileUpdate }: Props) => {
  const [editData, setEditData] = useState({ ...profile });
  const [showStatusModal, setShowStatusModal] = useState<'block' | 'unblock' | null>(null);

  const updateProfile = useUpdateProfile();
  const updateStatus = useUpdateProfileStatus();

  useEffect(() => {
    setEditData({ ...profile });
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate(
      { userId: profile.user_id, updates: editData },
      {
        onSuccess: (updated) => {
          onSwitchMode('view');
          if (updated) onProfileUpdate?.(updated);
        },
      }
    );
  };

  const handleStatusToggle = () => {
    const newStatus: 'active' | 'disabled' = profile.status === 'active' ? 'disabled' : 'active';
    setShowStatusModal(newStatus === 'disabled' ? 'block' : 'unblock');
  };

  const confirmStatusChange = () => {
    if (!showStatusModal) return;
    const newStatus: 'active' | 'disabled' = showStatusModal === 'block' ? 'disabled' : 'active';
    updateStatus.mutate(
      { userId: profile.user_id, status: newStatus },
      {
        onSuccess: (updated) => {
          setShowStatusModal(null);
          if (updated) {
            onStatusChange?.(updated);
          }
        },
      }
    );
  };

  const StatBox = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center">
      <div className="font-display text-2xl text-foreground">{value}</div>
      <div className="font-ui text-[10px] text-rx-text-secondary uppercase tracking-wide">{label}</div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-rx-surface border-l border-border z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {profile.profile_photo_url ? (
                <img src={profile.profile_photo_url} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-rx-elevated flex items-center justify-center font-display text-xl text-rx-text-secondary">
                  {(profile.first_name?.[0] || '?')}{(profile.last_name?.[0] || '')}
                </div>
              )}
              <div>
                <h2 className="font-display text-[26px] text-foreground leading-tight">
                  {profile.first_name} {profile.last_name}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="badge-pill">{profile.role || '—'}</span>
                  <span className="font-mono-data text-[12px] text-rx-gold-light">
                    {profile.experience_xp?.toLocaleString() || 0} XP
                  </span>
<span className={`flex items-center gap-1 text-xs font-ui ${profile.status === 'active' ? 'text-rx-success' : 'text-rx-danger'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${profile.status === 'active' ? 'bg-rx-success' : 'bg-rx-danger'}`} />
                      {profile.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                    <button
                      onClick={handleStatusToggle}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${profile.status === 'active'
                          ? 'border-[hsl(0_47%_11%)] text-rx-danger hover:bg-[hsl(0_47%_11%)]'
                          : 'border-rx-success/30 text-rx-success hover:bg-rx-success/10'
                        }`}>
                      {profile.status === 'active' ? 'Désactiver' : 'Activer'}
                    </button>
                </div>
                {profile.badge_name && (
                  <span className="text-xs font-display text-rx-gold mt-1 inline-block">★ {profile.badge_name}</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-rx-text-secondary hover:text-foreground transition-colors p-1">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5 space-y-4">
          {mode === 'view' ? (
            <>
              <div className="card-elevated p-4 space-y-3">
                <h3 className="table-header">Informations personnelles</h3>
                <div className="grid grid-cols-2 gap-3 text-[13px] font-ui">
                  <div>
                    <span className="text-rx-text-secondary block text-[11px] mb-0.5">Date de naissance</span>
                    <div className="text-foreground">{profile.birth_date || '—'}</div>
                  </div>
                  <div>
                    <span className="text-rx-text-secondary block text-[11px] mb-0.5">Genre</span>
                    <div className="text-foreground">{profile.gender || '—'}</div>
                  </div>
                  <div>
                    <span className="text-rx-text-secondary block text-[11px] mb-0.5">Nationalité</span>
                    <div className="text-foreground">{profile.nationality || profile.country || '—'}</div>
                  </div>
                  <div>
                    <span className="text-rx-text-secondary block text-[11px] mb-0.5">Ville</span>
                    <div className="text-foreground">{profile.city || '—'}</div>
                  </div>
                  <div>
                    <span className="text-rx-text-secondary block text-[11px] mb-0.5">Région</span>
                    <div className="text-foreground">{profile.region || '—'}</div>
                  </div>
                  <div>
                    <span className="text-rx-text-secondary block text-[11px] mb-0.5">Inscrit le</span>
                    <div className="text-foreground">
                      {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : '—'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-elevated p-4 space-y-3">
                <h3 className="table-header">Données sportives</h3>
                <div className="flex flex-wrap gap-1 mb-3">
                  {profile.disciplines?.map(d => (
                    <span key={d} className="badge-pill">{d}</span>
                  ))}
                </div>
                <div className="text-[13px] font-ui text-rx-text-secondary mb-3">
                  Année de début: <span className="text-foreground">{profile.start_year || '—'}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <StatBox value={profile.followers_count || 0} label="Followers" />
                  <StatBox value={profile.experience_xp || 0} label="XP" />
                </div>
              </div>

              <div className="card-elevated p-4 space-y-3">
                <h3 className="table-header">Compte</h3>
                <div className="grid grid-cols-2 gap-3 text-[13px] font-ui">
                  <div>
                    <span className="text-rx-text-secondary block text-[11px] mb-0.5">ID</span>
                    <div className="font-mono-data text-[11px] text-rx-text-muted">{profile.user_id.slice(0, 12)}...</div>
                  </div>
                  <div>
                    <span className="text-rx-text-secondary block text-[11px] mb-0.5">Rôle</span>
                    <div className="text-foreground">{profile.role || '—'}</div>
                  </div>
                  <div>
                    <span className="text-rx-text-secondary block text-[11px] mb-0.5">Abonnements</span>
                    <div className="text-foreground">{profile.account_role || '—'}</div>
                  </div>
                  <div>
                    <span className="text-rx-text-secondary block text-[11px] mb-0.5">Email</span>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div className="font-mono-data text-[11px] text-rx-text-muted truncate max-w-[180px] cursor-default">
                          {profile.email || '—'}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="flex items-center gap-2 max-w-xs">
                        <span className="font-mono-data text-xs break-all">{profile.email || '—'}</span>
                        {profile.email && (
                          <button
                            onClick={() => { navigator.clipboard.writeText(profile.email || ''); toast({ title: "Copié!", description: "Email copié au presse-papiers" }); }}
                            className="p-1 hover:bg-rx-elevated rounded shrink-0"
                          >
                            <Copy size={14} />
                          </button>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              {profile.bio && (
                <div className="card-elevated p-4">
                  <h3 className="table-header mb-2">Bio</h3>
                  <p className="text-[13px] font-ui text-rx-text-secondary">{profile.bio}</p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Prénom', key: 'first_name' as const },
                { label: 'Nom', key: 'last_name' as const },
                { label: 'Ville', key: 'city' as const },
                { label: 'Région', key: 'region' as const },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[13px] font-ui text-rx-text-secondary mb-1.5">{f.label}</label>
                  <input
                    value={(editData as any)[f.key] || ''}
                    onChange={e => setEditData({ ...editData, [f.key]: e.target.value })}
                    className="input-field w-full px-4 py-3"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="p-4 border-t border-border bg-rx-surface flex gap-3 shrink-0">
          {mode === 'view' ? (
            <>
              <button
                onClick={() => onSwitchMode('edit')}
                className="flex-1 h-10 border border-rx-blue text-rx-blue font-ui font-medium text-[13px] rounded-lg hover:bg-[hsl(216_100%_59%/0.1)] transition-colors">
                Modifier
              </button>
              <button
                onClick={handleStatusToggle}
                className={`h-10 px-4 font-ui font-medium text-[13px] rounded-lg transition-colors ${profile.status === 'active'
                    ? 'bg-[hsl(0_47%_11%)] text-rx-danger hover:bg-[hsl(0_47%_15%)]'
                    : 'bg-rx-success/10 text-rx-success hover:bg-rx-success/20'
                  }`}>
                {profile.status === 'active' ? 'Désactiver' : 'Activer'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setEditData({ ...profile }); onSwitchMode('view'); }}
                className="flex-1 h-10 border border-border text-rx-text-secondary font-ui font-medium text-[13px] rounded-lg hover:text-foreground hover:bg-rx-elevated transition-colors">
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="flex-1 h-10 bg-rx-blue text-foreground font-ui font-medium text-[13px] rounded-lg hover:bg-[hsl(216_100%_46%)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {updateProfile.isPending ? <RotateCcw size={14} className="animate-spin" /> : 'Enregistrer'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <>
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-[60] animate-fade-in" onClick={() => setShowStatusModal(null)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] bg-rx-surface border border-border rounded-xl z-[70] p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${showStatusModal === 'block' ? 'bg-[hsl(0_47%_11%)]' : 'bg-rx-success/10'}`}>
                {showStatusModal === 'block' ? (
                  <AlertTriangle size={20} className="text-rx-danger" />
                ) : (
                  <CheckCircle size={20} className="text-rx-success" />
                )}
              </div>
              <h3 className="font-display text-lg text-foreground">
                {showStatusModal === 'block' ? 'Bloquer l\'utilisateur' : 'Débloquer l\'utilisateur'}
              </h3>
            </div>
            <p className="text-[13px] font-ui text-rx-text-secondary mb-6">
              {showStatusModal === 'block' ? (
                <>Êtes-vous sûr de vouloir bloquer <strong className="text-foreground">{profile.first_name} {profile.last_name}</strong> ? L&apos;utilisateur ne pourra plus se connecter.</>
              ) : (
                <>Le profil de <strong className="text-foreground">{profile.first_name} {profile.last_name}</strong> sera de nouveau visible pour tous les utilisateurs.</>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(null)}
                className="flex-1 h-10 border border-border text-rx-text-secondary font-ui font-medium text-[13px] rounded-lg hover:text-foreground hover:bg-rx-elevated transition-colors">
                Annuler
              </button>
              <button
                onClick={confirmStatusChange}
                disabled={updateStatus.isPending}
                className={`flex-1 h-10 font-ui font-medium text-[13px] rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${showStatusModal === 'block'
                    ? 'bg-rx-danger text-foreground hover:bg-[hsl(0_47%_51%)]'
                    : 'bg-rx-success text-foreground hover:bg-[hsl(142_76%_36%)]'
                  }`}>
                {updateStatus.isPending ? <RotateCcw size={14} className="animate-spin" /> : (showStatusModal === 'block' ? 'Bloquer' : 'Débloquer')}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UserDetailDrawer;