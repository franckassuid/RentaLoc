import { useEffect, useMemo, useRef, useState } from 'react';

const DPE_LEVELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const DPE_STYLES = {
  A: { bg: 'bg-[#00703C]', text: 'text-white border-[#00502A]' },
  B: { bg: 'bg-[#03A655]', text: 'text-white border-[#028040]' },
  C: { bg: 'bg-[#95D600]', text: 'text-zinc-900 border-[#7BB000]' },
  D: { bg: 'bg-[#FFF000]', text: 'text-zinc-900 border-[#D4C800]' },
  E: { bg: 'bg-[#FFA800]', text: 'text-zinc-900 border-[#D48C00]' },
  F: { bg: 'bg-[#FF6A00]', text: 'text-white border-[#D45800]' },
  G: { bg: 'bg-[#E30613]', text: 'text-white border-[#B2050F]' },
};

const ETAT_OPTIONS = [
  { key: 'bon', label: 'Bon état' },
  { key: 'rafraichissement', label: 'Rafraîchissement' },
  { key: 'travaux', label: 'Travaux importants' },
];

const EXPOSITION_OPTIONS = [
  { key: 'N', label: 'Nord (N)' },
  { key: 'S', label: 'Sud (S)' },
  { key: 'E', label: 'Est (E)' },
  { key: 'O', label: 'Ouest (O)' },
  { key: 'double', label: 'Double expo' },
];

