import { useState, useEffect, useRef } from 'react';
import { compute, getLights, getVerdict } from '../compute';
import { VerdictBanner } from './VerdictBanner';
import { MetricsCards } from './MetricsCards';
import { SynthesisTable } from './SynthesisTable';
import { NegotiationSimulator } from './NegotiationSimulator';
import { Checklist } from './Checklist';
import { MissingDataChecklist } from './MissingDataChecklist';
import { InputForm } from './InputForm';
import { ExportButtons } from './ExportButtons';
import { SaveModal } from './SaveModal';
import { v4 as uuidv4 } from 'uuid';
import { usePersistInputs } from '../hooks/usePersist';
import { DEFAULTS } from '../constants';

export function FullAnalysis({ prefill, onSave, effectiveDefaults }) {
  const defaults = effectiveDefaults ?? DEFAULTS;
  const [inputs, updateField, resetInputs] = usePersistInputs(
    'rentaloc_analysis',
    defaults
  );
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [note, setNote] = useState('');
  const [metricsOpen, setMetricsOpen] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [unset, setUnset] = useState(() => {
    try {
      const raw = localStorage.getItem('rentaloc_analysis_unset');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const appliedPrefill = useRef(false);
  // Extract bien metadata (_bien is attached by App when opening a saved bien)
  const bienMeta = prefill?._bien ?? null;

  // Apply prefill values when coming from QuickView/Pipeline (only once per prefill change)
  useEffect(() => {
    if (prefill && !appliedPrefill.current) {
      appliedPrefill.current = true;
      // Strip _bien metadata before using as form inputs
      const { _bien: _, ...cleanInputs } = prefill || {};
      resetInputs({ ...defaults, ...cleanInputs });
      if (_bien?.unset) {
        setUnset(_bien.unset);
      } else {
        setUnset([]);
      }
    }
  }, [prefill]);

  // Persist unset to localStorage
  useEffect(() => {
    localStorage.setItem('rentaloc_analysis_unset', JSON.stringify(unset));
  }, [unset]);

  const type = bienMeta?.type || 'appartement';

  // Substitution for unset fields
  const subInputs = { ...inputs };
  if (unset.includes('chargesCopro')) subInputs.chargesCopro = type === 'appartement' ? 800 : 0;
  if (unset.includes('taxeFonciere')) subInputs.taxeFonciere = inputs.prixFAI * 0.01;
  if (unset.includes('cfe')) subInputs.cfe = 250;
  if (unset.includes('assurancePNO')) subInputs.assurancePNO = 150;

  // Safe compute: treat '' as 0 to avoid NaN
  const safeInputs = { ...subInputs };
  for (const k in safeInputs) {
    if (safeInputs[k] === '') safeInputs[k] = 0;
  }

  const reqFields = ['prixFAI', 'loyerMensuel', 'tauxNotaire', 'budgetMobilier', 'vacanceMois', 'fraisGestion', 'provisionTravaux', 'fraisComptable', 'apport', 'dureeEmprunt', 'tauxInteret', 'tauxAssurance'];
  const isMissingReq = reqFields.some((f) => inputs[f] === '');

  // "Le calcul ne tourne pas" -> we can just pause the results update if invalid, but React needs something.
  // We'll compute anyway with 0, but the UI will show errors on fields.
  const results = compute(safeInputs);

  const toggleUnset = (field) => {
    setUnset((prev) => prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]);
  };

  const handleSave = ({ nom, ville, url, type, note: n }) => {
    if (isMissingReq) return;
    const mergedInputs = { ...inputs, nom: nom || inputs.nom, ville: ville || inputs.ville };
    const r = compute({ ...safeInputs, nom: mergedInputs.nom, ville: mergedInputs.ville });
    const verdict = getVerdict(getLights(r));
    onSave({
      id: uuidv4(),
      nom: nom || inputs.nom,
      ville: ville || inputs.ville,
      url,
      type: type || 'appartement',
      status: 'a_analyser',
      note: n,
      createdAt: Date.now(),
      verdict,
      unset,
      inputs: mergedInputs,
    });
    if (nom) updateField('nom', nom);
    if (ville) updateField('ville', ville);
  };

  const handleReset = () => {
    resetInputs({ ...defaults });
    setUnset([]);
    setNote('');
    setShowResetConfirm(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-14 pb-8">

      {/*
        ── ZONE STICKY ──────────────────────────────────────────────────────────
        Verdict + MetricsCards fixés sous le header.
        top-14 = 56px (hauteur du header fixe).
        -mx-4 px-4 étire jusqu'aux bords pour un fond plein.
      */}
      <div className="sticky top-14 z-20 -mx-4 px-4 pt-2 pb-2 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800/60 print:relative print:top-auto print:border-0 print:bg-transparent">

        {/* Row 1 : Verdict + actions */}
        <VerdictBanner results={results} nom={inputs.nom} ville={inputs.ville} unsetCount={unset.length}>
          <ExportButtons inputs={inputs} results={results} note={note} />

          {/* Save — icône seule */}
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={isMissingReq}
            title="Sauvegarder"
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors no-print text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            💾
          </button>

          {/* Reset — icône seule */}
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Réinitialiser l'analyse"
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500 hover:border-red-300 hover:text-red-500 dark:hover:text-red-400 transition-colors no-print text-sm"
          >
            ↺
          </button>
        </VerdictBanner>

        {/* Row 2 : MetricsCards (collapsible) */}
        {metricsOpen && (
          <div className="mt-2 pb-1">
            <MetricsCards results={results} />
          </div>
        )}

        {/* Toggle button — centered below the tiles */}
        <button
          onClick={() => setMetricsOpen((v) => !v)}
          title={metricsOpen ? 'Réduire les tuiles' : 'Afficher les tuiles'}
          className="w-full flex items-center justify-center gap-1 py-1 text-[11px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors no-print"
        >
          <span className="transition-transform duration-200" style={{ display: 'inline-block', transform: metricsOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}>▲</span>
          <span>{metricsOpen ? 'Réduire' : 'Afficher les tuiles'}</span>
        </button>
      </div>

      {/* ── CONTENU SCROLLABLE ───────────────────────────────────────────────── */}
      <div className="space-y-4 mt-4">
        {/* Note personnelle */}
        <div className="card no-print">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note personnelle (DPE, état général, contact agent…)"
            className="w-full text-sm text-zinc-600 dark:text-zinc-400 bg-transparent border-0 outline-none resize-none placeholder-zinc-300 dark:placeholder-zinc-700"
            rows={2}
          />
        </div>

        {/* Synthesis table — print-visible */}
        <SynthesisTable results={results} unset={unset} />

        <MissingDataChecklist 
          unset={unset} 
          onCheck={(field) => {
            toggleUnset(field);
            // Optional: focus the input if we wanted, but removing from unset is enough to un-gray it
          }} 
        />

        {/* Negotiation simulator */}
        <div className="no-print">
          <NegotiationSimulator inputs={inputs} />
        </div>

        {/* Checklist — visible when a saved bien has an id and status */}
        {bienMeta?.id && (
          <div className="no-print">
            <Checklist bien={{ id: bienMeta.id, status: bienMeta.status ?? 'a_analyser', type: bienMeta.type ?? 'appartement' }} />
          </div>
        )}

        {/* Form — hidden on print */}
        <div className="no-print">
          <InputForm 
            inputs={inputs} 
            onChange={updateField} 
            results={results} 
            unset={unset}
            onToggleUnset={toggleUnset}
          />
        </div>
      </div>

      {/* Reset confirm dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 w-full max-w-sm space-y-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Réinitialiser l'analyse en cours avec les valeurs par défaut de votre profil ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveModal && (
        <SaveModal
          onSave={handleSave}
          onClose={() => setShowSaveModal(false)}
          initialNom={inputs.nom}
          initialVille={inputs.ville}
        />
      )}
    </div>
  );
}
