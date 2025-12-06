import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CalculatorInput, CalculatorOutput } from './types';

interface AmortizationRow {
    year: number;
    interest: number;
    capital: number;
    insurance: number;
    remainingCapital: number;
}

const calculateAmortization = (amount: number, rate: number, years: number, insuranceRate: number): AmortizationRow[] => {
    const monthlyRate = rate / 100 / 12;
    const totalMonths = years * 12;
    const monthlyInsurance = amount * (insuranceRate / 100) / 12;

    // Monthly payment (excluding insurance)
    let monthlyPayment = 0;
    if (monthlyRate === 0) {
        monthlyPayment = amount / totalMonths;
    } else {
        monthlyPayment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));
    }

    let remaining = amount;
    const yearlyRows: AmortizationRow[] = [];

    let yearInterest = 0;
    let yearCapital = 0;
    let yearInsurance = 0;

    for (let i = 1; i <= totalMonths; i++) {
        const interest = remaining * monthlyRate;
        const capital = monthlyPayment - interest;

        yearInterest += interest;
        yearCapital += capital;
        yearInsurance += monthlyInsurance;
        remaining -= capital;

        if (i % 12 === 0) {
            yearlyRows.push({
                year: i / 12,
                interest: yearInterest,
                capital: yearCapital,
                insurance: yearInsurance,
                remainingCapital: Math.max(0, remaining)
            });
            yearInterest = 0;
            yearCapital = 0;
            yearInsurance = 0;
        }
    }

    return yearlyRows;
};

// Helper to load image
const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
};

// Helper to format currency safe for PDF (replaces narrow nbsp with standard space)
const fmt = (num: number, suffix = ' €') => {
    return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 }).replace(/[\u2000-\u206F\u00A0]/g, ' ') + suffix;
};

export const generatePDF = async (input: CalculatorInput, output: CalculatorOutput) => {
    const doc = new jsPDF();
    const primaryColor = [16, 185, 129] as [number, number, number]; // Emerald 500
    const darkColor = [30, 41, 59] as [number, number, number]; // Slate 800

    // --- Header ---
    doc.setFillColor(...darkColor);
    doc.rect(0, 0, 210, 40, 'F');

    try {
        const logo = await loadImage('/logo.png');
        // Add logo: x=15, y=10, w=20, h=20 (approx)
        doc.addImage(logo, 'PNG', 10, 5, 30, 30);
    } catch (e) {
        console.error("Could not load logo for PDF", e);
    }

    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("RENTALOC", 50, 20);

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    const title = input.projectName || "Projet Sans Nom";
    doc.text(title, 50, 30);

    const dateStr = new Date().toLocaleDateString('fr-FR');
    doc.setFontSize(10);
    doc.text(`Généré le: ${dateStr}`, 160, 20);

    let currentY = 50;

    // --- Section: Hypothèses (Grid Layout) ---
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text("HYPOTHÈSES DU PROJET", 15, currentY);
    currentY += 10;

    const hypothesesData = [
        [{ content: 'INVESTISSEMENT', styles: { fontStyle: 'bold' as const, fillColor: [240, 253, 244] as [number, number, number] }, colSpan: 2 }],
        ['Prix Achat', fmt(input.purchasePrice)],
        ['Travaux & Meubles', fmt(input.worksCost + input.furnitureCost)],
        ['Frais (Agence/Notaire)', fmt(input.agencyFees + (input.purchasePrice * (input.notaryFeesRate / 100)))],
        ['Apport Personnel', fmt(input.personalCashInvested)],

        [{ content: 'FINANCEMENT', styles: { fontStyle: 'bold' as const, fillColor: [240, 253, 244] as [number, number, number] }, colSpan: 2 }],
        ['Montant Emprunté', fmt(input.loanAmount)],
        ['Taux / Durée', `${input.loanRate}% sur ${input.loanDurationYears} ans`],

        [{ content: 'EXPLOITATION', styles: { fontStyle: 'bold' as const, fillColor: [240, 253, 244] as [number, number, number] }, colSpan: 2 }],
        ['Loyer Mensuel', fmt(input.monthlyRent)],
        ['Régime Fiscal', `${input.rentalType} (${input.taxRegime})`],
    ];

    autoTable(doc, {
        startY: currentY,
        body: hypothesesData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: primaryColor },
        columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 80 } },
        margin: { left: 15 }
    });

    // --- Section: Résultats (Key Metrics) ---
    // Calculate finalY of previous table or default if undefined
    currentY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text("RÉSULTATS CLÉS", 15, currentY);
    currentY += 10;

    const resultsData = [
        ['Rentabilité Brute', `${output.summary.grossYieldPercent.toFixed(2)} %`],
        ['Rentabilité Nette', `${output.summary.netYieldPercent.toFixed(2)} %`],
        ['Rentabilité Net-Net', `${output.summary.netNetYieldPercent.toFixed(2)} %`],
        ['Cashflow Mensuel (Net d\'impôt)', fmt(output.cashflow.monthlyAfterTax)],
    ];

    autoTable(doc, {
        startY: currentY,
        body: resultsData,
        theme: 'striped',
        styles: { fontSize: 12, halign: 'center' },
        columnStyles: { 0: { fontStyle: 'bold', halign: 'left' }, 1: { textColor: primaryColor } },
        margin: { left: 15, right: 15 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 20;

    // --- Section: Amortissement ---
    if (input.loanAmount > 0) {
        doc.setFontSize(14);
        doc.setTextColor(...darkColor);
        doc.text("Tableau d'Amortissement (Annuel)", 15, currentY);
        currentY += 5;

        const amortizationData = calculateAmortization(
            input.loanAmount,
            input.loanRate,
            input.loanDurationYears,
            input.loanInsuranceRate
        );

        const rows = amortizationData.map(row => [
            row.year,
            fmt(row.remainingCapital),
            fmt(row.interest),
            fmt(row.capital),
            fmt(row.insurance)
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [['Année', 'Restant Dû', 'Intérêts', 'Capital', 'Assurance']],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: darkColor },
            styles: { fontSize: 9 }
        });
    }

    doc.save(`Rapport_${input.projectName?.replace(/\s+/g, '_') || 'Rentaloc'}.pdf`);
};
