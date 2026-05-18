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

export function FullAnalysis({ prefill, biens = [], onSave, effectiveDefaults }) {
  const defaults = effectiveDefaults ?? DEFAULTS;
  const [inputs, updateField, resetInputs, mergeInputs] = usePersistInputs(
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
  const initialBienMeta = prefill?._bien ?? null;
  const bienMeta = initialBienMeta ? (biens.find((b) => b.id === initialBienMeta.id) || initialBienMeta) : null;

  // Apply prefill values when coming from QuickView/Pipeline (only once per prefill change)
  useEffect(() => {
    if (prefill && !appliedPrefill.current) {
      appliedPrefill.current = true;
      // Strip _bien metadata before using as form inputs
      const { _bien: _, ...cleanInputs } = prefill || {};
      const provTouched = cleanInputs._provModif !== undefined ? cleanInputs._provModif : false;
      const initProv = provTouched ? cleanInputs.provisionTravaux : Math.round((cleanInputs.prixFAI || defaults.prixFAI) * 0.01);
      mergeInputs({ ...cleanInputs, provisionTravaux: initProv, _provModif: provTouched });
      if (bienMeta?.unset) {
        setUnset(bienMeta.unset);
      } else {
        setUnset([]);
      }
    }
  }, [prefill, defaults, mergeInputs, bienMeta]);

  // Auto-calculate provisionTravaux if it hasn't been modified by user
  useEffect(() => {
    if (!inputs._provModif) {
      const autoProv = Math.round((inputs.prixFAI || 0) * 0.01);
      if (inputs.provisionTravaux !== autoProv) {
        updateField('provisionTravaux', autoProv);
      }
    }
  }, [inputs.prixFAI, inputs._provModif, inputs.provisionTravaux, updateField]);

  // Persist unset to localStorage
  useEffect(() => {
    localStorage.setItem('rentaloc_analysis_unset', JSON.stringify(unset));
  }, [unset]);

  const type = bienMeta?.type || 'appartement';

  const estimatedUnsetCount = unset.filter(field => field !== 'fraisGestion' && field !== 'fraisComptable').length;

  // Substitution for unset fields
  const subInputs = { ...inputs };
  if (unset.includes('chargesCopro')) subInputs.chargesCopro = type === 'appartement' ? 800 : 0;
  if (unset.includes('taxeFonciere')) subInputs.taxeFonciere = inputs.prixFAI * 0.01;
  if (unset.includes('cfe')) subInputs.cfe = 250;
  if (unset.includes('assurancePNO')) subInputs.assurancePNO = 150;
  if (unset.includes('fraisGestion')) subInputs.fraisGestion = 0;
  if (unset.includes('fraisComptable')) subInputs.fraisComptable = 0;

  // Safe compute: treat '' as 0 to avoid NaN
  const safeInputs = { ...subInputs };
  for (const k in safeInputs) {
    if (safeInputs[k] === '') safeInputs[k] = 0;
  }

  const reqFields = ['prixFAI', 'loyerMensuel', 'tauxNotaire', 'budgetMobilier', 'vacanceMois', 'provisionTravaux', 'apport', 'dureeEmprunt', 'tauxInteret', 'tauxAssurance'];
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
      id: bienMeta?.id || uuidv4(),
      nom: nom || inputs.nom,
      ville: ville || inputs.ville,
      url: url !== undefined ? url : (bienMeta?.url || ''),
      type: type || bienMeta?.type || 'appartement',
      status: bienMeta?.status || 'a_analyser',
      note: n !== undefined ? n : (bienMeta?.note || ''),
      createdAt: bienMeta?.createdAt || Date.now(),
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

  const [mobileTab, setMobileTab] = useState('resultats'); // 'resultats', 'saisie', 'nego', 'checklist'
  const rightTab = mobileTab === 'saisie' ? 'resultats' : mobileTab;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-14 pb-[80px] md:pb-8">
      <div className="md:flex md:gap-8 mt-4 md:mt-8 items-start">
        
        {/* COLONNE GAUCHE (Saisie) */}
        <div className={`w-full md:w-[45%] space-y-4 ${mobileTab === 'saisie' ? 'block' : 'hidden md:block'}`}>
          <div className="card no-print">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note personnelle (DPE, état général, contact agent…)"
              className="w-full text-sm text-zinc-600 dark:text-zinc-400 bg-transparent border-0 outline-none resize-none placeholder-zinc-300 dark:placeholder-zinc-700"
              rows={2}
            />
          </div>
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

        {/* COLONNE DROITE (Résultats & Outils) */}
        <div className="w-full md:w-[55%] md:sticky md:top-20 space-y-4">
            
          {/* Sub-navbar on Desktop */}
          <div className="hidden md:flex items-center justify-between bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-md p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 mb-6">
            <div className="flex gap-1 w-full">
              <button
                onClick={() => setMobileTab('resultats')}
                className={`flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold rounded-lg transition-all flex-1 ${
                  rightTab === 'resultats'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/10 dark:border-zinc-700/30'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200'
                }`}
              >
                <span>📊</span>
                <span>Calculateur & Résultats</span>
              </button>
              <button
                onClick={() => setMobileTab('nego')}
                className={`flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold rounded-lg transition-all flex-1 ${
                  rightTab === 'nego'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/10 dark:border-zinc-700/30'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200'
                }`}
              >
                <span>💰</span>
                <span>Simulateur Négo</span>
              </button>
              <button
                onClick={() => setMobileTab('checklist')}
                className={`flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold rounded-lg transition-all flex-1 ${
                  rightTab === 'checklist'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200/10 dark:border-zinc-700/30'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200'
                }`}
              >
                <span>📋</span>
                <span>Checklist due diligence</span>
              </button>
            </div>
          </div>
            
          {/* VUE RESULTATS */}
          <div className={`space-y-4 ${rightTab === 'resultats' ? 'block' : 'hidden'}`}>
            <VerdictBanner results={results} nom={inputs.nom} ville={inputs.ville} unsetCount={estimatedUnsetCount}>
              <ExportButtons inputs={inputs} results={results} note={note} />
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={isMissingReq}
                title="Sauvegarder"
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors no-print text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                💾
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                title="Réinitialiser l'analyse"
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500 hover:border-red-300 hover:text-red-500 dark:hover:text-red-400 transition-colors no-print text-sm"
              >
                ↺
              </button>
            </VerdictBanner>

            <MetricsCards results={results} />
            <SynthesisTable results={results} unset={unset} />
          </div>

          {/* VUE NEGO */}
          <div className={`no-print space-y-4 ${rightTab === 'nego' ? 'block' : 'hidden'}`}>
            <NegotiationSimulator inputs={inputs} />
          </div>

          {/* VUE CHECKLIST */}
          <div className={`no-print space-y-4 ${rightTab === 'checklist' ? 'block' : 'hidden'}`}>
            <MissingDataChecklist 
              unset={unset} 
              onCheck={(field) => {
                toggleUnset(field);
                if (window.innerWidth < 768) setMobileTab('saisie');
              }} 
            />
            {bienMeta?.id ? (
              <div className="card">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-base">📋</span>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Checklist due diligence</h2>
                </div>
                <div className="space-y-4">
                  <Checklist bien={{ id: bienMeta.id, status: bienMeta.status ?? 'a_analyser', type: bienMeta.type ?? 'appartement' }} />
                </div>
              </div>
            ) : (
              <div className="card text-center py-6">
                <span className="text-2xl block mb-2">📌</span>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Sauvegardez ce bien pour débloquer la checklist de due diligence complète.
                </p>
              </div>
            )}
          </div>
            
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-[60px] bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-around z-50">
        <button 
          onClick={() => setMobileTab('resultats')} 
          className={`flex flex-col items-center justify-center w-full h-full relative transition-colors ${mobileTab === 'resultats' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-600'}`}
        >
          {mobileTab === 'resultats' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-zinc-900 dark:bg-zinc-100 rounded-b-full"></div>}
          <span className="text-xl mb-0.5">📊</span>
          <span className="text-[10px] font-medium">Résultats</span>
        </button>
        <button 
          onClick={() => setMobileTab('saisie')} 
          className={`flex flex-col items-center justify-center w-full h-full relative transition-colors ${mobileTab === 'saisie' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-600'}`}
        >
          {mobileTab === 'saisie' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-zinc-900 dark:bg-zinc-100 rounded-b-full"></div>}
          <span className="text-xl mb-0.5">✏️</span>
          <span className="text-[10px] font-medium">Saisie</span>
        </button>
        <button 
          onClick={() => setMobileTab('nego')} 
          className={`flex flex-col items-center justify-center w-full h-full relative transition-colors ${mobileTab === 'nego' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-600'}`}
        >
          {mobileTab === 'nego' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-zinc-900 dark:bg-zinc-100 rounded-b-full"></div>}
          <span className="text-xl mb-0.5">💰</span>
          <span className="text-[10px] font-medium">Négo</span>
        </button>
        <button 
          onClick={() => setMobileTab('checklist')} 
          className={`flex flex-col items-center justify-center w-full h-full relative transition-colors ${mobileTab === 'checklist' ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-600'}`}
        >
          {mobileTab === 'checklist' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-zinc-900 dark:bg-zinc-100 rounded-b-full"></div>}
          <span className="text-xl mb-0.5">📋</span>
          <span className="text-[10px] font-medium">Checklist</span>
        </button>
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
          initialNom={inputs.nom || bienMeta?.nom || ''}
          initialVille={inputs.ville || bienMeta?.ville || ''}
          initialUrl={bienMeta?.url || ''}
          initialType={bienMeta?.type || 'appartement'}
          initialNote={bienMeta?.note || ''}
        />
      )}
    </div>
  );
}
