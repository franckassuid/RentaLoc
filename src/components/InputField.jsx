import { TOOLTIPS } from '../constants';

const lightColors = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

/**
 * InputField — champ de formulaire avec tooltip partagé.
 *
 * openTooltip / setOpenTooltip : géré par le composant parent (InputForm)
 * pour garantir qu'un seul tooltip est ouvert à la fois.
 */
export function InputField({
  label,
  field,
  value,
  onChange,
  suffix,
  prefix,
  type = 'number',
  light,
  placeholder,
  className = '',
  openTooltip,
  setOpenTooltip,
}) {
  const tooltip = TOOLTIPS[field];
  const showTip = openTooltip === field;

  const toggleTip = () => {
    if (!setOpenTooltip) return;
    setOpenTooltip(showTip ? null : field);
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    if (type === 'number') {
      const num = parseFloat(raw);
      onChange(field, isNaN(num) ? 0 : num);
    } else {
      onChange(field, raw);
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-1.5">
        {light && (
          <span
            className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${lightColors[light] || 'bg-zinc-400'}`}
          />
        )}
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-tight">
          {label}
        </label>
        {tooltip && setOpenTooltip && (
          <button
            type="button"
            onClick={toggleTip}
            className={`text-xs leading-none transition-colors flex-shrink-0 ${
              showTip
                ? 'text-zinc-700 dark:text-zinc-300'
                : 'text-zinc-500 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
            aria-label={`Aide pour ${label}`}
            aria-expanded={showTip}
          >
            ⓘ
          </button>
        )}
      </div>

      {/* Tooltip inline — flux normal, pas de portal */}
      {showTip && tooltip && (
        <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 leading-relaxed max-w-full">
          {tooltip}
        </p>
      )}

      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono text-zinc-500 dark:text-zinc-400 pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          type={type === 'number' ? 'number' : 'text'}
          value={value === 0 && type === 'number' ? '' : value}
          onChange={handleChange}
          placeholder={placeholder ?? (type === 'number' ? '0' : '')}
          className={`input-base ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-12' : ''}`}
          inputMode={type === 'number' ? 'decimal' : 'text'}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-mono text-zinc-500 dark:text-zinc-400 pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
