
import { useWizard } from '../wizard/WizardContext';
import { calculateProfitability } from '../../lib/calculator';
import { Card } from '../../components/ui/Card';
import { TrendingUpIcon, DownloadIcon, SaveIcon } from 'lucide-react';
import '../../components/ui/Button.css';
import { generatePDF } from '../../lib/pdfGenerator';
import { Button } from '../../components/ui/Button';

export const ResultsDashboard = () => {
    const { input, saveProject } = useWizard();
    const results = calculateProfitability(input);

    const handleDownload = async () => {
        await generatePDF(input, results);
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

    const formatPercent = (val: number) =>
        new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(val / 100);

    return (
        <div className="results-container animate-fade-in">
            <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>Résultats</h2>

            <div className="summary-grid">
                <Card className="summary-card highlight">
                    <div className="icon-wrapper primary"><TrendingUpIcon size={24} /></div>
                    <div className="label">Renta Brute</div>
                    <div className="value">{formatPercent(results.summary.grossYieldPercent)}</div>
                </Card>
                <Card className="summary-card">
                    <div className="label">Nette</div>
                    <div className="value">{formatPercent(results.summary.netYieldPercent)}</div>
                </Card>
                <Card className="summary-card">
                    <div className="label">Net-Net (Après Impôts)</div>
                    <div className="value">{formatPercent(results.summary.netNetYieldPercent)}</div>
                </Card>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-md)' }}>
                <Button variant="primary" onClick={saveProject}>
                    <SaveIcon size={18} /> Sauvegarder Projet
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                    <DownloadIcon size={18} /> Télécharger Rapport PDF
                </Button>
            </div>

            <Card className="cashflow-section" title="Cashflow Mensuel">
                <div className="cashflow-grid">
                    <div className="cashflow-item">
                        <span className="cf-label">Avant Impôts</span>
                        <span className={`cf-value ${results.cashflow.monthlyBeforeTax > 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(results.cashflow.monthlyBeforeTax)}
                        </span>
                    </div>
                    <div className="cashflow-divider"></div>
                    <div className="cashflow-item">
                        <span className="cf-label">Après Impôts</span>
                        <span className={`cf-value ${results.cashflow.monthlyAfterTax > 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(results.cashflow.monthlyAfterTax)}
                        </span>
                    </div>
                </div>
            </Card>

            <Card title="Détails Clés">
                <div className="details-list">
                    <div className="detail-row">
                        <span>Coût Acquisition Total</span>
                        <span>{formatCurrency(results.details.acquisitionCost)}</span>
                    </div>
                    <div className="detail-row">
                        <span>Loyer Annuel Effectif</span>
                        <span>{formatCurrency(results.details.effectiveAnnualRent)}</span>
                    </div>
                    <div className="detail-row">
                        <span>Charges Annuelles</span>
                        <span>{formatCurrency(results.details.ownerAnnualCharges)}</span>
                    </div>
                    <div className="detail-row">
                        <span>Mensualité Crédit</span>
                        <span>{formatCurrency(results.details.annualLoanPayment / 12)}</span>
                    </div>
                    <div className="detail-row">
                        <span>Impôt Annuel Estimé</span>
                        <span>{formatCurrency(results.details.annualTax)}</span>
                    </div>
                    <div className="detail-row highlight-row">
                        <span>Cash-on-Cash Return</span>
                        <span>{formatPercent(results.cashflow.cashOnCashPercent)}</span>
                    </div>
                </div>
            </Card>

            <style>{`
                .results-container {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-lg);
                }

                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: var(--spacing-md);
                }

                .summary-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: var(--spacing-lg) !important;
                }
                
                .summary-card.highlight {
                    background: rgba(16, 185, 129, 0.1);
                    border-color: var(--color-primary);
                }

                .icon-wrapper {
                    margin-bottom: var(--spacing-xs);
                }
                .icon-wrapper.primary { color: var(--color-primary); }

                .summary-card .label {
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .summary-card .value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--color-text-main);
                    margin-top: var(--spacing-xs);
                }

                .cashflow-grid {
                    display: flex;
                    align-items: center;
                    justify-content: space-around;
                    padding: var(--spacing-md) 0;
                }

                .cashflow-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .cf-label {
                    font-size: 0.875rem;
                    color: var(--color-text-muted);
                    margin-bottom: var(--spacing-sm);
                }

                .cf-value {
                    font-size: 1.75rem;
                    font-weight: 800;
                }

                .cf-value.positive { color: var(--color-primary); }
                .cf-value.negative { color: var(--color-danger); }

                .cashflow-divider {
                    width: 1px;
                    height: 40px;
                    background: var(--color-border);
                }

                .details-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-sm);
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: var(--spacing-xs) 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    font-size: 0.95rem;
                }
                
                .detail-row:last-child { border-bottom: none; }

                .highlight-row { 
                    color: var(--color-text-accent); 
                    font-weight: 600;
                    margin-top: var(--spacing-sm);
                }

                @media (max-width: 480px) {
                    .summary-grid {
                        grid-template-columns: 1fr; 
                    }
                }
            `}</style>
        </div>
    );
};
