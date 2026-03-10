import type { Report } from "@/data/mockData";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  report: Report;
  onClose: () => void;
}

const ReportDetailDrawer = ({ report, onClose }: Props) => {
  const [showWarnForm, setShowWarnForm] = useState(false);
  const [warnSubject] = useState('Avis concernant votre contenu RACYNKX');
  const [warnText, setWarnText] = useState(
    `Bonjour,\n\nSuite à un signalement concernant votre activité récente sur RACYNKX, nous vous rappelons que tout contenu doit respecter nos conditions d'utilisation et nos règles communautaires.\n\nNous vous invitons à relire nos CGU afin d'éviter toute mesure complémentaire.\n\nL'équipe RACYNKX`
  );

  const handleReject = () => {
    toast.success('Signalement rejeté.');
    onClose();
  };

  const handleDelete = () => {
    toast.success('Contenu supprimé.');
    onClose();
  };

  const handleSendWarn = () => {
    toast.success('Avertissement envoyé & signalement résolu.');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-rx-surface border-l border-border z-50 flex flex-col animate-slide-in-right">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground uppercase tracking-tight">Détail signalement</h2>
          <button onClick={onClose} className="text-rx-text-secondary hover:text-foreground transition-colors p-1"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          {/* Report info */}
          <div className="card-elevated p-4 space-y-3">
            <h3 className="table-header">Infos du signalement</h3>
            <div className="grid grid-cols-2 gap-3 text-[13px] font-ui">
              <div><span className="text-rx-text-secondary block text-[11px] mb-0.5">ID</span><div className="font-mono-data text-xs text-rx-text-muted">{report.id}</div></div>
              <div><span className="text-rx-text-secondary block text-[11px] mb-0.5">Date</span><div className="font-mono-data text-xs text-rx-text-secondary">{report.created_at}</div></div>
              <div><span className="text-rx-text-secondary block text-[11px] mb-0.5">Catégorie</span><div>
                <span className={`badge-pill ${report.reason === 'Offensant' ? '!text-rx-danger' : report.reason.includes('Inapproprié') ? '!text-rx-warning' : ''}`}>{report.reason}</span>
              </div></div>
            </div>
            {report.free_text && (
              <div className="border-l-2 border-rx-blue bg-[hsl(var(--bg-elevated)/0.5)] p-3 rounded-r-lg">
                <p className="font-ui text-[13px] text-rx-text-secondary italic">"{report.free_text}"</p>
              </div>
            )}
          </div>

          {/* Reporter */}
          <div className="card-elevated p-4">
            <h3 className="table-header mb-2">Signaleur</h3>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rx-elevated flex items-center justify-center text-[11px] font-ui font-medium text-rx-text-secondary">
                {report.reporter_name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="font-ui text-[13px] text-foreground cursor-pointer hover:text-rx-blue transition-colors">{report.reporter_name}</span>
            </div>
          </div>

          {/* Reported user */}
          <div className="card-elevated p-4">
            <h3 className="table-header mb-2">Utilisateur signalé</h3>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rx-elevated flex items-center justify-center text-[11px] font-ui font-medium text-rx-text-secondary">
                {report.reported_user_name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="font-ui text-[13px] text-foreground cursor-pointer hover:text-rx-blue transition-colors">{report.reported_user_name}</span>
            </div>
          </div>

          {/* Content preview */}
          <div className="card-elevated p-4">
            <h3 className="table-header mb-2">Contenu signalé</h3>
            <p className="font-ui text-[13px] text-rx-text-secondary leading-relaxed">{report.content_preview}</p>
          </div>

          {/* Warn form — Email Composer */}
          {showWarnForm && (
            <div className="card-elevated p-4 space-y-3">
              <h3 className="table-header">Avertissement par email</h3>
              <div>
                <label className="block text-[11px] font-ui text-rx-text-secondary mb-1">À</label>
                <input readOnly value={report.reported_user_email} className="input-field w-full px-3 py-2.5 font-mono-data text-xs opacity-60" />
              </div>
              <div>
                <label className="block text-[11px] font-ui text-rx-text-secondary mb-1">Objet</label>
                <input readOnly value={warnSubject} className="input-field w-full px-3 py-2.5 text-[13px] opacity-60" />
              </div>
              <div>
                <label className="block text-[11px] font-ui text-rx-text-secondary mb-1">Message</label>
                <textarea value={warnText} onChange={e => setWarnText(e.target.value)}
                  rows={8} className="input-field w-full px-3 py-2.5 text-[13px] resize-none leading-relaxed" />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowWarnForm(false)}
                  className="flex-1 h-10 border border-border text-rx-text-secondary font-ui font-medium text-[13px] rounded-lg hover:text-foreground transition-colors">
                  Annuler
                </button>
                <button onClick={handleSendWarn}
                  className="flex-1 h-10 bg-rx-gold text-foreground font-display uppercase text-[13px] rounded-lg hover:brightness-110 transition-all">
                  Envoyer & Résoudre
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Decision panel */}
        {report.status === 'pending' && !showWarnForm && (
          <div className="p-4 border-t border-border bg-rx-surface space-y-3 shrink-0">
            <div className="table-header">Décision admin</div>
            <div className="flex gap-3">
              <button onClick={handleReject}
                className="flex-1 h-10 border border-border text-rx-text-secondary font-ui font-medium text-[13px] rounded-lg hover:text-foreground transition-colors">
                Rejeter
              </button>
              <button onClick={handleDelete}
                className="flex-1 h-10 bg-[hsl(0_47%_11%)] text-rx-danger font-ui font-medium text-[13px] rounded-lg hover:bg-[hsl(0_47%_15%)] transition-colors">
                Supprimer
              </button>
              <button onClick={() => setShowWarnForm(true)}
                className="flex-1 h-10 bg-rx-warning text-background font-ui font-medium text-[13px] rounded-lg hover:brightness-110 transition-all">
                Avertir
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ReportDetailDrawer;
