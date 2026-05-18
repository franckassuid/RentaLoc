const MODES = [
  { id: 'quickview', label: "Coup d'œil", icon: '👁' },
  { id: 'analysis',  label: 'Analyse',    icon: '📊' },
  { id: 'pipeline',  label: 'Pipeline',   icon: '🗂' },
];

export function Header({
  mode,
  onModeChange,
  savedCount,
  onOpenSaved,
  onOpenProfile,
  theme,
  onToggleTheme,
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <button
            onClick={() => onModeChange('quickview')}
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity"
          >
            <img src="/logo-clair.png" alt="Rentaloc'" className="w-6 h-6 rounded-md dark:hidden" />
            <img src="/logo-sombre.png" alt="Rentaloc'" className="w-6 h-6 rounded-md hidden dark:block" />
            <span>Rentaloc<span className="text-zinc-500 dark:text-zinc-400">'</span></span>
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 gap-0.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                mode === m.id
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <span>{m.icon}</span>
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Right icons group */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            <span className="text-base leading-none">
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
          </button>

          {/* Saved biens */}
          <button
            onClick={onOpenSaved}
            className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Biens sauvegardés"
          >
            <span className="text-base leading-none">🗂</span>
            {savedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            )}
          </button>

          {/* Profile / Settings */}
          <button
            onClick={onOpenProfile}
            className={`p-2 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
              mode === 'profile'
                ? 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
            aria-label="Paramètres"
            title="Profil & paramètres"
          >
            <span className="text-base leading-none">⚙️</span>
          </button>
        </div>
      </div>
    </header>
  );
}
