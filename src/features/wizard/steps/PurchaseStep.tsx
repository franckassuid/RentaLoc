
import { useWizard } from '../WizardContext';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { HomeIcon, HammerIcon, SofaIcon, ShieldCheckIcon, BanknoteIcon } from 'lucide-react';

export const PurchaseStep = () => {
    const { input, updateField } = useWizard();

    return (
        <Card title="Acquisition">
            <Input
                label="Nom du Projet"
                value={input.projectName || ''}
                onChange={(e) => updateField('projectName', e.target.value)}
                placeholder="Ex: T2 Centre ville"
            />
            <Input
                label="Prix Net Vendeur"
                value={input.purchasePrice}
                onChange={(e) => updateField('purchasePrice', Number(e.target.value))}
                type="number"
                step="1000"
                icon={<HomeIcon size={18} />}
                suffix="€"
            />
            <Input
                label="Frais d'agence"
                value={input.agencyFees}
                onChange={(e) => updateField('agencyFees', Number(e.target.value))}
                type="number"
                step="100"
                icon={<BuildingIcon size={18} />} // Using local fallback icon if needed, but imported correctly below
                suffix="€"
            />
            <Input
                label="Frais de notaire (%)"
                value={input.notaryFeesRate}
                onChange={(e) => updateField('notaryFeesRate', Number(e.target.value))}
                type="number"
                step="0.1"
                icon={<BanknoteIcon size={18} />}
                suffix="%"
            />
            <Input
                label="Travaux à l'achat"
                value={input.worksCost}
                onChange={(e) => updateField('worksCost', Number(e.target.value))}
                type="number"
                step="500"
                icon={<HammerIcon size={18} />}
                suffix="€"
            />
            <Input
                label="Ameublement"
                value={input.furnitureCost}
                onChange={(e) => updateField('furnitureCost', Number(e.target.value))}
                type="number"
                step="500"
                icon={<SofaIcon size={18} />}
                suffix="€"
            />
            <Input
                label="Frais de garantie / Hypothèque"
                value={input.guaranteeFees}
                onChange={(e) => updateField('guaranteeFees', Number(e.target.value))}
                type="number"
                step="100"
                icon={<ShieldCheckIcon size={18} />}
                suffix="€"
            />
        </Card>
    );
};

// Simple icon wrapper if not imported
function BuildingIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line><line x1="12" y1="22" x2="12" y2="22.01"></line><line x1="12" y1="2" x2="12" y2="22"></line><line x1="4" y1="10" x2="20" y2="10"></line><line x1="4" y1="14" x2="20" y2="14"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>; }
