// Rental yield and cashflow helpers

/**
 * Compute gross rental yield.
 */
export function computeGrossYield(annualRent, totalInvestment) {
  if (!totalInvestment || totalInvestment <= 0) return 0;
  return annualRent / totalInvestment;
}

/**
 * Compute net rental yield before taxes.
 */
export function computeNetYieldBeforeTax(annualRent, annualCharges, totalInvestment) {
  const netIncome = annualRent - annualCharges;
  if (!totalInvestment || totalInvestment <= 0) return 0;
  return netIncome / totalInvestment;
}

/**
 * Compute monthly cashflow before taxes.
 */
export function computeMonthlyCashflowBeforeTax(annualRent, annualCharges, annualDebtService) {
  const annualCashflow = annualRent - annualCharges - annualDebtService;
  return annualCashflow / 12;
}

/**
 * Get abatement rate for tax regime.
 * Very simplified French logic.
 */
export function getAbatementRate(rentalType, taxRegime) {
  if (rentalType === "nu") {
    if (taxRegime === "micro-foncier") return 0.30; // 30 % abatement
    if (taxRegime === "reel-foncier") return 0.0;
  } else if (rentalType === "meuble") {
    if (taxRegime === "micro-bic") return 0.50; // 50 % abatement
    if (taxRegime === "reel-bic") return 0.0;
  }
  return 0.0;
}

/**
 * Compute annual tax on rental income (simplified).
 */
export function computeAnnualTax({
  annualNetIncomeBeforeTax,
  rentalType,
  taxRegime,
  tmi,
  includeSocialTaxes
}) {
  if (annualNetIncomeBeforeTax <= 0) return 0;

  const abatement = getAbatementRate(rentalType, taxRegime);
  const taxable = annualNetIncomeBeforeTax * (1 - abatement);

  const tmiRate = (tmi || 0) / 100;
  const socialRate = includeSocialTaxes ? 0.172 : 0;
  const totalRate = tmiRate + socialRate;

  if (totalRate <= 0) return 0;
  return taxable * totalRate;
}

/**
 * Compute net-net yield and after-tax monthly cashflow.
 */
export function computeAfterTaxMetrics({
  annualRent,
  annualCharges,
  annualDebtService,
  totalInvestment,
  profile
}) {
  const annualNetBeforeTax = annualRent - annualCharges;
  const annualCashflowBeforeTax = annualRent - annualCharges - annualDebtService;

  const annualTax = computeAnnualTax({
    annualNetIncomeBeforeTax: annualNetBeforeTax,
    rentalType: profile.rentalType,
    taxRegime: profile.taxRegime,
    tmi: profile.tmi,
    includeSocialTaxes: profile.includeSocialTaxes
  });

  const annualNetAfterTax = annualNetBeforeTax - annualTax;
  const annualCashflowAfterTax = annualCashflowBeforeTax - annualTax;

  const netNetYield =
    totalInvestment > 0 ? annualNetAfterTax / totalInvestment : 0;

  const monthlyCashflowAfterTax = annualCashflowAfterTax / 12;

  return {
    annualTax,
    netNetYield,
    monthlyCashflowAfterTax
  };
}
