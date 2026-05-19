import { useState, useEffect } from 'react';
import { DEFAULTS } from '../constants';

const LS_KEY = 'rentaloc_profil';
const LS_ONBOARDING = 'rentaloc_onboarding_done';

// ── Seuils par défaut ──────────────────────────────────────────────────────────
export const SEUILS_DEFAULTS = {
  rendementBrutMin:       8,      // % vert
  rendementBrutAttention: 7,      // % jaune
  cashflowMin:           -100,    // € rouge si en dessous
  budgetMax:              100000, // € rouge si au dessus
};

// Profile fields that can override defaults
export const PROFILE_FIELDS = [
  { key: 'tauxNotaire',     label: 'Taux notaire',              suffix: '%',       min: 0, max: 20,     step: 0.5  },
  { key: 'tauxInteret',     label: "Taux d'intérêt",            suffix: '%',       min: 0, max: 10,     step: 0.05 },
  { key: 'tauxAssurance',   label: 'Assurance emprunteur',      suffix: '%',       min: 0, max: 2,      step: 0.05 },
  { key: 'fraisGestion',    label: 'Frais de gestion',          suffix: '%',       min: 0, max: 20,     step: 0.5  },
  { key: 'fraisComptable',  label: 'Frais comptable',           suffix: '€',       min: 0, max: 2000,   step: 50   },
  { key: 'cfe',             label: 'CFE',                       suffix: '€',       min: 0, max: 2000,   step: 50   },
  { key: 'dureeEmprunt',    label: "Durée d'emprunt",           suffix: 'ans',     min: 1, max: 30,     step: 1    },
  { key: 'vacanceMois',     label: 'Vacance locative',          suffix: 'mois/an', min: 0, max: 6,      step: 0.5  },
  { key: 'provisionTravaux',label: 'Provision travaux',         suffix: '€',       min: 0, max: 5000,   step: 100  },
  { key: 'apport',          label: 'Apport par défaut',         suffix: '€',       min: 0, max: 200000, step: 1000 },
];

export const PROFILE_DEFAULTS = {
  tauxNotaire:      DEFAULTS.tauxNotaire,
  tauxInteret:      DEFAULTS.tauxInteret,
  tauxAssurance:    DEFAULTS.tauxAssurance,
  fraisGestion:     DEFAULTS.fraisGestion,
  fraisComptable:   DEFAULTS.fraisComptable,
  cfe:              DEFAULTS.cfe,
  dureeEmprunt:     DEFAULTS.dureeEmprunt,
  vacanceMois:      DEFAULTS.vacanceMois,
  provisionTravaux: DEFAULTS.provisionTravaux,
  apport:           DEFAULTS.apport,
  tmi:              30,
  budgetMobilier:   DEFAULTS.budgetMobilier,
  seuils:           { ...SEUILS_DEFAULTS },
};

function readProfile() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { ...PROFILE_DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      ...PROFILE_DEFAULTS,
      ...parsed,
      seuils: { ...SEUILS_DEFAULTS, ...(parsed.seuils ?? {}) },
    };
  } catch {
    return { ...PROFILE_DEFAULTS };
  }
}

export function isOnboardingDone() {
  try {
    return localStorage.getItem(LS_ONBOARDING) === 'true';
  } catch {
    return true; // fail-safe: don't block the app
  }
}

export function markOnboardingDone() {
  try {
    localStorage.setItem(LS_ONBOARDING, 'true');
  } catch {}
}

export function resetOnboarding() {
  try {
    localStorage.removeItem(LS_ONBOARDING);
  } catch {}
}

export function useProfile() {
  const [profile, setProfile] = useState(readProfile);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(profile));
  }, [profile]);

  const updateProfileField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const updateSeuil = (key, value) => {
    setProfile((prev) => ({
      ...prev,
      seuils: { ...(prev.seuils ?? SEUILS_DEFAULTS), [key]: value },
    }));
  };

  const resetProfile = () => {
    setProfile({ ...PROFILE_DEFAULTS });
    localStorage.setItem(LS_KEY, JSON.stringify(PROFILE_DEFAULTS));
  };

  // Merge profile overrides into app DEFAULTS
  const effectiveDefaults = { ...DEFAULTS, ...profile };

  // Seuils actifs (profil ou defaults)
  const seuils = { ...SEUILS_DEFAULTS, ...(profile.seuils ?? {}) };

  return { profile, updateProfileField, updateSeuil, resetProfile, effectiveDefaults, seuils };
}
