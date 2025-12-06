
import { useWizard } from '../WizardContext';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { CalendarIcon, PercentIcon, LandmarkIcon, ShieldCheckIcon } from 'lucide-react';

export const CreditStep = () => {
    const { input, updateField } = useWizard();

    return (
        <Card title="Financement">
            <Input
                label="Montant Emprunté"
                value={input.loanAmount}
                onChange={(e) => updateField('loanAmount', Number(e.target.value))}
                type="number"
                step="1000"
                icon={<LandmarkIcon size={18} />}
                suffix="€"
            />
            <Input
                label="Durée (Années)"
                value={input.loanDurationYears}
                onChange={(e) => updateField('loanDurationYears', Number(e.target.value))}
                type="number"
                step="1"
                icon={<CalendarIcon size={18} />}
                suffix="ans"
            />
            <Input
                label="Taux d'intérêt (%)"
                value={input.loanRate}
                onChange={(e) => updateField('loanRate', Number(e.target.value))}
                type="number"
                step="0.05"
                icon={<PercentIcon size={18} />}
                suffix="%"
            />
            <Input
                label="Taux assurance emprunteur (%)"
                value={input.loanInsuranceRate}
                onChange={(e) => updateField('loanInsuranceRate', Number(e.target.value))}
                type="number"
                step="0.01"
                icon={<ShieldCheckIcon size={18} />}
                suffix="%"
            />
            <Input
                label="Apport Personnel Total"
                value={input.personalCashInvested}
                onChange={(e) => updateField('personalCashInvested', Number(e.target.value))}
                type="number"
                step="1000"
                icon={<LandmarkIcon size={18} />} // Reusing Landmark for now, or could import Coins
                suffix="€"
            />
        </Card>
    );
};
