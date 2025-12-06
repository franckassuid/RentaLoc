
import { useWizard } from '../WizardContext';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { LandmarkIcon, UsersIcon, UmbrellaIcon, WrenchIcon, BriefcaseIcon } from 'lucide-react';

export const ChargesStep = () => {
    const { input, updateField } = useWizard();

    return (
        <Card title="Charges Annuelles Propiétaire">
            <Input
                label="Taxe Foncière"
                value={input.taxeFonciere}
                onChange={(e) => updateField('taxeFonciere', Number(e.target.value))}
                type="number"
                icon={<LandmarkIcon size={18} />}
                suffix="€"
            />
            <Input
                label="Charges Copro (Non récupérables)"
                value={input.coOwnershipNonRecoverable}
                onChange={(e) => updateField('coOwnershipNonRecoverable', Number(e.target.value))}
                type="number"
                icon={<UsersIcon size={18} />}
                suffix="€"
            />
            <Input
                label="Assurance PNO"
                value={input.insurancePNO}
                onChange={(e) => updateField('insurancePNO', Number(e.target.value))}
                type="number"
                icon={<UmbrellaIcon size={18} />}
                suffix="€"
            />
            <Input
                label="Assurance GLI (Loyers Impayés)"
                value={input.insuranceGLI}
                onChange={(e) => updateField('insuranceGLI', Number(e.target.value))}
                type="number"
                icon={<UmbrellaIcon size={18} />}
                suffix="€"
            />
            <Input
                label="Budget Entretien / Travaux"
                value={input.maintenanceBudget}
                onChange={(e) => updateField('maintenanceBudget', Number(e.target.value))}
                type="number"
                icon={<WrenchIcon size={18} />}
                suffix="€"
            />
            <Input
                label="Frais de gestion (%)"
                value={input.propertyManagementRate}
                onChange={(e) => updateField('propertyManagementRate', Number(e.target.value))}
                type="number"
                step="0.1"
                icon={<BriefcaseIcon size={18} />}
                suffix="%"
            />
        </Card>
    );
};
