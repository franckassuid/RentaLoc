
import { useWizard } from '../WizardContext';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { CalculatorIcon, PercentIcon, CoinsIcon } from 'lucide-react';

export const FiscalStep = () => {
    const { input, updateField } = useWizard();

    return (
        <Card title="Fiscalité & Apport">
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Type de location</label>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button
                        className={`btn ${input.rentalType === 'NU' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => updateField('rentalType', 'NU')}
                        style={{ flex: 1 }}
                    >
                        Nu (Foncier)
                    </button>
                    <button
                        className={`btn ${input.rentalType === 'LMNP' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => updateField('rentalType', 'LMNP')}
                        style={{ flex: 1 }}
                    >
                        LMNP (Meublé)
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Régime Fiscal</label>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button
                        className={`btn ${input.taxRegime === 'MICRO' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => updateField('taxRegime', 'MICRO')}
                        style={{ flex: 1 }}
                    >
                        Micro (Forfait)
                    </button>
                    <button
                        className={`btn ${input.taxRegime === 'REAL' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => updateField('taxRegime', 'REAL')}
                        style={{ flex: 1 }}
                    >
                        Réel
                    </button>
                </div>
            </div>

            <Input
                label="TMI (Tranche Marginale) %"
                value={input.tmi}
                onChange={(e) => updateField('tmi', Number(e.target.value))}
                type="number"
                icon={<PercentIcon size={18} />}
                suffix="%"
            />

            {input.rentalType === 'LMNP' && input.taxRegime === 'REAL' && (
                <Input
                    label="Amortissement annuel estimé"
                    value={input.amortizationAnnual || 0}
                    onChange={(e) => updateField('amortizationAnnual', Number(e.target.value))}
                    type="number"
                    icon={<CalculatorIcon size={18} />}
                    suffix="€"
                />
            )}

            <Input
                label="Apport Personnel Total"
                value={input.personalCashInvested}
                onChange={(e) => updateField('personalCashInvested', Number(e.target.value))}
                type="number"
                icon={<CoinsIcon size={18} />}
                suffix="€"
            />
        </Card>
    );
};
