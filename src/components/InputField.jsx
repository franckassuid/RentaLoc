import { TOOLTIPS } from '../constants';

const lightColors = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
};

/**
 * InputField — champ de formulaire avec tooltip partagé.
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
  unsetLabel = 'Non renseigné ?',
  unsetEstim = '~ Estimé',
  onToggleUnset,
  isAdvanced = false,
  profileValue = null,
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
        // En mode avancé, une string vide signifie "revenir au profil" (que le parent doit gérer, 
        // ou on passe simplement la string vide au parent)
        onChange(field, '');
      } else {
        const num = parseFloat(raw);
        onChange(field, isNaN(num) ? '' : Math.max(0, num));
      }
    } else {
      onChange(field, raw);
    }
  };

  // Determine if we should show it as modified
  // For advanced fields, if value is empty or exactly equals profileValue, it's NOT modified.
  const isModified = isAdvanced && value !== '' && value !== null && value !== profileValue;
  
  // Display value: if advanced and not modified, show empty to reveal placeholder
  const displayValue = (isAdvanced && !isModified) ? '' : (value === '' ? '' : value);
  const displayPlaceholder = isAdvanced ? profileValue : (placeholder ?? (type === 'number' ? '0' : ''));

  const showError = isRequired && (value === '' || value === null) && !isAdvanced;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {light && (
            <span
              className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${lightColors[light] || 'bg-zinc-400'}`}
            />
          )}
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-tight">
            {label}
          </label>
          {isModified && (
            <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
              modifié
            </span>
          )}
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
        
        {isOptional && (
          <button
            type="button"
            onClick={() => onToggleUnset(field)}
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors focus:outline-none ${
              isUnset 
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {isUnset ? unsetEstim : unsetLabel}
          </button>
        )}
      </div>

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
          value={displayValue}
          onChange={handleChange}
          onWheel={(e) => e.target.blur()}
          disabled={isUnset}
          placeholder={displayPlaceholder}
          min={type === 'number' ? 0 : undefined}
          className={`input-base ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-12' : ''} ${showError ? 'border-red-500 focus:ring-red-500' : ''} ${isUnset ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 opacity-50 cursor-not-allowed' : ''} ${isAdvanced && !isModified ? 'text-zinc-400 dark:text-zinc-500' : ''}`}
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
    </div>
  );
}
