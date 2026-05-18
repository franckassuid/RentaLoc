import { useState, useEffect } from 'react';

const LS_KEY = 'rentaloc_theme';

function getInitialTheme() {
  const stored = localStorage.getItem(LS_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const t = getInitialTheme();
    applyTheme(t);
    return t;
  });

  // Listen to OS changes only if user hasn't manually set a preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      if (!localStorage.getItem(LS_KEY)) {
        const t = e.matches ? 'dark' : 'light';
        setTheme(t);
        applyTheme(t);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(LS_KEY, next);
      return next;
    });
  };

  return { theme, toggleTheme };
}
