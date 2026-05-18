import { useState } from 'react';
import { generateSummaryText } from '../compute';

export function ExportButtons({ inputs, results, note = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = generateSummaryText(inputs, results, note);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-2 no-print">
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200 ${
          copied
            ? 'bg-green-500 text-white border-green-500'
            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
        }`}
      >
        {copied ? '✓ Copié !' : '📋 Copier'}
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        🖨 Imprimer
      </button>
    </div>
  );
}
