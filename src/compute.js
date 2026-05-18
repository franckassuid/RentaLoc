import { THRESHOLDS } from './constants';

/**
 * Core calculation function — pure, no side-effects.
 * @param {Object} b - bien inputs
 * @returns {Object} computed metrics
 */
export function compute(b) {
  const fraisNotaire = b.prixFAI * (b.tauxNotaire / 100);
  const budgetTotal = b.prixFAI + fraisNotaire + b.budgetMobilier;
  const montantEmprunte = Math.max(0, budgetTotal - b.apport);

  const loyerAnnuelBrut = b.loyerMensuel * 12;
  const loyerAnnuelCorrige = b.loyerMensuel * (12 - b.vacanceMois);
  const fraisGestionAnnuel = loyerAnnuelCorrige * (b.fraisGestion / 100);
  const totalCharges =
    b.chargesCopro +
    b.taxeFonciere +
    b.cfe +
    b.assurancePNO +
    fraisGestionAnnuel +
    b.provisionTravaux +
    b.fraisComptable;
  const revenuNetAnnuel = loyerAnnuelCorrige - totalCharges;

  // PMT formula
  const r = b.tauxInteret / 100 / 12;
  const n = b.dureeEmprunt * 12;
  const mensualiteCredit =
    r > 0
      ? (montantEmprunte * r) / (1 - Math.pow(1 + r, -n))
      : montantEmprunte / n;
      
  const assuranceMensuelle = (montantEmprunte * (b.tauxAssurance / 100)) / 12;
  const mensualiteTotale = mensualiteCredit + assuranceMensuelle;

  const rendementBrut =
    b.prixFAI > 0 ? (loyerAnnuelBrut / b.prixFAI) * 100 : 0;
  const rendementNet =
    budgetTotal > 0 ? (revenuNetAnnuel / budgetTotal) * 100 : 0;
  const cashflowMensuel = revenuNetAnnuel / 12 - mensualiteTotale;

  return {
    fraisNotaire,
    budgetTotal,
    montantEmprunte,
    loyerAnnuelBrut,
    loyerAnnuelCorrige,
    fraisGestionAnnuel,
    totalCharges,
    revenuNetAnnuel,
    mensualiteCredit,
    assuranceMensuelle,
    mensualiteTotale,
    rendementBrut,
    rendementNet,
    cashflowMensuel,
  };
}

/**
 * Returns traffic light color for each metric.
 */
export function getLights(results) {
  const { rendementBrut, cashflowMensuel, budgetTotal } = results;
  const t = THRESHOLDS;

  const lightRendement =
    rendementBrut >= t.rendementBrut.green
      ? 'green'
      : rendementBrut >= t.rendementBrut.yellow
      ? 'yellow'
      : 'red';

  const lightCashflow =
    cashflowMensuel > t.cashflow.green
      ? 'green'
      : cashflowMensuel >= t.cashflow.yellow
      ? 'yellow'
      : 'red';

  const lightBudget = budgetTotal <= t.budgetTotal.green ? 'green' : 'red';

  return { lightRendement, lightCashflow, lightBudget };
}

/**
 * Returns overall verdict: GO | ATTENTION | STOP
 */
export function getVerdict(lights) {
  const vals = Object.values(lights);
  if (vals.every((v) => v === 'green')) return 'GO';
  if (vals.some((v) => v === 'red')) return 'STOP';
  return 'ATTENTION';
}

/**
 * Formats a number as currency.
 */
export function formatCurrency(val, decimals = 0) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(val);
}

/**
 * Formats a percentage.
 */
export function formatPercent(val, decimals = 2) {
  return `${val.toFixed(decimals).replace('.', ',')} %`;
}

/**
 * Generates the text summary for clipboard sharing.
 */
export function generateSummaryText(inputs, results, note = '') {
  const v = getVerdict(getLights(results));
  const verdictIcon = v === 'GO' ? '✅' : v === 'STOP' ? '🛑' : '⚠️';
  const lines = [
    `=== ${inputs.nom || 'Bien'} — ${inputs.ville || '—'} · Rentaloc' ===`,
    `Rendement brut    : ${formatPercent(results.rendementBrut)}`,
    `Rendement net     : ${formatPercent(results.rendementNet)}`,
    `Cashflow mensuel  : ${formatCurrency(results.cashflowMensuel)}/mois`,
    `Budget total      : ${formatCurrency(results.budgetTotal)}`,
    `Capital emprunté  : ${formatCurrency(results.montantEmprunte)}`,
    `Mensualité totale : ${formatCurrency(results.mensualiteTotale)}/mois`,
    `Charges annuelles : ${formatCurrency(results.totalCharges)}`,
    `Revenus nets/an   : ${formatCurrency(results.revenuNetAnnuel)}`,
    `Verdict           : ${v} ${verdictIcon}`,
  ];
  if (note) lines.push(`Note              : ${note}`);
  return lines.join('\n');
}
