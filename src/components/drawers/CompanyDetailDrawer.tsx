import type { Company } from "@/data/mockData";
import { X } from "lucide-react";

interface Props {
  company: Company;
  onClose: () => void;
}

const CompanyDetailDrawer = ({ company, onClose }: Props) => (
  <>
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-40" onClick={onClose} />
    <div className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-rx-surface border-l border-border z-50 flex flex-col animate-slide-in-right">
      <div className="p-6 border-b border-border flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-rx-elevated flex items-center justify-center font-display text-xl text-rx-text-secondary">
            {company.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-display text-[24px] text-foreground">{company.name}</h2>
            <p className="font-ui text-sm text-rx-text-secondary">{company.country_flag} {company.city}, {company.country}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-rx-text-secondary hover:text-foreground"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="card-elevated p-4 space-y-3">
          <h3 className="table-header">Informations</h3>
          <div className="grid grid-cols-2 gap-3 text-sm font-ui">
            <div><span className="text-rx-text-secondary">Adresse</span><div className="text-foreground">{company.address}</div></div>
            <div><span className="text-rx-text-secondary">Téléphone</span><div className="text-foreground">{company.phone}</div></div>
            <div><span className="text-rx-text-secondary">Créé le</span><div className="font-mono-data text-xs text-rx-text-secondary">{company.created_at}</div></div>
            <div><span className="text-rx-text-secondary">ID</span><div className="font-mono-data text-[11px] text-rx-text-muted">{company.id}</div></div>
          </div>
        </div>

        <div className="card-elevated p-4">
          <h3 className="table-header mb-3">Disciplines</h3>
          <div className="flex flex-wrap gap-1">
            {company.disciplines.map(d => <span key={d} className="badge-pill">{d}</span>)}
          </div>
        </div>

        <div className="card-elevated p-4">
          <h3 className="table-header mb-3">Statistiques</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="font-display text-2xl text-foreground">{company.followers.toLocaleString()}</div>
              <div className="font-ui text-[10px] text-rx-text-secondary uppercase">Abonnés</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl text-foreground">{company.posts_count}</div>
              <div className="font-ui text-[10px] text-rx-text-secondary uppercase">Publications</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border flex gap-3">
        <button className="flex-1 h-11 border border-rx-blue text-rx-blue font-display uppercase text-sm rounded-lg hover:bg-[hsl(216_100%_59%/0.1)] transition-colors">Modifier</button>
        <button className="flex-1 h-11 border border-rx-warning text-rx-warning font-display uppercase text-sm rounded-lg hover:bg-[hsl(28_90%_65%/0.1)] transition-colors">
          {company.status === 'active' ? 'Bloquer' : 'Débloquer'}
        </button>
        <button className="h-11 px-4 bg-[hsl(0_47%_11%)] text-rx-danger font-display uppercase text-sm rounded-lg hover:bg-[hsl(0_47%_15%)] transition-colors">Supprimer</button>
      </div>
    </div>
  </>
);

export default CompanyDetailDrawer;
