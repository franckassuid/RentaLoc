import { getVerdict, getLights } from '../compute';

const verdictConfig = {
  GO: {
    icon: '✅',
    label: 'GO',
    className: 'verdict-go',
    bg: 'bg-green-500/5 dark:bg-green-500/10 border-green-500/20',
    text: 'text-green-700 dark:text-green-400',
  },
  ATTENTION: {
    icon: '⚠️',
    label: 'ATTENTION',
    className: 'verdict-attention',
    bg: 'bg-yellow-500/5 dark:bg-yellow-500/10 border-yellow-500/20',
    text: 'text-yellow-700 dark:text-yellow-400',
  },
  STOP: {
    icon: '🛑',
    label: 'STOP',
    className: 'verdict-stop',
    bg: 'bg-red-500/5 dark:bg-red-500/10 border-red-500/20',
    text: 'text-red-700 dark:text-red-400',
  },
};

export function VerdictBanner({ results, nom, ville, children, sticky = true }) {
  const lights = getLights(results);
  const verdict = getVerdict(lights);
  const cfg = verdictConfig[verdict];

  return (
    <div
      className={`verdict-banner border rounded-xl px-4 py-3 ${cfg.bg} ${
        sticky ? 'sticky top-0 z-20' : ''
      } backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{cfg.icon}</span>
          <div>
            {(nom || ville) && (
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-tight">
                {[nom, ville].filter(Boolean).join(' · ')}
              </p>
            )}
            <p className={`text-lg font-bold tracking-wide ${cfg.text}`}>
              {cfg.label}
            </p>
          </div>
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
