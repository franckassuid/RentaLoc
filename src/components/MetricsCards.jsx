import { getLights } from '../compute';
import { formatPercent, formatCurrency } from '../compute';

const lightDot = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

const lightText = {
  green: 'text-green-600 dark:text-green-400',
  yellow: 'text-yellow-600 dark:text-yellow-400',
  red: 'text-red-600 dark:text-red-400',
};

export function MetricsCards({ results }) {
  const lights = getLights(results);

  const metrics = [
    {
      label: 'Rendement brut',
      value: formatPercent(results.rendementBrut),
      sub: 'sur prix FAI',
      light: lights.lightRendement,
    },
    {
      label: 'Rendement net',
      value: formatPercent(results.rendementNet),
      sub: 'sur budget total',
      light:
        results.rendementNet >= 5
          ? 'green'
          : results.rendementNet >= 3
          ? 'yellow'
          : 'red',
    },
    {
      label: 'Cashflow mensuel',
      value: formatCurrency(results.cashflowMensuel),
      sub: 'après crédit',
      light: lights.lightCashflow,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {metrics.map((m) => (
        <div key={m.label} className="metric-card">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${lightDot[m.light]}`}
            />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-tight">
              {m.label}
            </span>
          </div>
          <p className={`text-lg sm:text-xl font-bold font-mono whitespace-nowrap tracking-tight ${lightText[m.light]}`}>
            {m.value}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-600">{m.sub}</p>
        </div>
      ))}
    </div>
  );
}
