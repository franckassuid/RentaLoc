import { getVerdict, getLights } from '../compute';

const verdictConfig = {
  GO: {
    icon: '✅',
    bg: 'bg-green-500/5 dark:bg-green-500/10 border-green-500/20',
    dot: 'bg-green-500',
    text: 'text-green-700 dark:text-green-400',
  },
  ATTENTION: {
    icon: '⚠️',
    bg: 'bg-yellow-500/5 dark:bg-yellow-500/10 border-yellow-500/20',
    dot: 'bg-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-400',
  },
  STOP: {
    icon: '🛑',
    bg: 'bg-red-500/5 dark:bg-red-500/10 border-red-500/20',
    dot: 'bg-red-500',
    text: 'text-red-700 dark:text-red-400',
  },
};

/**
 * VerdictBanner — compact version for the sticky analysis header.
 * Shows icon + colored dot + name, without the full label text (GO/STOP/ATTENTION).
 * children = action buttons (export, save, reset)
 */
export function VerdictBanner({ results, nom, ville, children, unsetCount = 0 }) {
  const lights = getLights(results);
  const verdict = getVerdict(lights);
  const cfg = verdictConfig[verdict];

  return (
    <div className={`border rounded-xl px-3 py-2 ${cfg.bg} backdrop-blur-sm`}>
      <div className="flex items-center justify-between gap-2">
        {/* Left: icon + dot + name */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg leading-none flex-shrink-0">{cfg.icon}</span>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
          {(nom || ville) && (
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300 truncate">
              {[nom, ville].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {/* Right: action buttons */}
        {children && (
          <div className="flex items-center gap-1 flex-shrink-0 md:hidden">
            {children}
          </div>
        )}
      </div>

      {/* Missing data indicator */}
      {unsetCount > 0 && (
        <div className="mt-2 text-[11px] font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 rounded px-2 py-1">
          ⚠️ {unsetCount} {unsetCount > 1 ? 'données estimées' : 'donnée estimée'} — résultats optimistes à affiner
        </div>
      )}
    </div>
  );
}
