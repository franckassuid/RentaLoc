import { useState, useEffect } from 'react';
import { InputField } from './InputField';
import { AutoField } from './AutoField';
import { getLights } from '../compute';
import { formatCurrency } from '../compute';
import { useProfile } from '../hooks/useProfile';

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
  const { profile } = useProfile();
  
  // Advanced mode state
  const [advancedOpen, setAdvancedOpen] = useState(() => {
    try { return localStorage.getItem('rentaloc_advanced_open') === 'true'; } 
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem('rentaloc_advanced_open', advancedOpen); } catch {}
  }, [advancedOpen]);

  const [openTooltip, setOpenTooltip] = useState(null);
  const tip = { openTooltip, setOpenTooltip };

  const handleChangeWrapper = (field, val) => {
    if (field === 'provisionTravaux') {
      onChange('_provModif', true);
    }
    onChange(field, val);
  };

  const resetAdvancedToProfile = () => {
    const fieldsToReset = [
      'vacanceMois', 'tauxNotaire', 'budgetMobilier', 'cfe', 'assurancePNO',
      'fraisGestion', 'provisionTravaux', 'fraisComptable', 'dureeEmprunt',
      'tauxInteret', 'tauxAssurance'
    ];
    fieldsToReset.forEach(f => {
      onChange(f, ''); // Let the persistent storage merge back the profile default
      if (f === 'provisionTravaux') {
        onChange('_provModif', false);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* ── MODE ESSENTIEL ── */}
      <div className="card space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span>⚡</span> Les Essentiels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <InputField
            label="Loyer mensuel HC"
            field="loyerMensuel"
            value={inputs.loyerMensuel}
            onChange={handleChangeWrapper}
            suffix="€/mois"
            isRequired
            {...tip}
          />
          <InputField
            label="Charges copro (annuelles)"
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
            label="Apport personnel"
            field="apport"
            value={inputs.apport}
            onChange={handleChangeWrapper}
            suffix="€"
            isRequired
            {...tip}
          />
        </div>

        {!advancedOpen && (
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Les autres paramètres utilisent vos réglages du profil.
            </p>
            <button 
              onClick={() => setAdvancedOpen(true)}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors whitespace-nowrap"
            >
              Affiner l'analyse →
            </button>
          </div>
        )}
      </div>

      {/* ── MODE AVANCÉ ── */}
      {advancedOpen && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between px-1 mb-2">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>⚙️</span> Paramètres avancés
            </h2>
            <button 
              onClick={() => setAdvancedOpen(false)}
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Masquer
            </button>
          </div>

          <Section title="Le bien (suite)" icon="🏠" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AutoField label="→ Frais notaire calculés" value={formatCurrency(results.fraisNotaire)} />
              <InputField
                label="Taux notaire"
                field="tauxNotaire"
                value={inputs.tauxNotaire}
                onChange={handleChangeWrapper}
                suffix="%"
                isAdvanced profileValue={profile.tauxNotaire}
                {...tip}
              />
              <InputField
                label="Ameublement / travaux"
                field="budgetMobilier"
                value={inputs.budgetMobilier}
                onChange={handleChangeWrapper}
                suffix="€"
                isAdvanced profileValue={profile.budgetMobilier}
                {...tip}
              />
              <AutoField label="→ Budget total" value={formatCurrency(results.budgetTotal)} />
            </div>
          </Section>

          <Section title="Revenus" icon="💶" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Vacance locative"
                field="vacanceMois"
                value={inputs.vacanceMois}
                onChange={handleChangeWrapper}
                suffix="mois/an"
                isAdvanced profileValue={profile.vacanceMois}
                {...tip}
              />
              <AutoField label="→ Loyer annuel corrigé" value={formatCurrency(results.loyerAnnuelCorrige)} />
            </div>
          </Section>

          <Section title="Charges" icon="💸" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="CFE"
                field="cfe"
                value={inputs.cfe}
                onChange={handleChangeWrapper}
                suffix="€/an"
                isOptional isUnset={unset.includes('cfe')} onToggleUnset={onToggleUnset}
                isAdvanced profileValue={profile.cfe}
                {...tip}
              />
              <InputField
                label="Assurance PNO"
                field="assurancePNO"
                value={inputs.assurancePNO}
                onChange={handleChangeWrapper}
                suffix="€/an"
                isOptional isUnset={unset.includes('assurancePNO')} onToggleUnset={onToggleUnset}
                isAdvanced profileValue={profile.assurancePNO}
                {...tip}
              />
              <InputField
                label="Frais de gestion"
                field="fraisGestion"
                value={inputs.fraisGestion}
                onChange={handleChangeWrapper}
                suffix="%"
                isOptional isUnset={unset.includes('fraisGestion')} onToggleUnset={onToggleUnset}
                unsetLabel="Pas d'agence ?" unsetEstim="Sans agence"
                isAdvanced profileValue={profile.fraisGestion}
                {...tip}
              />
              <InputField
                label="Provision travaux"
                field="provisionTravaux"
                value={inputs.provisionTravaux}
                onChange={handleChangeWrapper}
                suffix="€/an"
                isAdvanced profileValue={profile.provisionTravaux}
                {...tip}
              />
              <InputField
                label="Frais comptable"
                field="fraisComptable"
                value={inputs.fraisComptable}
                onChange={handleChangeWrapper}
                suffix="€/an"
                className="md:col-span-2"
                isOptional isUnset={unset.includes('fraisComptable')} onToggleUnset={onToggleUnset}
                unsetLabel="Pas de comptable ?" unsetEstim="Sans comptable"
                isAdvanced profileValue={profile.fraisComptable}
                {...tip}
              />
            </div>
          </Section>

          <Section title="Financement (suite)" icon="🏦" defaultOpen={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AutoField label="→ Capital emprunté" value={formatCurrency(results.montantEmprunte)} />
              <InputField
                label="Durée"
                field="dureeEmprunt"
                value={inputs.dureeEmprunt}
                onChange={handleChangeWrapper}
                suffix="ans"
                isAdvanced profileValue={profile.dureeEmprunt}
                {...tip}
              />
              <InputField
                label="Taux d'intérêt"
                field="tauxInteret"
                value={inputs.tauxInteret}
                onChange={handleChangeWrapper}
                suffix="%"
                isAdvanced profileValue={profile.tauxInteret}
                {...tip}
              />
              <InputField
                label="Assurance emprunteur"
                field="tauxAssurance"
                value={inputs.tauxAssurance}
                onChange={handleChangeWrapper}
                suffix="%/an"
                isAdvanced profileValue={profile.tauxAssurance}
                {...tip}
              />
              <AutoField label="→ Mensualité totale" value={`${formatCurrency(results.mensualiteTotale)}/mois`} className="md:col-span-2" />
            </div>
          </Section>

          <div className="pt-2">
            <button
              onClick={resetAdvancedToProfile}
              className="w-full py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Réinitialiser depuis le profil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
