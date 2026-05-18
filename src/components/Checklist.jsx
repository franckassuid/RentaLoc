import { useState, useEffect } from 'react';

const BLOC_A = [
  { id: 'qpv',         label: "QPV vérifié à l'adresse exacte (sig.ville.gouv.fr)" },
  { id: 'dvf',         label: "DVF consulté sur les 5 dernières ventes de la rue (app.dvf.etalab.gouv.fr)" },
  { id: 'georisques',  label: "Géorisques vérifié : inondation, argile, radon (georisques.gouv.fr)" },
  { id: 'dpe',         label: "DPE réel vérifié sur ADEME — méthode 3CL post juillet 2024" },
  { id: 'tf',          label: "Taxe foncière n−1 demandée au vendeur (pas un simulateur)" },
  { id: 'recalcul',    label: "Recalcul rendement et cashflow fait en propre" },
  { id: 'recul48h',    label: "48h de recul respectées entre offre acceptée et compromis" },
  { id: 'second_avis', label: "Second avis indépendant obtenu" },
];
const BLOC_B = [
  { id: 'ag_pv',       label: "3 derniers PV d'AG lus intégralement" },
  { id: 'travaux_ag',  label: "Travaux votés non exécutés vérifiés" },
  { id: 'fonds_alur',  label: "Fonds de travaux ALUR vérifié (min. 5 %/an des charges)" },
  { id: 'etat_date',   label: "État daté + carnet d'entretien demandés au syndic" },
  { id: 'charges_detail', label: "Charges copropriété détaillées (récupérable vs non récupérable)" },
  { id: 'impayes',     label: "Impayés en copropriété vérifiés" },
];
const BLOC_C = [
  { id: 'toiture',        label: "État de la toiture vérifié" },
  { id: 'assainissement', label: "Assainissement vérifié (collectif ou fosse septique conforme)" },
  { id: 'bornage',        label: "Bornage et mitoyenneté vérifiés" },
  { id: 'diagnostics',    label: "Diagnostics obligatoires complets (amiante, plomb, termites selon zone)" },
];

const LS_PREFIX = 'rentaloc_checklist_';

function loadChecked(id) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + id);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function Checklist({ bien }) {
  const { id, status, type = 'appartement' } = bien;
  const [checked, setChecked] = useState(() => loadChecked(id));
  const [open, setOpen] = useState(false);

  useEffect(() => { setChecked(loadChecked(id)); }, [id]);

  const isUnlocked = status === 'offre_envisagee';
  const activeItems = [...BLOC_A, ...(type === 'appartement' ? BLOC_B : BLOC_C)];
  const total = activeItems.length;
  const done = activeItems.filter((i) => checked[i.id]).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const toggle = (itemId) => {
    const next = { ...checked, [itemId]: !checked[itemId] };
    setChecked(next);
    localStorage.setItem(LS_PREFIX + id, JSON.stringify(next));
  };

  const Block = ({ title, items }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{title}</h4>
        <span className="text-xs font-mono text-zinc-400">{items.filter((i) => checked[i.id]).length}/{items.length}</span>
      </div>
      {items.map((item) => (
        <label key={item.id} className="flex items-start gap-2.5 py-1 cursor-pointer">
          <input type="checkbox" checked={!!checked[item.id]} onChange={() => toggle(item.id)}
            className="mt-0.5 w-4 h-4 flex-shrink-0 accent-zinc-900 dark:accent-zinc-100 cursor-pointer" />
          <span className={`text-sm leading-snug ${checked[item.id] ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-700 dark:text-zinc-300'}`}>
            {item.label}
          </span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="card">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">✅</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Checklist due diligence</span>
          {isUnlocked && <span className="text-xs font-mono text-zinc-400">{done}/{total}</span>}
        </div>
        <span className="text-zinc-400 text-sm transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {!isUnlocked && (
        <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-600 italic">
          🔒 La checklist se débloque à partir du statut <strong className="font-medium">Offre envisagée</strong>.
          Faites glisser la carte dans cette colonne du Pipeline.
        </p>
      )}

      {isUnlocked && open && (
        <div className="mt-4 space-y-5">
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-500">{done} / {total} vérifications</span>
              <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">{pct} %</span>
            </div>
            <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-zinc-400'}`}
                style={{ width: `${pct}%` }} />
            </div>
          </div>
          <Block title="A — Commun" items={BLOC_A} />
          {type === 'appartement' && <Block title="B — Appartement" items={BLOC_B} />}
          {type === 'maison' && <Block title="C — Maison" items={BLOC_C} />}
        </div>
      )}
    </div>
  );
}
