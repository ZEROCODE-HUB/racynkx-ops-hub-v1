import type { User } from "@/data/mockData";
import { X } from "lucide-react";
import { useState } from "react";

interface Props {
  user: User;
  mode: 'view' | 'edit';
  onClose: () => void;
  onSwitchMode: (m: 'view' | 'edit') => void;
}

const UserDetailDrawer = ({ user, mode, onClose, onSwitchMode }: Props) => {
  const [editData, setEditData] = useState({ ...user });

  const StatBox = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center">
      <div className="font-display text-2xl text-foreground">{value}</div>
      <div className="font-ui text-[10px] text-rx-text-secondary uppercase tracking-wide">{label}</div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-rx-surface border-l border-border z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-full bg-rx-elevated flex items-center justify-center font-display text-2xl text-rx-text-secondary ${user.is_elite ? 'ring-2 ring-rx-gold' : ''}`}>
                {user.first_name[0]}{user.last_name[0]}
              </div>
              <div>
                <h2 className="font-display text-[28px] text-foreground leading-tight">{user.first_name} {user.last_name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge-pill">{user.user_type}</span>
                  <span className="font-mono-data text-[13px] text-rx-gold-light">{user.xp_score.toLocaleString()} XP</span>
                  <span className={`flex items-center gap-1 text-xs font-ui ${user.status === 'active' ? 'text-rx-success' : 'text-rx-danger'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-rx-success' : 'bg-rx-danger'}`} />
                    {user.status === 'active' ? 'Actif' : 'Bloqué'}
                  </span>
                </div>
                {user.is_elite && <span className="text-xs font-display text-rx-gold mt-1 inline-block">★ ELITE</span>}
              </div>
            </div>
            <button onClick={onClose} className="text-rx-text-secondary hover:text-foreground transition-colors"><X size={20} /></button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {mode === 'view' ? (
            <>
              <div className="card-elevated p-4 space-y-3">
                <h3 className="table-header">Informations personnelles</h3>
                <div className="grid grid-cols-2 gap-3 text-sm font-ui">
                  <div><span className="text-rx-text-secondary">Email</span><div className="text-foreground">{user.email}</div></div>
                  <div><span className="text-rx-text-secondary">Date de naissance</span><div className="text-foreground">{user.birth_date}</div></div>
                  <div><span className="text-rx-text-secondary">Genre</span><div className="text-foreground">{user.gender}</div></div>
                  <div><span className="text-rx-text-secondary">Nationalité</span><div className="text-foreground">{user.country_flag} {user.country}</div></div>
                  <div><span className="text-rx-text-secondary">Ville</span><div className="text-foreground">{user.city}</div></div>
                  <div><span className="text-rx-text-secondary">Région</span><div className="text-foreground">{user.region}</div></div>
                </div>
              </div>

              <div className="card-elevated p-4 space-y-3">
                <h3 className="table-header">Données sportives</h3>
                <div className="flex flex-wrap gap-1 mb-3">
                  {user.disciplines.map(d => <span key={d} className="badge-pill">{d}</span>)}
                </div>
                <div className="text-sm font-ui text-rx-text-secondary mb-2">Année de début: <span className="text-foreground">{user.start_year}</span></div>
                <div className="grid grid-cols-4 gap-2">
                  <StatBox value={user.races} label="Courses" />
                  <StatBox value={user.victories} label="Victoires" />
                  <StatBox value={user.podiums} label="Podiums" />
                  <StatBox value={user.titles} label="Titres" />
                </div>
              </div>

              <div className="card-elevated p-4 space-y-3">
                <h3 className="table-header">Compte</h3>
                <div className="grid grid-cols-2 gap-3 text-sm font-ui">
                  <div><span className="text-rx-text-secondary">Créé le</span><div className="text-foreground">{user.created_at}</div></div>
                  <div><span className="text-rx-text-secondary">Dernière connexion</span><div className="text-foreground">{user.last_login}</div></div>
                  <div><span className="text-rx-text-secondary">ID</span><div className="font-mono-data text-[11px] text-rx-text-muted">{user.id}</div></div>
                  <div><span className="text-rx-text-secondary">Studio</span><div className={user.is_studio_subscriber ? 'text-rx-gold' : 'text-foreground'}>{user.is_studio_subscriber ? '1,99€/mois' : 'Non'}</div></div>
                </div>
              </div>

              <div className="card-elevated p-4">
                <h3 className="table-header mb-3">Social</h3>
                <div className="grid grid-cols-2 gap-4">
                  <StatBox value={user.followers} label="Abonnés" />
                  <StatBox value={user.following} label="Abonnements" />
                </div>
              </div>
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
                  <label className="block text-sm font-ui text-rx-text-secondary mb-1.5">{f.label}</label>
                  <input value={editData[f.key]} onChange={e => setEditData({ ...editData, [f.key]: e.target.value })}
                    className="input-field w-full px-4 py-3" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="p-4 border-t border-border bg-rx-surface flex gap-3 shrink-0">
          {mode === 'view' ? (
            <>
              <button onClick={() => onSwitchMode('edit')}
                className="flex-1 h-11 border border-rx-blue text-rx-blue font-display uppercase text-sm rounded-lg hover:bg-[hsl(216_100%_59%/0.1)] transition-colors">
                Modifier
              </button>
              <button className="flex-1 h-11 border border-rx-warning text-rx-warning font-display uppercase text-sm rounded-lg hover:bg-[hsl(28_90%_65%/0.1)] transition-colors">
                {user.status === 'active' ? 'Bloquer' : 'Débloquer'}
              </button>
              <button className="h-11 px-4 bg-[hsl(0_47%_11%)] text-rx-danger font-display uppercase text-sm rounded-lg hover:bg-[hsl(0_47%_15%)] transition-colors">
                Supprimer
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onSwitchMode('view')}
                className="flex-1 h-11 border border-border text-rx-text-secondary font-display uppercase text-sm rounded-lg hover:text-foreground transition-colors">
                Annuler
              </button>
              <button className="flex-1 h-11 bg-rx-blue text-foreground font-display uppercase text-sm rounded-lg hover:bg-[hsl(216_100%_46%)] transition-colors">
                Enregistrer
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDetailDrawer;
