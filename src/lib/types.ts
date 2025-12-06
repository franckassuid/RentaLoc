export interface CalculatorInput {
    // Metadata
    id?: string;
    projectName?: string;

    // Achat
    purchasePrice: number;
    notaryFeesRate: number;
    agencyFees: number;
    worksCost: number;
    furnitureCost: number;
    guaranteeFees: number;

    // Revenus
    monthlyRent: number;
    extraMonthlyIncome: number;
    vacancyRate: number;

    // Charges
    taxeFonciere: number;
    coOwnershipNonRecoverable: number;
    insurancePNO: number;
    insuranceGLI: number;
    maintenanceBudget: number;
    propertyManagementRate: number;

    // Crédit
    loanAmount: number;
    loanRate: number;
    loanDurationYears: number;
    loanInsuranceRate: number;

    // Fiscalité
    rentalType: "NU" | "LMNP";
    taxRegime: "MICRO" | "REAL";
    tmi: number;
    socialTaxRate: number;
    amortizationAnnual?: number;

    // Apport
    personalCashInvested: number;
}

export interface SavedProject extends CalculatorInput {
    lastModified: number;
}

export interface UserProfile {
    // Fiscal Defaults
    tmi: number;
    taxRegime: "MICRO" | "REAL";
    rentalType: "NU" | "LMNP";

    // Credit Defaults
    defaultLoanRate: number;
    defaultLoanDuration: number;
    defaultLoanInsurance: number;

    // Costs Defaults
    defaultNotaryRate: number;
    defaultPnoCost: number;
}

export const DEFAULT_PROFILE: UserProfile = {
    tmi: 30,
    taxRegime: 'REAL',
    rentalType: 'LMNP',
    defaultLoanRate: 3.5,
    defaultLoanDuration: 20,
    defaultLoanInsurance: 0.3,
    defaultNotaryRate: 7.5,
    defaultPnoCost: 150
};

export interface CalculatorOutput {
    summary: {
        grossYieldPercent: number;
        netYieldPercent: number;
        netNetYieldPercent: number;
    };
    cashflow: {
        annualBeforeTax: number;
        monthlyBeforeTax: number;
        annualAfterTax: number;
        monthlyAfterTax: number;
        cashOnCashPercent: number;
    };
    details: {
        acquisitionCost: number;
        effectiveAnnualRent: number;
        ownerAnnualCharges: number;
        annualLoanPayment: number;
        annualTax: number;
    };
    fiscal: {
        rentalType: "NU" | "LMNP";
        taxRegime: "MICRO" | "REAL";
        tmi: number;
        socialTaxRate: number;
        taxableBase: number;
    };
}
