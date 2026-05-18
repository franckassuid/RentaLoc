import { useState } from 'react';
import { InputField } from './InputField';
import { AutoField } from './AutoField';
import { getLights } from '../compute';
import { formatCurrency } from '../compute';

function Section({ title, icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        className="section-header collapsible-trigger w-full px-1"
        onClick={() => setOpen((v) => !v)}
      >
        <span>
          {icon} {title}
        </span>
        <span
          className="text-zinc-400 text-sm transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="pt-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function InputForm({ inputs, onChange, results, unset = [], onToggleUnset }) {
  const lights = getLights(results);
  // Un seul tooltip ouvert à la fois
  const [openTooltip, setOpenTooltip] = useState(null);

  const tip = { openTooltip, setOpenTooltip };

  const handleChangeWrapper = (field, val) => {
    if (field === 'provisionTravaux') {
      onChange('_provModif', true);
    }
    onChange(field, val);
  };

  return (
    <div className="space-y-3">
      {/* Section 1: Le bien */}
      <Section title="Le bien" icon="🏠" defaultOpen={true}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nom et Ville : pas de tooltip */}
          <InputField
            label="Nom du bien"
            field="nom"
            value={inputs.nom}
            onChange={onChange}
            type="text"
            placeholder="Bien A"
          />
          <InputField
            label="Ville"
            field="ville"
            value={inputs.ville}
            onChange={onChange}
            type="text"
            placeholder="Amiens"
          />
          <InputField
            label="Prix FAI"
            field="prixFAI"
            value={inputs.prixFAI}
            onChange={handleChangeWrapper}
            suffix="€"
            isRequired
            {...tip}
          />
          <AutoField
            label="→ Frais notaire"
            value={formatCurrency(results.fraisNotaire)}
          />
          <InputField
            label="Taux notaire"
            field="tauxNotaire"
            value={inputs.tauxNotaire}
            onChange={handleChangeWrapper}
            suffix="%"
            isRequired
            {...tip}
          />
          <InputField
            label="Ameublement / rafraîchissement"
            field="budgetMobilier"
            value={inputs.budgetMobilier}
            onChange={handleChangeWrapper}
            suffix="€"
            isRequired
            {...tip}
          />
          <AutoField
            label="→ Budget total"
            value={formatCurrency(results.budgetTotal)}
            className="md:col-span-2"
          />
        </div>
      </Section>

      {/* Section 2: Revenus */}
      <Section title="Revenus" icon="💶">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Loyer mensuel HC"
            field="loyerMensuel"
            value={inputs.loyerMensuel}
            onChange={handleChangeWrapper}
            suffix="€/mois"
            isRequired
          />
          <InputField
            label="Vacance locative"
            field="vacanceMois"
            value={inputs.vacanceMois}
            onChange={handleChangeWrapper}
            suffix="mois/an"
            isRequired
            {...tip}
          />
          <AutoField
            label="→ Loyer annuel corrigé"
            value={formatCurrency(results.loyerAnnuelCorrige)}
            className="md:col-span-2"
          />
        </div>
      </Section>

      {/* Section 3: Charges */}
      <Section title="Charges annuelles" icon="💸">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Charges copropriété (annuelles)"
            field="chargesCopro"
            value={inputs.chargesCopro}
            onChange={handleChangeWrapper}
            suffix="€/an"
            isOptional
            isUnset={unset.includes('chargesCopro')}
            onToggleUnset={onToggleUnset}
            {...tip}
          />
          <InputField
            label="Taxe foncière"
            field="taxeFonciere"
            value={inputs.taxeFonciere}
            onChange={handleChangeWrapper}
            suffix="€/an"
            isOptional
            isUnset={unset.includes('taxeFonciere')}
            onToggleUnset={onToggleUnset}
            {...tip}
          />
          <InputField
            label="CFE"
            field="cfe"
            value={inputs.cfe}
            onChange={handleChangeWrapper}
            suffix="€/an"
            isOptional
            isUnset={unset.includes('cfe')}
            onToggleUnset={onToggleUnset}
            {...tip}
          />
          <InputField
            label="Assurance PNO"
            field="assurancePNO"
            value={inputs.assurancePNO}
            onChange={handleChangeWrapper}
            suffix="€/an"
            isOptional
            isUnset={unset.includes('assurancePNO')}
            onToggleUnset={onToggleUnset}
            {...tip}
          />
          <InputField
            label="Frais de gestion"
            field="fraisGestion"
            value={inputs.fraisGestion}
            onChange={handleChangeWrapper}
            suffix="%"
            isOptional
            isUnset={unset.includes('fraisGestion')}
            onToggleUnset={onToggleUnset}
            unsetLabel="Pas d'agence ?"
            unsetEstim="Sans agence"
            {...tip}
          />
          <InputField
            label="Provision travaux"
            field="provisionTravaux"
            value={inputs.provisionTravaux}
            onChange={handleChangeWrapper}
            suffix="€/an"
            isRequired
            {...tip}
          />
          <InputField
            label="Frais comptable"
            field="fraisComptable"
            value={inputs.fraisComptable}
            onChange={handleChangeWrapper}
            suffix="€/an"
            className="md:col-span-2"
            isOptional
            isUnset={unset.includes('fraisComptable')}
            onToggleUnset={onToggleUnset}
            unsetLabel="Pas de comptable ?"
            unsetEstim="Sans comptable"
            {...tip}
          />
        </div>
      </Section>

      {/* Section 4: Financement */}
      <Section title="Financement" icon="🏦">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Apport"
            field="apport"
            value={inputs.apport}
            onChange={handleChangeWrapper}
            suffix="€"
            isRequired
            {...tip}
          />
          <AutoField
            label="→ Capital emprunté"
            value={formatCurrency(results.montantEmprunte)}
          />
          {/* Durée : pas de tooltip */}
          <InputField
            label="Durée"
            field="dureeEmprunt"
            value={inputs.dureeEmprunt}
            onChange={handleChangeWrapper}
            suffix="ans"
            isRequired
          />
          <InputField
            label="Taux d'intérêt"
            field="tauxInteret"
            value={inputs.tauxInteret}
            onChange={handleChangeWrapper}
            suffix="%"
            isRequired
            {...tip}
          />
          <InputField
            label="Assurance emprunteur"
            field="tauxAssurance"
            value={inputs.tauxAssurance}
            onChange={handleChangeWrapper}
            suffix="%/an"
            isRequired
            {...tip}
          />
          <AutoField
            label="→ Mensualité totale"
            value={`${formatCurrency(results.mensualiteTotale)}/mois`}
          />
        </div>
      </Section>
    </div>
  );
}
