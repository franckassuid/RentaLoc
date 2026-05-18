import { useState } from 'react';
import { compute, getLights, formatPercent, formatCurrency } from '../compute';
import { SaveModal } from './SaveModal';
import { v4 as uuidv4 } from 'uuid';
import { getVerdict } from '../compute';

const lightColors = {
  green: 'text-green-500',
  yellow: 'text-yellow-500',
  red: 'text-red-500',
};

const lightBg = {
  green: 'bg-green-500/10 border-green-500/20',
  yellow: 'bg-yellow-500/10 border-yellow-500/20',
  red: 'bg-red-500/10 border-red-500/20',
};

export function QuickView({ onSwitchToAnalysis, onSave }) {
  const [prixFAI, setPrixFAI] = useState('');
  const [loyerMensuel, setLoyerMensuel] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const prix = parseFloat(prixFAI) || 0;
  const loyer = parseFloat(loyerMensuel) || 0;

  const loyerAnnuelBrut = loyer * 12;
  const rendementBrut = prix > 0 ? (loyerAnnuelBrut / prix) * 100 : null;

  const light =
    rendementBrut === null
      ? null
      : rendementBrut >= 8
      ? 'green'
      : rendementBrut >= 7
      ? 'yellow'
      : 'red';

  const hasValues = prix > 0 && loyer > 0;

  const handleSwitchToAnalysis = () => {
    onSwitchToAnalysis({ prixFAI: prix, loyerMensuel: loyer });
  };

  const handleSave = ({ nom, ville, note }) => {
    // Build minimal inputs for quickview save
    const inputs = { nom, ville, prixFAI: prix, loyerMensuel: loyer };
    const results = compute({
      ...inputs,
      tauxNotaire: 8,
      budgetMobilier: 3000,
      vacanceMois: 1,
      chargesCopro: 600,
      taxeFonciere: 900,
      cfe: 250,
      assurancePNO: 150,
      fraisGestion: 7,
      provisionTravaux: 300,
      fraisComptable: 400,
      apport: 15000,
      dureeEmprunt: 20,
      tauxInteret: 3.8,
      tauxAssurance: 0.3,
    });
    const lights = getLights(results);
    const verdict = getVerdict(lights);

    onSave({
      id: uuidv4(),
      nom,
      ville,
      note,
      createdAt: Date.now(),
      verdict,
      inputs: { ...inputs },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Coup d'œil rapide
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            2 chiffres · 10 secondes · Décision
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Prix FAI
            </label>
            <div className="relative">
              <input
                type="number"
                value={prixFAI}
                onChange={(e) => setPrixFAI(e.target.value)}
                placeholder="87 000"
                className="input-base pr-8"
                inputMode="decimal"
                id="quickview-prix"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-mono text-zinc-400 pointer-events-none">
                €
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Loyer mensuel estimé HC
            </label>
            <div className="relative">
              <input
                type="number"
                value={loyerMensuel}
                onChange={(e) => setLoyerMensuel(e.target.value)}
                placeholder="530"
                className="input-base pr-14"
                inputMode="decimal"
                id="quickview-loyer"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-mono text-zinc-400 pointer-events-none">
                €/mois
              </span>
            </div>
          </div>
        </div>

        {/* Result */}
        {hasValues && rendementBrut !== null ? (
          <div
            className={`rounded-xl border p-5 text-center transition-all duration-300 ${lightBg[light]}`}
          >
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Rendement brut
            </p>
            <p
              className={`text-5xl font-bold font-mono ${lightColors[light]} tracking-tight`}
            >
              {formatPercent(rendementBrut)}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3">
              Loyer annuel :{' '}
              <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                {formatCurrency(loyerAnnuelBrut)}
              </span>
            </p>
            <div className="mt-3 flex justify-center">
              {light === 'green' && (
                <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
                  ✅ Objectif atteint
                </span>
              )}
              {light === 'yellow' && (
                <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full">
                  ⚠️ Dans la zone
                </span>
              )}
              {light === 'red' && (
                <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/10 px-3 py-1 rounded-full">
                  🛑 Sous le seuil
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 p-8 text-center text-zinc-300 dark:text-zinc-700">
            <p className="text-4xl mb-2 opacity-50">%</p>
            <p className="text-sm">Renseignez les deux champs ci-dessus</p>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSwitchToAnalysis}
            disabled={!hasValues}
            className="w-full py-3 text-sm font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Analyser en détail →
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={!hasValues}
            className="w-full py-3 text-sm font-medium border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sauvegarder ce bien
          </button>
        </div>

        {/* Seuils legend */}
        <div className="flex justify-center gap-4 text-xs text-zinc-400 dark:text-zinc-600">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            ≥ 8%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
            7–8%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            &lt; 7%
          </span>
        </div>
      </div>

      {showSaveModal && (
        <SaveModal
          onSave={handleSave}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}
