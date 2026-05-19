import { useState } from 'react';
import { useProfile, PROFILE_DEFAULTS, markOnboardingDone, SEUILS_DEFAULTS } from '../hooks/useProfile';

export function Onboarding({ onFinish }) {
  const { profile, updateProfileField, updateSeuil, resetProfile } = useProfile();
  
  // Local state for the 3 steps
  const [step, setStep] = useState(1);
  
  // Local state for onboarding specific temporary fields
  const [hasAgency, setHasAgency] = useState(true);

  // Initialize from existing defaults/profile
  const [formData, setFormData] = useState({
    tmi: profile.tmi ?? 30,
    apport: profile.apport ?? 15000,
    dureeEmprunt: profile.dureeEmprunt ?? 20,
    tauxInteret: profile.tauxInteret ?? 3.8,
    rendementBrutMin: profile.seuils?.rendementBrutMin ?? 8,
    cashflowMin: profile.seuils?.cashflowMin ?? -100,
    budgetMax: profile.seuils?.budgetMax ?? 100000,
    fraisGestion: profile.fraisGestion ?? 7,
    fraisComptable: profile.fraisComptable ?? 400,
    provisionTravaux: profile.provisionTravaux ?? 300,
    tauxAssurance: profile.tauxAssurance ?? 0.30,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkip = () => {
    // Keep standard defaults + mark done
    resetProfile();
    markOnboardingDone();
    onFinish();
  };

  const handleComplete = () => {
    // Save to profile
    updateProfileField('tmi', Number(formData.tmi));
    updateProfileField('apport', Number(formData.apport));
    updateProfileField('dureeEmprunt', Number(formData.dureeEmprunt));
    updateProfileField('tauxInteret', Number(formData.tauxInteret));
    
    updateProfileField('fraisGestion', hasAgency ? Number(formData.fraisGestion) : 0);
    updateProfileField('fraisComptable', Number(formData.fraisComptable));
    updateProfileField('provisionTravaux', Number(formData.provisionTravaux));
    updateProfileField('tauxAssurance', Number(formData.tauxAssurance));

    // Save seuils
    updateSeuil('rendementBrutMin', Number(formData.rendementBrutMin));
    updateSeuil('cashflowMin', Number(formData.cashflowMin));
    updateSeuil('budgetMax', Number(formData.budgetMax));

    markOnboardingDone();
    onFinish();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-blue-500' : i < step ? 'w-4 bg-blue-200 dark:bg-blue-900' : 'w-4 bg-zinc-200 dark:bg-zinc-800'}`}
              />
            ))}
          </div>
          <button onClick={handleSkip} className="text-sm font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
            Passer
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <Step1 formData={formData} onChange={handleChange} />
          )}
          {step === 2 && (
            <Step2 formData={formData} onChange={handleChange} />
          )}
          {step === 3 && (
            <Step3 formData={formData} onChange={handleChange} hasAgency={hasAgency} setHasAgency={setHasAgency} />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
          {step > 1 && (
            <button 
              onClick={() => setStep(s => s - 1)}
              className="px-5 py-3 rounded-xl font-medium border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              ← Retour
            </button>
          )}
          
          <button 
            onClick={() => step < 3 ? setStep(s => s + 1) : handleComplete()}
            className="flex-1 px-5 py-3 rounded-xl font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          >
            {step < 3 ? 'Suivant →' : 'Commencer →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1 ────────────────────────────────────────────────────────────────
function Step1({ formData, onChange }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Votre situation (1/3)</h2>
        <p className="text-sm text-zinc-500">Bienvenue sur Rentaloc' — Configurons votre profil en 2 minutes.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Votre TMI</label>
          <select 
            value={formData.tmi} 
            onChange={(e) => onChange('tmi', e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>0%</option>
            <option value={11}>11%</option>
            <option value={30}>30%</option>
            <option value={41}>41%</option>
            <option value={45}>45%</option>
          </select>
        </div>
        <NumberField label="Apport disponible" value={formData.apport} onChange={(v) => onChange('apport', v)} suffix="€" />
        <NumberField label="Durée d'emprunt habituelle" value={formData.dureeEmprunt} onChange={(v) => onChange('dureeEmprunt', v)} suffix="ans" />
        <NumberField label="Taux d'intérêt actuel" value={formData.tauxInteret} onChange={(v) => onChange('tauxInteret', v)} suffix="%" step={0.1} />
      </div>
    </div>
  );
}

// ─── Step 2 ────────────────────────────────────────────────────────────────
function Step2({ formData, onChange }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Vos critères (2/3)</h2>
        <p className="text-sm text-zinc-500">Définissez vos seuils de rentabilité.</p>
      </div>
      <div className="space-y-4">
        <NumberField 
          label="Rendement brut minimum" 
          note="Seuil du feu vert"
          value={formData.rendementBrutMin} 
          onChange={(v) => onChange('rendementBrutMin', v)} 
          suffix="%" 
          step={0.1} 
        />
        <NumberField 
          label="Cashflow minimum acceptable" 
          note="En dessous = STOP"
          value={formData.cashflowMin} 
          onChange={(v) => onChange('cashflowMin', v)} 
          suffix="€/mois" 
        />
        <NumberField 
          label="Budget maximum tout compris" 
          note="FAI + notaire + mobilier"
          value={formData.budgetMax} 
          onChange={(v) => onChange('budgetMax', v)} 
          suffix="€" 
          step={1000} 
        />
      </div>
    </div>
  );
}

// ─── Step 3 ────────────────────────────────────────────────────────────────
function Step3({ formData, onChange, hasAgency, setHasAgency }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Votre gestion (3/3)</h2>
        <p className="text-sm text-zinc-500">Comment gérez-vous vos biens ?</p>
      </div>
      <div className="space-y-4">
        
        <div className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
          <label className="text-sm font-medium">Gestion déléguée à une agence</label>
          <button
            onClick={() => setHasAgency(!hasAgency)}
            className={`w-12 h-6 rounded-full transition-colors relative ${hasAgency ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${hasAgency ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {hasAgency && (
          <NumberField label="Taux de gestion" value={formData.fraisGestion} onChange={(v) => onChange('fraisGestion', v)} suffix="%" step={0.5} />
        )}
        <NumberField label="Frais comptable annuels" value={formData.fraisComptable} onChange={(v) => onChange('fraisComptable', v)} suffix="€" />
        <NumberField label="Provision travaux annuelle" value={formData.provisionTravaux} onChange={(v) => onChange('provisionTravaux', v)} suffix="€" />
        <NumberField label="Assurance emprunteur" value={formData.tauxAssurance} onChange={(v) => onChange('tauxAssurance', v)} suffix="%" step={0.05} />
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, suffix, note, step = 1 }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium">{label}</label>
        {note && <span className="text-xs text-zinc-500 italic">{note}</span>}
      </div>
      <div className="relative">
        <input 
          type="number" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          step={step}
          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-right pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
          inputMode="decimal"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 pointer-events-none">{suffix}</span>
      </div>
    </div>
  );
}
