import { useState, useEffect, useRef } from 'react';
import { compute, getLights, getVerdict } from '../compute';
import { VerdictBanner } from './VerdictBanner';
import { MetricsCards } from './MetricsCards';
import { SynthesisTable } from './SynthesisTable';
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
  const appliedPrefill = useRef(false);

  // Apply prefill values when coming from QuickView (only once per prefill change)
  useEffect(() => {
    if (prefill && !appliedPrefill.current) {
      appliedPrefill.current = true;
      resetInputs({ ...defaults, ...prefill });
    }
  }, [prefill]);

  const results = compute(inputs);

  const handleSave = ({ nom, ville, url, note: n }) => {
    const mergedInputs = { ...inputs, nom: nom || inputs.nom, ville: ville || inputs.ville };
    const r = compute(mergedInputs);
    const verdict = getVerdict(getLights(r));
    onSave({
      id: uuidv4(),
      nom: nom || inputs.nom,
      ville: ville || inputs.ville,
      url,
      note: n,
      createdAt: Date.now(),
      verdict,
      inputs: mergedInputs,
    });
    if (nom) updateField('nom', nom);
    if (ville) updateField('ville', ville);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-14 pb-8">

      {/*
        ── ZONE STICKY ──────────────────────────────────────────────────────────
        Verdict + MetricsCards fixés sous le header.
        top-14 = 56px (hauteur du header fixe).
        -mx-4 px-4 étire jusqu'aux bords pour un fond plein.
      */}
      <div className="sticky top-14 z-20 -mx-4 px-4 pt-2 pb-3 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800/60 space-y-3 print:relative print:top-auto print:border-0 print:bg-transparent">
        <VerdictBanner results={results} nom={inputs.nom} ville={inputs.ville} sticky={false}>
          <ExportButtons inputs={inputs} results={results} note={note} />
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 transition-colors no-print"
          >
            Sauvegarder
          </button>
        </VerdictBanner>

        <MetricsCards results={results} />
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
        <SynthesisTable results={results} />

        {/* Form — hidden on print */}
        <div className="no-print">
          <InputForm inputs={inputs} onChange={updateField} results={results} />
        </div>
      </div>

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
