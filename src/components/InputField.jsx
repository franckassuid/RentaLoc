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
  isRequired = false,
  isOptional = false,
  isUnset = false,
  onToggleUnset,
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
      if (raw === '') {
        onChange(field, '');
      } else {
        const num = parseFloat(raw);
        onChange(field, isNaN(num) ? '' : Math.max(0, num));
      }
    } else {
      onChange(field, raw);
    }
  };

  const showError = isRequired && (value === '' || value === null);

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
          value={value === '' ? '' : value}
          onChange={handleChange}
          disabled={isUnset}
          placeholder={placeholder ?? (type === 'number' ? '0' : '')}
          min={type === 'number' ? 0 : undefined}
          className={`input-base ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-12' : ''} ${showError ? 'border-red-500 focus:ring-red-500' : ''} ${isUnset ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 opacity-50 cursor-not-allowed' : ''}`}
          inputMode={type === 'number' ? 'decimal' : 'text'}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-mono text-zinc-500 dark:text-zinc-400 pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>

      {showError && (
        <span className="text-xs text-red-500 mt-0.5">Valeur requise</span>
      )}

      {isOptional && (
        <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={isUnset}
            onChange={() => onToggleUnset(field)}
            className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-600 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Non renseigné</span>
        </label>
      )}
    </div>
  );
}
