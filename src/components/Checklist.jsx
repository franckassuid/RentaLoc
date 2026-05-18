import { useState, useEffect } from 'react';

const BLOC_A = [
  { id: 'qpv',         label: "QPV vérifié à l'adresse exacte (sig.ville.gouv.fr)" },
  { id: 'dvf',         label: "DVF consulté sur les 5 dernières ventes de la rue (app.dvf.etalab.gouv.fr)" },
  { id: 'georisques',  label: "Géorisques vérifié : inondation, argile, radon (georisques.gouv.fr)" },
  { id: 'dpe_real',    label: "DPE réel vérifié sur ADEME — méthode 3CL post juillet 2024" },
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

const DPE_BADGES = {
  A: 'bg-[#00703C] text-white',
  B: 'bg-[#03A655] text-white',
  C: 'bg-[#95D600] text-zinc-900',
  D: 'bg-[#FFF000] text-zinc-900',
  E: 'bg-[#FFA800] text-zinc-900',
  F: 'bg-[#FF6A00] text-white',
  G: 'bg-[#E30613] text-white',
};

const ETAT_LABELS = {
  bon: 'Bon état',
  rafraichissement: 'Rafraîchissement',
  travaux: 'Travaux importants',
};

const EXPO_LABELS = {
  N: 'Nord (N)',
  S: 'Sud (S)',
  E: 'Est (E)',
  O: 'Ouest (O)',
  double: 'Double expo',
};

function loadChecked(id) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + id);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function Checklist({ bien, inputs, unset = [], qualite = {}, onOpenAgencyCall, tab = 'checklist' }) {
  const { id, status, type = 'appartement' } = bien;
  const [checked, setChecked] = useState(() => loadChecked(id));

  useEffect(() => {
    setChecked(loadChecked(id));
  }, [id]);

  const toggle = (itemId) => {
    const next = { ...checked, [itemId]: !checked[itemId] };
    setChecked(next);
    localStorage.setItem(LS_PREFIX + id, JSON.stringify(next));
  };

  const isUnlocked = status === 'offre_envisagee' || status === 'ecarte';
  const activeItems = [...BLOC_A, ...(type === 'appartement' ? BLOC_B : BLOC_C)];
  const total = activeItems.length;
  const done = activeItems.filter((i) => checked[i.id]).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Build the dynamic "À demander à l'agence" list
  const toAsk = [];
  if (unset.includes('chargesCopro')) {
    toAsk.push({ id: 'chargesCopro', text: 'Charges de copropriété non renseignées — demander le décompte annuel' });
  }
  if (unset.includes('taxeFonciere')) {
    toAsk.push({ id: 'taxeFonciere', text: 'Taxe foncière non renseignée — demander l\'avis d\'imposition n−1' });
  }
  if (qualite.locataireEnPlace === null) {
    toAsk.push({ id: 'locataireEnPlace', text: 'Locataire en place non renseigné — demander si loué' });
  } else if (qualite.locataireEnPlace === true && (inputs.loyerMensuel === null || inputs.loyerMensuel === '')) {
    toAsk.push({ id: 'loyerMensuel', text: 'Loyer du locataire en place non renseigné — demander le montant' });
  }
  if (qualite.dpe === null) {
    toAsk.push({ id: 'dpe', text: 'DPE non renseigné — demander la classe énergétique' });
  }
  if (qualite.surface === null) {
    toAsk.push({ id: 'surface', text: 'Surface non renseignée — demander la surface Carrez' });
  }
  if (qualite.anneeConstruction === null) {
    toAsk.push({ id: 'anneeConstruction', text: 'Année de construction non renseignée — demander l\'année' });
  }
  if (qualite.etatGeneral === null) {
    toAsk.push({ id: 'etatGeneral', text: 'État général non renseigné — évaluer lors de la visite' });
  }
  if (qualite.etage === null) {
    toAsk.push({ id: 'etage', text: 'Étage non renseigné — demander l\'étage' });
  }
  if (type === 'appartement' && qualite.ascenseur === null) {
    toAsk.push({ id: 'ascenseur', text: 'Ascenseur non renseigné — demander s\'il y a un ascenseur' });
  }
  if (qualite.exposition === null) {
    toAsk.push({ id: 'exposition', text: 'Exposition non renseignée — demander l\'exposition' });
  }

  // Check if qualite and calculator details are completely empty for Section 2
  const hasQualiteDetails = 
    qualite.dpe !== null ||
    qualite.surface !== null ||
    qualite.anneeConstruction !== null ||
    qualite.etatGeneral !== null ||
    qualite.etage !== null ||
    (type === 'appartement' && qualite.ascenseur !== null) ||
    qualite.exposition !== null ||
    qualite.locataireEnPlace !== null ||
    !unset.includes('chargesCopro') ||
    !unset.includes('taxeFonciere');

  return (
    <div className="space-y-6">
      
      {tab === 'fiche' && (
        <>
          {/* SECTION 1: 📞 À demander à l'agence */}
      {toAsk.length > 0 && (
        <div className="card border-orange-500/20 dark:border-orange-500/10 bg-orange-500/[0.02] dark:bg-orange-500/[0.03]">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-2.5">
            <span className="text-base">📞</span>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex-1">
              À demander à l'agence
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400">
              {toAsk.length} en attente
            </span>
          </div>

          <div className="space-y-2.5">
            {toAsk.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/40 transition-all hover:border-zinc-200 dark:hover:border-zinc-800"
              >
                <span className="text-xs md:text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
                  {item.text}
                </span>
                <button
                  onClick={onOpenAgencyCall}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>Saisir</span>
                  <span>→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: 📋 Fiche du bien */}
      <div className="card">
        <div className="flex items-center justify-between gap-4 mb-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Fiche du bien
            </h3>
          </div>
          <button
            onClick={onOpenAgencyCall}
            className="flex items-center gap-1 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-lg transition-colors"
          >
            <span>✏️</span>
            <span>Modifier</span>
          </button>
        </div>

        {!hasQualiteDetails ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 italic py-2">
            Aucune information qualitative renseignée — utiliser le mode Appel agence.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* DPE badge display */}
            {qualite.dpe !== null && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30">
                <span className="text-xs font-semibold text-zinc-500">Classe énergétique (DPE)</span>
                <span className={`px-2.5 py-1 text-xs font-black rounded-lg border border-transparent ${DPE_BADGES[qualite.dpe]}`}>
                  {qualite.dpe}
                </span>
              </div>
            )}

            {/* Surface */}
            {qualite.surface !== null && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30">
                <span className="text-xs font-semibold text-zinc-500">Surface</span>
                <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">{qualite.surface} m²</span>
              </div>
            )}

            {/* Année de construction */}
            {qualite.anneeConstruction !== null && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30">
                <span className="text-xs font-semibold text-zinc-500">Année construction</span>
                <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">{qualite.anneeConstruction}</span>
              </div>
            )}

            {/* État général */}
            {qualite.etatGeneral !== null && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30">
                <span className="text-xs font-semibold text-zinc-500">État général</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{ETAT_LABELS[qualite.etatGeneral] || qualite.etatGeneral}</span>
              </div>
            )}

            {/* Étage */}
            {qualite.etage !== null && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30">
                <span className="text-xs font-semibold text-zinc-500">Étage</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{qualite.etage === 0 ? 'RDC' : `${qualite.etage}e étage`}</span>
              </div>
            )}

            {/* Ascenseur */}
            {type === 'appartement' && qualite.ascenseur !== null && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30">
                <span className="text-xs font-semibold text-zinc-500">Ascenseur</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{qualite.ascenseur ? 'Oui' : 'Non'}</span>
              </div>
            )}

            {/* Exposition */}
            {qualite.exposition !== null && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30">
                <span className="text-xs font-semibold text-zinc-500">Exposition</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{EXPO_LABELS[qualite.exposition] || qualite.exposition}</span>
              </div>
            )}

            {/* Locataire en place */}
            {qualite.locataireEnPlace !== null && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30">
                <span className="text-xs font-semibold text-zinc-500">Locataire en place</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{qualite.locataireEnPlace ? 'Oui (Loué)' : 'Non (Vide)'}</span>
              </div>
            )}

            {/* Loyer actuel (si loué) */}
            {qualite.locataireEnPlace === true && inputs.loyerMensuel && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30">
                <span className="text-xs font-semibold text-zinc-550">Loyer actuel en place</span>
                <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">{inputs.loyerMensuel} €/mois</span>
              </div>
            )}

            {/* Charges Copro */}
            {!unset.includes('chargesCopro') && inputs.chargesCopro && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30">
                <span className="text-xs font-semibold text-zinc-500">Charges copropriété</span>
                <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">{inputs.chargesCopro} €/an</span>
              </div>
            )}

            {/* Taxe foncière */}
            {!unset.includes('taxeFonciere') && inputs.taxeFonciere && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-800/30">
                <span className="text-xs font-semibold text-zinc-500">Taxe foncière</span>
                <span className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">{inputs.taxeFonciere} €/an</span>
              </div>
            )}

          </div>
        )}
      </div>
      </>
    )}

    {tab === 'checklist' && (
      <>
      {/* SECTION 3: ✅ Due diligence avant offre */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-2.5">
          <span className="text-base">✅</span>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex-1">
            Due diligence avant offre
          </h3>
          {isUnlocked && (
            <span className="text-xs font-mono text-zinc-400">
              {done}/{total}
            </span>
          )}
        </div>

        {!isUnlocked ? (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-900/50">
            <span className="text-sm leading-none flex-shrink-0 mt-0.5">🔒</span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
              Cette section se débloque quand le bien passe en statut <strong className="font-semibold text-zinc-700 dark:text-zinc-300">Offre envisagée</strong> dans le Pipeline.
            </p>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-zinc-500">{done} sur {total} vérifications faites</span>
                <span className="text-[11px] font-mono font-bold text-zinc-700 dark:text-zinc-300">{pct} %</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-350 ${
                    pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-zinc-400'
                  }`}
                  style={{ width: `${pct}%` }} 
                />
              </div>
            </div>

            {/* Checklist Blocks */}
            <div className="space-y-4 pt-1">
              
              {/* Block A */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-2">A — Commun</h4>
                <div className="space-y-1">
                  {BLOC_A.map((item) => (
                    <label key={item.id} className="flex items-start gap-2.5 py-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!!checked[item.id]} 
                        onChange={() => toggle(item.id)}
                        className="mt-0.5 w-4 h-4 flex-shrink-0 accent-zinc-900 dark:accent-zinc-100 cursor-pointer" 
                      />
                      <span className={`text-xs md:text-sm leading-snug ${checked[item.id] ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-700 dark:text-zinc-300 font-medium'}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Block B (Appartement only) */}
              {type === 'appartement' && (
                <div className="space-y-1 pt-2 border-t border-zinc-200/20 dark:border-zinc-800/20">
                  <h4 className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-2">B — Appartement</h4>
                  <div className="space-y-1">
                    {BLOC_B.map((item) => (
                      <label key={item.id} className="flex items-start gap-2.5 py-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!!checked[item.id]} 
                          onChange={() => toggle(item.id)}
                          className="mt-0.5 w-4 h-4 flex-shrink-0 accent-zinc-900 dark:accent-zinc-100 cursor-pointer" 
                        />
                        <span className={`text-xs md:text-sm leading-snug ${checked[item.id] ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-700 dark:text-zinc-300 font-medium'}`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Block C (Maison only) */}
              {type === 'maison' && (
                <div className="space-y-1 pt-2 border-t border-zinc-200/20 dark:border-zinc-800/20">
                  <h4 className="text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-2">C — Maison</h4>
                  <div className="space-y-1">
                    {BLOC_C.map((item) => (
                      <label key={item.id} className="flex items-start gap-2.5 py-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!!checked[item.id]} 
                          onChange={() => toggle(item.id)}
                          className="mt-0.5 w-4 h-4 flex-shrink-0 accent-zinc-900 dark:accent-zinc-100 cursor-pointer" 
                        />
                        <span className={`text-xs md:text-sm leading-snug ${checked[item.id] ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-700 dark:text-zinc-300 font-medium'}`}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
      </>
    )}
    </div>
  );
}