export function AgencyCall({
  inputs,
  updateField,
  setUnset,
  unset,
  qualite,
  updateQualite,
  note,
  setNote,
  onClose,
  type,
  nomBien,
}) {
  const [openSection, setOpenSection] = useState('calc');
  const qualRef = useRef(null);
  const noteRef = useRef(null);
  const calcAdvanced = useRef(false);
  const qualAdvanced = useRef(false);

  // Compute filled and total counts for the progress indicator
  const stats = useMemo(() => {
    // 1. Calculateur
    let cTotal = 0; let cFilled = 0;
    cTotal++; if (inputs.chargesCopro !== null && inputs.chargesCopro !== '' && !unset.includes('chargesCopro')) cFilled++;
    cTotal++; if (inputs.taxeFonciere !== null && inputs.taxeFonciere !== '' && !unset.includes('taxeFonciere')) cFilled++;
    cTotal++; if (qualite.locataireEnPlace !== null) cFilled++;
    if (qualite.locataireEnPlace === true) {
      cTotal++;
      if (inputs.loyerMensuel !== null && inputs.loyerMensuel !== '') cFilled++;
    }

    // 2. Qualitatives
    let qTotal = 0; let qFilled = 0;
    qTotal++; if (qualite.dpe !== null && qualite.dpe !== '') qFilled++;
    qTotal++; if (qualite.surface !== null && qualite.surface !== '') qFilled++;
    qTotal++; if (qualite.anneeConstruction !== null && qualite.anneeConstruction !== '') qFilled++;
    qTotal++; if (qualite.etatGeneral !== null && qualite.etatGeneral !== '') qFilled++;
    qTotal++; if (qualite.etage !== null && qualite.etage !== '') qFilled++;
    if (type === 'appartement') {
      qTotal++; if (qualite.ascenseur !== null) qFilled++;
    }
    qTotal++; if (qualite.exposition !== null && qualite.exposition !== '') qFilled++;

    const total = cTotal + qTotal;
    const filled = cFilled + qFilled;
    
    return {
      calc: { filled: cFilled, total: cTotal, isDone: cTotal === cFilled },
      qual: { filled: qFilled, total: qTotal, isDone: qTotal === qFilled },
      overall: { filled, total, pct: total > 0 ? Math.round((filled / total) * 100) : 0 }
    };
  }, [inputs, unset, qualite, type]);

  // Auto-advance: when calc section completes for the first time, open qual
  useEffect(() => {
    if (stats.calc.isDone && !calcAdvanced.current) {
      calcAdvanced.current = true;
      const t = setTimeout(() => {
        setOpenSection('qual');
        setTimeout(() => {
          qualRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [stats.calc.isDone]);

  // Auto-scroll to notes when qual section completes for the first time
  useEffect(() => {
    if (stats.qual.isDone && !qualAdvanced.current) {
      qualAdvanced.current = true;
      const t = setTimeout(() => {
        noteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
      return () => clearTimeout(t);
    }
  }, [stats.qual.isDone]);

  // Handle calculator input updates (charge / TF / Loyer HC)
  // Ensures they immediately get un-marked from the "non renseigné" unset list
  const handleCalculatorChange = (field, val) => {
    updateField(field, val);
    if (unset.includes(field)) {
      setUnset((prev) => prev.filter((f) => f !== field));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col animate-in fade-in slide-in-from-bottom duration-300">
      
      {/* Calls Glassmorphic Header */}
      <div className="sticky top-0 z-10 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-4 py-4 md:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <h1 className="text-sm md:text-base font-bold text-zinc-100 truncate">
                📞 Appel agence en cours — {nomBien || 'Bien sans nom'}
              </h1>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-3 mt-2.5">
              <div className="flex-1 max-w-xs h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-350"
                  style={{ width: `${stats.overall.pct}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-zinc-400">
                {stats.overall.filled}/{stats.overall.total} infos ({stats.overall.pct}%)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-900/20 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>🛑</span>
            <span>Terminer l'appel</span>
          </button>
        </div>
      </div>

      {/* Main Body - scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-10 bg-zinc-950">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
          
          {/* COLUMN LEFT: Données Calculateur */}
          <div className="space-y-6">
            <div className="border border-zinc-800 bg-zinc-900/40 rounded-2xl p-5 md:p-6 space-y-5 transition-all">
              <button 
                onClick={() => setOpenSection(openSection === 'calc' ? null : 'calc')}
                className="w-full flex items-center justify-between border-b border-zinc-800 pb-3 group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🧮</span>
                  <h2 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors">
                    Données Calculateur
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${stats.calc.isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    {stats.calc.filled}/{stats.calc.total}
                  </span>
                  <span className={`text-zinc-500 transition-transform duration-300 ${openSection === 'calc' ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </button>

              {openSection === 'calc' && (
                <div className="space-y-5 animate-in slide-in-from-top-2 fade-in duration-200">
                  {/* Copropriété */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Charges de copropriété ?</label>
                    <div className="flex items-center border border-zinc-800 rounded-xl bg-zinc-900 overflow-hidden w-full focus-within:ring-2 focus-within:ring-zinc-700 transition-all">
                      <input
                        type="number"
                        value={inputs.chargesCopro}
                        onChange={(e) => handleCalculatorChange('chargesCopro', e.target.value)}
                        placeholder="Ex: 1200"
                        className="flex-1 min-w-0 w-full text-right font-mono text-sm px-3.5 py-3 bg-transparent text-zinc-100 focus:outline-none"
                        inputMode="numeric"
                      />
                      <span className="pr-4 text-xs font-bold text-zinc-500 whitespace-nowrap">€/an</span>
                    </div>
                  </div>

                  {/* Taxe Foncière */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Taxe foncière (avis n−1) ?</label>
                    <div className="flex items-center border border-zinc-800 rounded-xl bg-zinc-900 overflow-hidden w-full focus-within:ring-2 focus-within:ring-zinc-700 transition-all">
                      <input
                        type="number"
                        value={inputs.taxeFonciere}
                        onChange={(e) => handleCalculatorChange('taxeFonciere', e.target.value)}
                        placeholder="Ex: 800"
                        className="flex-1 min-w-0 w-full text-right font-mono text-sm px-3.5 py-3 bg-transparent text-zinc-100 focus:outline-none"
                        inputMode="numeric"
                      />
                      <span className="pr-4 text-xs font-bold text-zinc-500 whitespace-nowrap">€/an</span>
                    </div>
                  </div>

                  {/* Locataire en place */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-semibold text-zinc-400">Locataire en place ?</label>
                    <div className="flex gap-2">
                      {[
                        { key: true, label: 'Oui (Loué)' },
                        { key: false, label: 'Non (Vide)' },
                        { key: null, label: 'Non renseigné' },
                      ].map((opt) => (
                        <button
                          key={String(opt.key)}
                          type="button"
                          onClick={() => updateQualite({ ...qualite, locataireEnPlace: opt.key })}
                          className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all duration-150 ${
                            qualite.locataireEnPlace === opt.key
                              ? 'bg-zinc-100 border-zinc-100 text-zinc-950 shadow-sm font-extrabold'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Loyer actuel - visible if tenant is true */}
                  {qualite.locataireEnPlace === true && (
                    <div className="space-y-1.5 animate-in slide-in-from-top fade-in duration-200">
                      <label className="text-xs font-semibold text-zinc-300">Loyer actuel (si en place) ?</label>
                      <div className="flex items-center border border-zinc-800 rounded-xl bg-zinc-900 overflow-hidden w-full focus-within:ring-2 focus-within:ring-zinc-700 transition-all">
                        <input
                          type="number"
                          value={inputs.loyerMensuel}
                          onChange={(e) => handleCalculatorChange('loyerMensuel', e.target.value)}
                          placeholder="Ex: 550"
                          className="flex-1 min-w-0 w-full text-right font-mono text-sm px-3.5 py-3 bg-transparent text-zinc-100 focus:outline-none"
                          inputMode="numeric"
                        />
                        <span className="pr-4 text-xs font-bold text-zinc-500 whitespace-nowrap">€/mois</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 italic mt-1">
                        * Renseigner ce loyer écrasera directement le loyer cible du simulateur.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* COLUMN RIGHT: Données Qualitatives */}
          <div className="space-y-6" ref={qualRef}>
            <div className="border border-zinc-800 bg-zinc-900/40 rounded-2xl p-5 md:p-6 space-y-5 transition-all">
              <button 
                onClick={() => setOpenSection(openSection === 'qual' ? null : 'qual')}
                className="w-full flex items-center justify-between border-b border-zinc-800 pb-3 group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📋</span>
                  <h2 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors">
                    Données Qualitatives
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${stats.qual.isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    {stats.qual.filled}/{stats.qual.total}
                  </span>
                  <span className={`text-zinc-500 transition-transform duration-300 ${openSection === 'qual' ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </button>

              {openSection === 'qual' && (
                <div className="space-y-5 animate-in slide-in-from-top-2 fade-in duration-200">
                  {/* DPE selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">DPE ?</label>
                    <div className="grid grid-cols-7 gap-1">
                      {DPE_LEVELS.map((level) => {
                        const active = qualite.dpe === level;
                        const anySelected = qualite.dpe !== null;
                        const style = DPE_STYLES[level];
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => {
                              const nextDpe = qualite.dpe === level ? null : level;
                              updateQualite({ ...qualite, dpe: nextDpe });
                            }}
                            className={`py-3 text-sm font-mono font-black border rounded-xl flex items-center justify-center transition-all ${style.bg} ${style.text} ${
                              active
                                ? 'ring-4 ring-zinc-100 scale-105 shadow-lg border-transparent'
                                : anySelected
                                ? 'opacity-20 blur-[0.2px] scale-95 border-transparent'
                                : 'border-transparent'
                            }`}
                          >
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Surface & Construction - Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400">Surface ?</label>
                      <div className="flex items-center border border-zinc-800 rounded-xl bg-zinc-900 overflow-hidden w-full focus-within:ring-2 focus-within:ring-zinc-700 transition-all">
                        <input
                          type="number"
                          value={qualite.surface || ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateQualite({ ...qualite, surface: v === '' ? null : parseFloat(v) });
                          }}
                          placeholder="Ex: 45"
                          className="flex-1 min-w-0 w-full text-right font-mono text-sm px-3 py-3 bg-transparent text-zinc-100 focus:outline-none"
                          inputMode="decimal"
                        />
                        <span className="pr-3 text-xs font-bold text-zinc-500 whitespace-nowrap">m²</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400">Année construction ?</label>
                      <div className="flex items-center border border-zinc-800 rounded-xl bg-zinc-900 overflow-hidden w-full focus-within:ring-2 focus-within:ring-zinc-700 transition-all">
                        <input
                          type="number"
                          value={qualite.anneeConstruction || ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateQualite({ ...qualite, anneeConstruction: v === '' ? null : parseInt(v) });
                          }}
                          placeholder="Ex: 1980"
                          className="flex-1 min-w-0 w-full text-right font-mono text-sm px-3 py-3 bg-transparent text-zinc-100 focus:outline-none"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </div>

                  {/* État Général */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">État général ?</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {ETAT_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            const nextVal = qualite.etatGeneral === opt.key ? null : opt.key;
                            updateQualite({ ...qualite, etatGeneral: nextVal });
                          }}
                          className={`flex-1 py-3 px-2 text-xs font-bold rounded-xl border transition-all duration-150 ${
                            qualite.etatGeneral === opt.key
                              ? 'bg-zinc-100 border-zinc-100 text-zinc-950 font-extrabold shadow-sm'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Étage & Ascenseur */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-400">Étage ?</label>
                      <div className="flex items-center border border-zinc-800 rounded-xl bg-zinc-900 overflow-hidden w-full focus-within:ring-2 focus-within:ring-zinc-700 transition-all">
                        <input
                          type="number"
                          value={qualite.etage !== null ? qualite.etage : ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateQualite({ ...qualite, etage: v === '' ? null : parseInt(v) });
                          }}
                          placeholder="0 = RDC"
                          className="flex-1 min-w-0 w-full text-right font-mono text-sm px-3 py-3 bg-transparent text-zinc-100 focus:outline-none"
                          inputMode="numeric"
                        />
                      </div>
                    </div>

                    {type === 'appartement' && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">Ascenseur ?</label>
                        <div className="flex gap-2">
                          {[
                            { key: true, label: 'Oui' },
                            { key: false, label: 'Non' },
                          ].map((opt) => (
                            <button
                              key={String(opt.key)}
                              type="button"
                              onClick={() => {
                                const nextVal = qualite.ascenseur === opt.key ? null : opt.key;
                                updateQualite({ ...qualite, ascenseur: nextVal });
                              }}
                              className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all duration-150 ${
                                qualite.ascenseur === opt.key
                                  ? 'bg-zinc-100 border-zinc-100 text-zinc-950 font-extrabold shadow-sm'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Exposition */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400">Exposition ?</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {EXPOSITION_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            const nextVal = qualite.exposition === opt.key ? null : opt.key;
                            updateQualite({ ...qualite, exposition: nextVal });
                          }}
                          title={opt.label}
                          className={`py-3 text-xs font-bold rounded-xl border transition-all duration-150 ${
                            qualite.exposition === opt.key
                              ? 'bg-zinc-100 border-zinc-100 text-zinc-950 font-extrabold shadow-sm'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          {opt.key === 'double' ? 'Double' : opt.key}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Note personnelle - Full Width bottom */}
          <div className="md:col-span-2" ref={noteRef}>
            <div className="border border-zinc-800 bg-zinc-900/40 rounded-2xl p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-1">
                <span className="text-base">📝</span>
                <h2 className="text-sm font-bold text-zinc-100">Note personnelle</h2>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Renseignez ici des notes spécifiques sur le bien récupérées lors de votre appel (ex: nom de l'agent, raisons de la vente, durée sur le marché...)"
                rows={4}
                className="w-full text-sm text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-xl p-4 outline-none focus:ring-2 focus:ring-zinc-700 placeholder-zinc-650 resize-none transition-all"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
