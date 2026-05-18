import { useState, useMemo } from 'react';

const MODES = [
  { id: 'quickview', label: "Coup d'œil", icon: '👁' },
  { id: 'analysis',  label: 'Analyse',    icon: '📊' },
  { id: 'pipeline',  label: 'Pipeline',   icon: '🗂' },
];

export function Header({
  mode,
  onModeChange,
  savedCount,
  biens = [],
  onOpenSaved,
  onOpenBien,
  onOpenProfile,
  theme,
  onToggleTheme,
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  // Sort biens by creation date descending (most recent first)
  const sortedBiens = useMemo(() => {
    return [...biens].sort((a, b) => b.createdAt - a.createdAt);
  }, [biens]);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <button
            onClick={() => onModeChange('quickview')}
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 hover:opacity-80 transition-opacity"
          >
            <img src="/logo-rentaloc-v2.png" alt="Rentaloc'" className="w-6 h-6 object-contain dark:brightness-0 dark:invert" />
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

          {/* Saved biens wrapper */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
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

            {showDropdown && (
              <>
                {/* Click outside overlay */}
                <div
                  className="fixed inset-0 z-40 bg-black/5 dark:bg-black/20 backdrop-blur-[1px] cursor-default"
                  onClick={() => setShowDropdown(false)}
                />

                {/* Dropdown Container */}
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[420px] animate-in fade-in slide-in-from-top-1 duration-200">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      Biens récents ({sortedBiens.length})
                    </span>
                    <button
                      onClick={() => setShowDropdown(false)}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-sm leading-none"
                    >
                      ✕
                    </button>
                  </div>

                  {/* List - scrollable */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[280px] scrollbar-thin">
                    {sortedBiens.length === 0 ? (
                      <div className="text-center py-8 text-zinc-400 dark:text-zinc-500 text-xs">
                        Aucun bien sauvegardé
                      </div>
                    ) : (
                      sortedBiens.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => {
                            onOpenBien(b);
                            setShowDropdown(false);
                          }}
                          className="p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-all duration-150 flex items-center justify-between gap-3 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-850"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {b.nom}
                            </p>
                            {b.ville && (
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                📍 {b.ville}
                              </p>
                            )}
                          </div>
                          
                          {/* Verdict pill */}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                            b.verdict === 'GO'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : b.verdict === 'ATTENTION'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}>
                            {b.verdict}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Fixed Footer with Button */}
                  <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-center sticky bottom-0 left-0 right-0 z-10">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        onOpenSaved();
                      }}
                      className="w-full text-center py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
                    >
                      Afficher tous les biens
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

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
