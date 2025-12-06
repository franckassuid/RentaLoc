import { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { EuroIcon, CalculatorIcon } from 'lucide-react';
import { useWizard } from '../wizard/WizardContext';

export const SimpleCalculator = ({ onSwitchToComplex }: { onSwitchToComplex: () => void }) => {
    const { updateField } = useWizard();
    const [price, setPrice] = useState(100000);
    const [rent, setRent] = useState(800);

    const grossYield = useMemo(() => {
        if (price === 0) return 0;
        return ((rent * 12) / price) * 100;
    }, [price, rent]);

    const handleSwitch = () => {
        // Pre-fill complex calculator with these values
        updateField('purchasePrice', price);
        updateField('monthlyRent', rent);
        onSwitchToComplex();
    };

    return (
        <div className="simple-calc-container animate-fade-in">
            <h2 className="text-center mb-6" style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>Estimation Rapide</h2>

            <Card className="mb-6">
                <Input
                    label="Prix d'achat (FAI)"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    type="number"
                    step="1000"
                    icon={<CalculatorIcon size={18} />}
                    suffix="€"
                />

                <Input
                    label="Loyer Mensuel"
                    value={rent}
                    onChange={(e) => setRent(Number(e.target.value))}
                    type="number"
                    step="10"
                    icon={<EuroIcon size={18} />}
                    suffix="€"
                />
            </Card>

            <div className="result-display glass-panel">
                <div className="result-label">Rentabilité Brute</div>
                <div className="result-value text-primary">
                    {grossYield.toFixed(2)}%
                </div>
            </div>

            <div className="actions mt-8" style={{ marginTop: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <Button variant="primary" fullWidth onClick={handleSwitch}>
                    Continuer en mode détaillé
                </Button>
                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Transférer ces données vers le simulateur complet pour calculer le net, le cashflow et les impôts.
                </div>
            </div>

            <style>{`
                .simple-calc-container {
                    max-width: 480px;
                    margin: 0 auto;
                }

                .result-display {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-xl);
                    border-radius: var(--radius-lg);
                    margin-top: var(--spacing-lg);
                    background: rgba(16, 185, 129, 0.1);
                    border-color: var(--color-primary);
                }

                .result-label {
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-size: 0.875rem;
                    color: var(--color-text-muted);
                    margin-bottom: var(--spacing-sm);
                }

                .result-value {
                    font-size: 3.5rem;
                    font-weight: 800;
                    color: var(--color-primary);
                    line-height: 1;
                }
            `}</style>
        </div>
    );
};
