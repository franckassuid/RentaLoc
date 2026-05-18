import { useState, useEffect } from 'react';

const LS_KEY = 'rentaloc_biens';

export function useSavedBiens() {
  const [biens, setBiens] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(biens));
  }, [biens]);

  const saveBien = (bien) => {
    setBiens((prev) => {
      const exists = prev.findIndex((b) => b.id === bien.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = bien;
        return updated;
      }
      return [bien, ...prev];
    });
  };

  const deleteBien = (id) => {
    setBiens((prev) => prev.filter((b) => b.id !== id));
  };

  return { biens, saveBien, deleteBien };
}

export function useActiveMode() {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('rentaloc_mode') || 'quickview';
  });

  const changeMode = (newMode) => {
    setMode(newMode);
    localStorage.setItem('rentaloc_mode', newMode);
  };

  return [mode, changeMode];
}

export function usePersistInputs(key, defaults) {
  const [inputs, setInputs] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
    } catch {
      return { ...defaults };
    }
  });

  const updateField = (field, value) => {
    setInputs((prev) => {
      const next = { ...prev, [field]: value };
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  const resetInputs = (newValues) => {
    const merged = { ...defaults, ...newValues };
    setInputs(merged);
    localStorage.setItem(key, JSON.stringify(merged));
  };

  return [inputs, updateField, resetInputs];
}
