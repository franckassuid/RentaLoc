import { useState } from 'react';
import { compute, getLights, getVerdict, formatPercent, formatCurrency } from '../compute';
import { VerdictBanner } from './VerdictBanner';
import { MetricsCards } from './MetricsCards';
import { SynthesisTable } from './SynthesisTable';
import { InputForm } from './InputForm';
import { usePersistInputs } from '../hooks/usePersist';
import { DEFAULTS } from '../constants';

export function Comparator({ onSave, effectiveDefaults }) {
  const base = effectiveDefaults ?? DEFAULTS;
  const defaultsA = { ...base, nom: 'Bien A' };
  const defaultsB = { ...base, nom: 'Bien B', prixFAI: 95000, loyerMensuel: 580 };

  const [activeTab, setActiveTab] = useState('A');
  const [inputsA, updateA] = usePersistInputs('rentaloc_compare_a', defaultsA);
  const [inputsB, updateB] = usePersistInputs('rentaloc_compare_b', defaultsB);

  const resultsA = compute(inputsA);
  const resultsB = compute(inputsB);

  const verdictA = getVerdict(getLights(resultsA));
  const verdictB = getVerdict(getLights(resultsB));

  const verdictStyle = {
    GO: 'text-green-600 dark:text-green-400',
    ATTENTION: 'text-yellow-600 dark:text-yellow-400',
    STOP: 'text-red-600 dark:text-red-400',
  };
  const verdictIcon = { GO: '✅', ATTENTION: '⚠️', STOP: '🛑' };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-16 pb-8 space-y-4">
      {/* Top: side-by-side comparison */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { inputs: inputsA, results: resultsA, verdict: verdictA, key: 'A' },
          { inputs: inputsB, results: resultsB, verdict: verdictB, key: 'B' },
        ].map(({ inputs, results, verdict, key }) => (
          <div
            key={key}
            className={`card cursor-pointer transition-all duration-150 ${
              activeTab === key
                ? 'ring-2 ring-zinc-400 dark:ring-zinc-500'
                : 'hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
            onClick={() => setActiveTab(key)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-zinc-400">Bien {key}</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {inputs.nom}
                </p>
                {inputs.ville && (
                  <p className="text-xs text-zinc-400 truncate">{inputs.ville}</p>
                )}
              </div>
              <span className={`text-sm font-bold ${verdictStyle[verdict]}`}>
                {verdictIcon[verdict]}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Rdt brut</span>
                <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                  {formatPercent(results.rendementBrut)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Rdt net</span>
                <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                  {formatPercent(results.rendementNet)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Cashflow</span>
                <span className={`font-mono font-medium ${results.cashflowMensuel >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {formatCurrency(results.cashflowMensuel)}/m
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">Budget</span>
                <span className={`font-mono font-medium ${results.budgetTotal <= 100000 ? 'text-zinc-800 dark:text-zinc-200' : 'text-red-500'}`}>
                  {formatCurrency(results.budgetTotal)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Synthesis table for active bien */}
      <SynthesisTable results={activeTab === 'A' ? resultsA : resultsB} />

      {/* Tab switcher for forms */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
        {['A', 'B'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Bien {tab}
          </button>
        ))}
      </div>

      {/* Forms */}
      {activeTab === 'A' ? (
        <InputForm
          inputs={inputsA}
          onChange={updateA}
          results={resultsA}
        />
      ) : (
        <InputForm
          inputs={inputsB}
          onChange={updateB}
          results={resultsB}
        />
      )}
    </div>
  );
}
