import type { CalculatorInput, CalculatorOutput } from './types';

export function calculateProfitability(input: CalculatorInput): CalculatorOutput {
    // --- 1. Acquisition Cost ---
    const notaryFees = input.purchasePrice * (input.notaryFeesRate / 100);
    const acquisitionCost =
        input.purchasePrice +
        notaryFees +
        input.agencyFees +
        input.worksCost +
        input.furnitureCost +
        input.guaranteeFees;

    // --- 2. Rents ---
    const grossAnnualRent = (input.monthlyRent + input.extraMonthlyIncome) * 12;
    const effectiveAnnualRent = grossAnnualRent * (1 - input.vacancyRate / 100);

    // --- 3. Charges ---
    const propertyManagementFees = effectiveAnnualRent * (input.propertyManagementRate / 100);
    const ownerAnnualCharges =
        input.taxeFonciere +
        input.coOwnershipNonRecoverable +
        input.insurancePNO +
        input.insuranceGLI +
        input.maintenanceBudget +
        propertyManagementFees;

    // --- 4. Credit ---
    // Monthly payment calculation
    let annualLoanPayment = 0;
    if (input.loanAmount > 0 && input.loanDurationYears > 0) {
        const r = input.loanRate / 100 / 12;
        const n = input.loanDurationYears * 12;

        // Avoid division by zero if rate is 0
        let monthlyLoanPayment = 0;
        if (r === 0) {
            monthlyLoanPayment = input.loanAmount / n;
        } else {
            monthlyLoanPayment = (input.loanAmount * r) / (1 - Math.pow(1 + r, -n));
        }
        annualLoanPayment = monthlyLoanPayment * 12;
    }

    // Interests & Insurance Year 1 (Approximation)
    const annualInterestYear1 = input.loanAmount * (input.loanRate / 100);
    const annualLoanInsurance = input.loanAmount * (input.loanInsuranceRate / 100);

    // --- 5. Gross & Net Yields ---
    const grossYieldPercent = acquisitionCost > 0 ? (effectiveAnnualRent / acquisitionCost) * 100 : 0;
    const netYieldPercent =
        acquisitionCost > 0 ? ((effectiveAnnualRent - ownerAnnualCharges) / acquisitionCost) * 100 : 0;

    // --- 6. Fiscality ---
    // Global tax rate
    const globalTaxRate = (input.tmi + input.socialTaxRate) / 100;

    let taxableBase = 0;
    let deductibleCharges = 0;

    if (input.rentalType === "NU") {
        if (input.taxRegime === "MICRO") {
            // Abattement 30%
            taxableBase = effectiveAnnualRent * 0.70;
        } else {
            // REAL
            deductibleCharges =
                ownerAnnualCharges +
                annualInterestYear1 +
                annualLoanInsurance;

            taxableBase = effectiveAnnualRent - deductibleCharges;
        }
    } else {
        // LMNP
        if (input.taxRegime === "MICRO") {
            // Abattement 50%
            taxableBase = effectiveAnnualRent * 0.50;
        } else {
            // REAL
            deductibleCharges =
                ownerAnnualCharges +
                annualInterestYear1 +
                annualLoanInsurance +
                (input.amortizationAnnual || 0);

            taxableBase = effectiveAnnualRent - deductibleCharges;
        }
    }

    if (taxableBase < 0) taxableBase = 0;

    const annualTax = taxableBase * globalTaxRate;

    // --- 7. Net-Net Yield ---
    const netNetYieldPercent =
        acquisitionCost > 0
            ? ((effectiveAnnualRent - ownerAnnualCharges - annualTax) / acquisitionCost) * 100
            : 0;

    // --- 8. Cashflow ---
    const annualBeforeTax = effectiveAnnualRent - ownerAnnualCharges - annualLoanPayment;
    const annualAfterTax = annualBeforeTax - annualTax;

    const monthlyBeforeTax = annualBeforeTax / 12;
    const monthlyAfterTax = annualAfterTax / 12;

    // --- 9. Cash-on-Cash ---
    const cashOnCashPercent =
        input.personalCashInvested > 0 ? (annualAfterTax / input.personalCashInvested) * 100 : 0;

    return {
        summary: {
            grossYieldPercent,
            netYieldPercent,
            netNetYieldPercent,
        },
        cashflow: {
            annualBeforeTax,
            monthlyBeforeTax,
            annualAfterTax,
            monthlyAfterTax,
            cashOnCashPercent,
        },
        details: {
            acquisitionCost,
            effectiveAnnualRent,
            ownerAnnualCharges,
            annualLoanPayment,
            annualTax,
        },
        fiscal: {
            rentalType: input.rentalType,
            taxRegime: input.taxRegime,
            tmi: input.tmi,
            socialTaxRate: input.socialTaxRate,
            taxableBase,
        },
    };
}
