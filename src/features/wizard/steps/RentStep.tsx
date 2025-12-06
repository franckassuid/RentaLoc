
import { useWizard } from '../WizardContext';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { BanknoteIcon, ParkingCircleIcon, AlertTriangleIcon } from 'lucide-react';

export const RentStep = () => {
    const { input, updateField } = useWizard();

    return (
        <Card title="Revenus Locatifs">
            <Input
                label="Loyer Mensuel CC"
                value={input.monthlyRent}
                onChange={(e) => updateField('monthlyRent', Number(e.target.value))}
                type="number"
                icon={<BanknoteIcon size={18} />}
                suffix="€"
            />
            <Input
                label="Revenus annexes (Parking...)"
                value={input.extraMonthlyIncome}
                onChange={(e) => updateField('extraMonthlyIncome', Number(e.target.value))}
                type="number"
                icon={<ParkingCircleIcon size={18} />}
                suffix="€"
            />
            <Input
                label="Taux de vacance locative (%)"
                value={input.vacancyRate}
                onChange={(e) => updateField('vacancyRate', Number(e.target.value))}
                type="number"
                icon={<AlertTriangleIcon size={18} />}
                suffix="%"
            />
        </Card>
    );
};
