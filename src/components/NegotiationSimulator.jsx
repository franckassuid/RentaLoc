import { useState, useMemo } from 'react';
import { compute, getLights, getVerdict, formatCurrency, formatPercent } from '../compute';
import { THRESHOLDS } from '../constants';

// ── Feu coloré helpers ────────────────────────────────────────────────────────
function lightRend(v) {
  const t = THRESHOLDS.rendementBrut;
  return v >= t.green ? 'green' : v >= t.yellow ? 'yellow' : 'red';
}
function lightCash(v) {
  const t = THRESHOLDS.cashflow;
  return v > t.green ? 'green' : v >= t.yellow ? 'yellow' : 'red';
}
function lightBudg(v) {
  return v <= THRESHOLDS.budgetTotal.green ? 'green' : 'red';
}

const dot = { green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500' };
const txt = { green: 'text-green-600 dark:text-green-400', yellow: 'text-yellow-600 dark:text-yellow-400', red: 'text-red-600 dark:text-red-400' };
const verdictStyle = { GO: 'text-green-600 dark:text-green-400', ATTENTION: 'text-yellow-600 dark:text-yellow-400', STOP: 'text-red-600 dark:text-red-400' };

// ── Dichotomie GO price ────────────────────────────────────────────────────────
function findGOPrice(inputs) {
  // Check if even at price=0 all lights are green — if not, it's impossible
  const testZero = compute({ ...inputs, prixFAI: 0 });
  const zeroLights = [lightRend(testZero.rendementBrut), lightCash(testZero.cashflowMensuel), lightBudg(testZero.budgetTotal)];
  if (!zeroLights.every((l) => l === 'green')) return null;

  let low = 0;
  let high = inputs.prixFAI * 2; // search up to 2x current price
  let result = null;
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const r = compute({ ...inputs, prixFAI: mid });
    const lights = [lightRend(r.rendementBrut), lightCash(r.cashflowMensuel), lightBudg(r.budgetTotal)];
    if (lights.every((l) => l === 'green')) {
      result = mid;
      low = mid;
    } else {
      high = mid;
    }
  }
  // Return the max price where GO is achieved
  // Actually we want max price → need to flip: go up until fail
  // Redo: find the maximum prixFAI where all green
  low = 0;
  high = inputs.prixFAI * 2;
  result = null;
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const r = compute({ ...inputs, prixFAI: mid });
    const lights = [lightRend(r.rendementBrut), lightCash(r.cashflowMensuel), lightBudg(r.budgetTotal)];
    if (lights.every((l) => l === 'green')) {
      result = mid;
      low = mid;
    } else {
      high = mid;
    }
  }
  return result; // null if impossible
}

// ── Row display ────────────────────────────────────────────────────────────────
function MetricRow({ label, value, light }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot[light]}`} />
        <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      </div>
      <span className={`text-sm font-mono font-semibold ${txt[light]}`}>{value}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function NegotiationSimulator({ inputs }) {
  const [open, setOpen] = useState(false);
  const [negoPct, setNegoPct] = useState(0);

  const negoPrice = useMemo(() => {
    return inputs.prixFAI * (1 - negoPct / 100);
  }, [inputs.prixFAI, negoPct]);

  const simInputs = useMemo(() => ({ ...inputs, prixFAI: negoPrice }), [inputs, negoPrice]);
  const simResults = useMemo(() => compute(simInputs), [simInputs]);

  const rRend  = lightRend(simResults.rendementBrut);
  const rCash  = lightCash(simResults.cashflowMensuel);
  const rBudg  = lightBudg(simResults.budgetTotal);
  const verdict = getVerdict({ lightRendement: rRend, lightCashflow: rCash, lightBudget: rBudg });

  const goPrice = useMemo(() => open ? findGOPrice(inputs) : null, [inputs, open]);

  const goPriceDiff = goPrice !== null && goPrice !== undefined
    ? inputs.prixFAI - goPrice
    : null;
  const goPricePct = goPrice !== null && goPrice !== undefined && inputs.prixFAI > 0
    ? ((inputs.prixFAI - goPrice) / inputs.prixFAI) * 100
    : null;

  return (
    <div className="card">
      {/* Header */}
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">💰</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Simulateur de négociation</span>
        </div>
        <span className="text-zinc-400 text-sm transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {/* Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-zinc-600 dark:text-zinc-400">Négociation</label>
              <span className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100">
                − {negoPct.toFixed(1).replace('.', ',')} %
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              step={0.5}
              value={negoPct}
              onChange={(e) => setNegoPct(parseFloat(e.target.value))}
              className="w-full h-2 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-zinc-400 mt-1">
              <span>0 %</span>
              <span>30 %</span>
            </div>
          </div>

          {/* New price highlight */}
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Nouveau prix FAI</span>
            <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
              {formatCurrency(negoPrice)}
            </span>
          </div>

          {/* Metrics */}
          <div>
            <MetricRow label="Rendement brut" value={formatPercent(simResults.rendementBrut)} light={rRend} />
            <MetricRow label="Cashflow mensuel" value={`${formatCurrency(simResults.cashflowMensuel)}/mois`} light={rCash} />
            <MetricRow label="Budget total" value={formatCurrency(simResults.budgetTotal)} light={rBudg} />
          </div>

          {/* Verdict */}
          <div className={`text-center text-base font-bold py-2 rounded-xl ${
            verdict === 'GO'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              : verdict === 'ATTENTION'
              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          }`}>
            {verdict === 'GO' ? '✅' : verdict === 'ATTENTION' ? '⚠️' : '🛑'} {verdict}
          </div>

          {/* GO price block */}
          <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl p-4">
            {goPrice !== null && goPrice !== undefined ? (
              <>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-snug">
                  💡 <strong>Prix maximum pour un GO complet :</strong>{' '}
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(goPrice)}
                  </span>
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  soit − {formatCurrency(goPriceDiff)} (− {goPricePct.toFixed(1).replace('.', ',')} %) sur le prix affiché
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-yellow-700 dark:text-yellow-400 leading-snug">
                  ⚠️ Ce bien ne peut pas atteindre le GO avec ce loyer, même à prix zéro.
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  Revoir le loyer estimé ou les charges.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
