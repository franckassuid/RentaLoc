import { useState } from 'react';
import { formatCurrency } from '../compute';

export function SynthesisTable({ results, unset = [] }) {
  const [showChargeDetail, setShowChargeDetail] = useState(false);

  const rows = [
    {
      label: 'Loyer annuel brut',
      value: formatCurrency(results.loyerAnnuelBrut),
      style: 'normal',
    },
    {
      label: 'Loyer annuel corrigé',
      value: formatCurrency(results.loyerAnnuelCorrige),
      style: 'normal',
    },
    {
      label: 'Total charges annuelles',
      value: formatCurrency(results.totalCharges),
      style: 'clickable',
      onClick: () => setShowChargeDetail((v) => !v),
      isOpen: showChargeDetail,
    },
    {
      label: 'Revenus nets annuels',
      value: formatCurrency(results.revenuNetAnnuel),
      style: 'normal',
    },
    {
      label: 'Mensualité crédit',
      value: `${formatCurrency(results.mensualiteCredit)}/mois`,
      style: 'normal',
    },
    {
      label: 'Assurance emprunteur',
      value: `${formatCurrency(results.assuranceMensuelle)}/mois`,
      style: 'secondary',
    },
    {
      label: 'Budget total',
      value: formatCurrency(results.budgetTotal),
      style: 'normal',
    },
    {
      label: 'Capital emprunté',
      value: formatCurrency(results.montantEmprunte),
      style: 'secondary',
    },
    {
      label: 'Effort mensuel final',
      value: `${formatCurrency(results.mensualiteTotale)}/mois`,
      style: 'bold',
    },
  ];

  const chargeDetails = [
    { label: 'Frais de gestion', value: results.fraisGestionAnnuel },
  ];

  return (
    <div className="card overflow-hidden">
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
        Tableau de synthèse
      </h3>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {rows.map((row) => (
          <div key={row.label}>
            <div
              className={`flex items-center justify-between py-2.5 px-1 ${
                row.onClick
                  ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors'
                  : ''
              }`}
              onClick={row.onClick}
            >
              <span
                className={`text-sm ${
                  row.style === 'secondary'
                    ? 'text-zinc-400 dark:text-zinc-600 text-xs pl-3'
                    : row.style === 'bold'
                    ? 'font-semibold text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {row.label}
                {row.onClick && (
                  <span className="ml-1.5 text-xs text-zinc-400">
                    {row.isOpen ? '▲' : '▼'}
                  </span>
                )}
              </span>
              <span
                className={`font-mono text-sm ${
                  row.style === 'secondary'
                    ? 'text-zinc-400 dark:text-zinc-600 text-xs'
                    : row.style === 'bold'
                    ? 'font-bold text-zinc-900 dark:text-zinc-100 text-base'
                    : 'text-zinc-800 dark:text-zinc-200'
                }`}
              >
                {row.value}
                {row.label === 'Total charges annuelles' && unset.length > 0 && (
                  <span className="ml-2 inline-block text-[10px] font-medium px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 align-middle">
                    ~ Estimé
                  </span>
                )}
              </span>
            </div>

            {row.isOpen && (
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg mx-1 mb-2 px-3 py-2 text-xs space-y-1">
                {chargeDetails.map((d) => (
                  <div
                    key={d.label}
                    className="flex justify-between text-zinc-500 dark:text-zinc-400"
                  >
                    <span>{d.label}</span>
                    <span className="font-mono">{formatCurrency(d.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
