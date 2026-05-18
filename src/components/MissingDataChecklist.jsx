import { useState } from 'react';

const ACTIONS = {
  chargesCopro: "Demander le décompte annuel des charges au vendeur ou au syndic",
  taxeFonciere: "Demander l'avis d'imposition taxe foncière n−1 au vendeur",
  cfe: "Vérifier auprès de votre comptable après la première déclaration",
  assurancePNO: "Demander un devis — prévoir 100 à 200 €/an",
};

export function MissingDataChecklist({ unset, onCheck }) {
  if (!unset || unset.length === 0) return null;

  return (
    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-xl p-4 mt-4 no-print">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">📋</span>
        <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-400">
          Données à compléter
        </h4>
      </div>
      <div className="space-y-2">
        {unset.map((field) => (
          <label key={field} className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={false}
              onChange={() => onCheck(field)}
              className="mt-0.5 w-4 h-4 rounded border-orange-300 dark:border-orange-700/50 accent-orange-600 dark:accent-orange-500 cursor-pointer"
            />
            <span className="text-sm text-orange-800 dark:text-orange-300 group-hover:text-orange-900 dark:group-hover:text-orange-200 transition-colors leading-snug">
              {ACTIONS[field] || `Compléter le champ ${field}`}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
