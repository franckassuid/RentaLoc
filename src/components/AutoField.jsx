export function AutoField({ label, value, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-tight">
          {label}
        </span>
      )}
      <div className="auto-field rounded-lg px-3 py-2 text-sm">
        {value}
      </div>
    </div>
  );
}
