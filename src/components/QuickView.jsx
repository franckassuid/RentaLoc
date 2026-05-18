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

// ── Slider config ─────────────────────────────────────────────────────────────
const PRIX_MIN = 20000;
const PRIX_MAX = 300000;
const PRIX_STEP = 1000;
const LOYER_MIN = 200;
const LOYER_MAX = 3000;
const LOYER_STEP = 10;

function formatK(val) {
  return val >= 1000 ? `${(val / 1000).toFixed(0)} k€` : `${val} €`;
}

// ── Slider component ──────────────────────────────────────────────────────────
function SliderField({ label, value, min, max, step, onChange, format, suffix }) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
            }}
            className="w-24 text-right text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-100 bg-transparent border-0 outline-none"
            inputMode="decimal"
          />
          <span className="text-xs text-zinc-400 font-mono">{suffix}</span>
        </div>
      </div>

      {/* Track */}
      <div className="relative h-8 flex items-center">
        <div className="absolute w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
        <div
          className="absolute h-2 bg-zinc-900 dark:bg-zinc-100 rounded-full pointer-events-none"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
        />
        {/* Thumb */}
        <div
          className="absolute w-5 h-5 bg-white dark:bg-zinc-100 border-2 border-zinc-900 dark:border-zinc-900 rounded-full shadow-md pointer-events-none transition-all"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-[10px] text-zinc-400 -mt-1">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

// ── Main QuickView ─────────────────────────────────────────────────────────────
export function QuickView({ onSwitchToAnalysis, onSave }) {
  const [prixFAI, setPrixFAI] = useState(87000);
  const [loyerMensuel, setLoyerMensuel] = useState(530);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const loyerAnnuelBrut = loyerMensuel * 12;
  const rendementBrut = prixFAI > 0 ? (loyerAnnuelBrut / prixFAI) * 100 : null;

  const light =
    rendementBrut === null
      ? null
      : rendementBrut >= 8
      ? 'green'
      : rendementBrut >= 7
      ? 'yellow'
      : 'red';

  const hasValues = prixFAI > 0 && loyerMensuel > 0;

  const handleSwitchToAnalysis = () => {
    onSwitchToAnalysis({ prixFAI, loyerMensuel });
  };

  const handleSave = ({ nom, ville, url, type, note }) => {
    const inputs = { nom, ville, prixFAI, loyerMensuel };
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
      tauxInteret: 3.5,
      tauxAssurance: 0.3,
    });
    const lights = getLights(results);
    const verdict = getVerdict(lights);

    onSave({
      id: uuidv4(),
      nom,
      ville,
      url,
      type: type || 'appartement',
      status: 'a_analyser',
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

        {/* Sliders */}
        <div className="space-y-6">
          <SliderField
            label="Prix FAI"
            value={prixFAI}
            min={PRIX_MIN}
            max={PRIX_MAX}
            step={PRIX_STEP}
            onChange={setPrixFAI}
            format={formatK}
            suffix="€"
          />
          <SliderField
            label="Loyer mensuel HC"
            value={loyerMensuel}
            min={LOYER_MIN}
            max={LOYER_MAX}
            step={LOYER_STEP}
            onChange={setLoyerMensuel}
            format={(v) => `${v} €`}
            suffix="€/mois"
          />
        </div>

        {/* Result */}
        {rendementBrut !== null ? (
          <div
            className={`rounded-xl border p-5 text-center transition-all duration-300 ${lightBg[light]}`}
          >
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
              Rendement brut
            </p>
            <p className={`text-5xl font-bold font-mono ${lightColors[light]} tracking-tight`}>
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
            <p className="text-sm">Bougez les curseurs</p>
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
          initialNom={inputs.nom || ''}
          initialVille={inputs.ville || ''}
        />
      )}
    </div>
  );
}
