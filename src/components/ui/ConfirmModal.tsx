import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

interface BlockModalProps {
  userName: string;
  isBlocked: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BlockModal = ({ userName, isBlocked, onConfirm, onCancel }: BlockModalProps) => (
  <>
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] z-[60] animate-fade-in" onClick={onCancel} />
    <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
      <div className="bg-rx-surface border border-border rounded-xl w-full max-w-[440px] overflow-hidden animate-fade-in">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[hsl(28_90%_65%/0.15)] flex items-center justify-center">
              <AlertTriangle size={20} className="text-rx-warning" />
            </div>
            <h3 className="font-display text-xl text-foreground">
              {isBlocked ? 'Débloquer cet utilisateur ?' : 'Bloquer cet utilisateur ?'}
            </h3>
          </div>
          <div className="font-ui text-sm text-rx-text-secondary leading-relaxed">
            {isBlocked ? (
              <p>Le profil de <strong className="text-foreground">{userName}</strong> sera de nouveau visible pour tous les utilisateurs.</p>
            ) : (
              <>
                <p>Le profil de <strong className="text-foreground">{userName}</strong> sera masqué de tous les autres utilisateurs.</p>
                <p className="mt-2">Les données sont conservées en base. Cette action est réversible.</p>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-3 p-4 border-t border-border">
          <button onClick={onCancel}
            className="flex-1 h-11 border border-border text-rx-text-secondary font-ui font-medium text-sm rounded-lg hover:text-foreground transition-colors">
            Annuler
          </button>
          <button onClick={onConfirm}
            className={`flex-1 h-11 font-ui font-medium text-sm rounded-lg transition-colors ${
              isBlocked
                ? 'bg-rx-success text-foreground hover:brightness-110'
                : 'bg-rx-warning text-background hover:brightness-110'
            }`}>
            {isBlocked ? 'Débloquer' : 'Bloquer'}
          </button>
        </div>
      </div>
    </div>
  </>
);

interface DeleteModalProps {
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteModal = ({ userName, onConfirm, onCancel }: DeleteModalProps) => {
  const [confirmName, setConfirmName] = useState('');
  const fullName = userName;
  const isMatch = confirmName.trim().toLowerCase() === fullName.trim().toLowerCase();

  return (
    <>
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.6)] z-[60] animate-fade-in" onClick={onCancel} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div className="bg-rx-surface border border-border rounded-xl w-full max-w-[440px] overflow-hidden animate-fade-in">
          <div className="bg-[hsl(0_47%_11%)] px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[hsl(0_72%_57%/0.2)] flex items-center justify-center">
              <Trash2 size={20} className="text-rx-danger" />
            </div>
            <h3 className="font-display text-xl text-rx-danger">Supprimer définitivement ?</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="font-ui text-sm text-rx-text-secondary leading-relaxed">
              <p className="font-ui font-semibold text-foreground text-xs uppercase tracking-wide mb-2">CETTE ACTION EST IRRÉVERSIBLE.</p>
              <p>Toutes les données de <strong className="text-foreground">{fullName}</strong> (publications, commentaires, score) seront supprimées.</p>
            </div>
            <div>
              <label className="block text-sm font-ui text-rx-text-secondary mb-1.5">
                Saisissez le nom complet pour confirmer :
              </label>
              <input value={confirmName} onChange={e => setConfirmName(e.target.value)}
                placeholder={fullName}
                className="input-field w-full px-4 py-3 text-sm" />
            </div>
          </div>
          <div className="flex gap-3 p-4 border-t border-border">
            <button onClick={onCancel}
              className="flex-1 h-11 border border-border text-rx-text-secondary font-ui font-medium text-sm rounded-lg hover:text-foreground transition-colors">
              Annuler
            </button>
            <button onClick={onConfirm} disabled={!isMatch}
              className="flex-1 h-11 font-ui font-medium text-sm rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-rx-danger text-foreground hover:brightness-110">
              Supprimer définitivement
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
