import { useState } from 'react';
import { generateSummaryText } from '../compute';

export function ExportButtons({ inputs, results, note = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = generateSummaryText(inputs, results, note);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  return (
    <div className="flex gap-1 no-print">
      {/* Copy — icône seule */}
      <button
        onClick={handleCopy}
        title={copied ? 'Copié !' : 'Copier le résumé'}
        className={`flex items-center justify-center w-8 h-8 rounded-lg border text-sm transition-all duration-200 ${
          copied
            ? 'bg-green-500 text-white border-green-500'
            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
        }`}
      >
        {copied ? '✓' : '📋'}
      </button>

      {/* Print — icône seule */}
      <button
        onClick={handlePrint}
        title="Imprimer / Exporter PDF"
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm"
      >
        🖨
      </button>
    </div>
  );
}
