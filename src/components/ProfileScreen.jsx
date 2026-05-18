import { useState } from 'react';
import { useProfile, PROFILE_FIELDS, PROFILE_DEFAULTS } from '../hooks/useProfile';

export function ProfileScreen() {
  const { profile, updateProfileField, resetProfile } = useProfile();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleChange = (field, raw) => {
    const num = parseFloat(raw);
    updateProfileField(field, isNaN(num) ? 0 : num);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-20 pb-12 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Profil investisseur
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Ces valeurs pré-remplissent automatiquement tous vos calculs.
          Modifiables bien par bien dans le formulaire.
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        {PROFILE_FIELDS.map((f) => (
          <ProfileField
            key={f.key}
            field={f}
            value={profile[f.key]}
            defaultValue={PROFILE_DEFAULTS[f.key]}
            onChange={handleChange}
          />
        ))}

        {/* TMI — display only */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                TMI (Tranche Marginale d'Imposition)
              </label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Affiché uniquement — non utilisé dans les calculs actuels
              </p>
            </div>
            
            {/* Input row */}
            <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 overflow-hidden w-36 flex-shrink-0 transition-all focus-within:ring-2 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-500">
              <input
                type="number"
                value={profile.tmi}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  updateProfileField('tmi', isNaN(v) ? 30 : v);
                }}
                className="flex-1 min-w-0 w-full text-right font-mono text-sm px-3 py-2 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none"
                inputMode="numeric"
              />
              <span className="pr-3 text-xs font-mono text-zinc-500 dark:text-zinc-400 whitespace-nowrap flex-shrink-0">
                %
              </span>
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
            Valeur indicative pour vos calculs fiscaux personnels
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
        <span className="text-lg flex-shrink-0">💡</span>
        <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
          <p>
            Ces valeurs remplacent les réglages par défaut du formulaire. Elles
            s'appliquent à chaque nouvelle analyse.
          </p>
          <p>
            Les biens déjà sauvegardés conservent leurs propres valeurs.
          </p>
        </div>
      </div>

      {/* Reset button */}
      <div className="pt-2">
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-red-300 hover:text-red-500 dark:hover:border-red-700 dark:hover:text-red-400 transition-colors"
          >
            Réinitialiser les valeurs par défaut
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-center text-zinc-600 dark:text-zinc-400">
              Remettre toutes les valeurs aux réglages d'origine ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  resetProfile();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Single profile field row ──────────────────────────────────────────────────
function ProfileField({ field, value, defaultValue, onChange }) {
  const isModified = value !== defaultValue;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Label + badge modifié */}
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {field.label}
            </label>
            {isModified && (
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                modifié
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Valeur par défaut pour tous vos calculs — modifiable bien par bien
          </p>
        </div>

        {/* ── Input + suffix en flex : résout le bug de chevauchement ── */}
        <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 overflow-hidden w-36 focus-within:ring-2 focus-within:ring-zinc-400 dark:focus-within:ring-zinc-500 transition-all flex-shrink-0">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
            min={field.min}
            max={field.max}
            step={field.step}
            className="flex-1 min-w-0 w-full text-right font-mono text-sm px-3 py-2 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none"
            inputMode="decimal"
          />
          <span className="pr-3 text-xs font-mono text-zinc-500 dark:text-zinc-400 whitespace-nowrap flex-shrink-0">
            {field.suffix}
          </span>
        </div>
      </div>

      {isModified && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Défaut : {defaultValue} {field.suffix}
        </p>
      )}
    </div>
  );
}
