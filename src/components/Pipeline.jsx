import { useState } from 'react';
import { formatPercent } from '../compute';
import { MissingDataChecklist } from './MissingDataChecklist';

const COLUMNS = [
  { id: 'a_analyser',     label: 'À analyser',      icon: '🔍', color: 'border-zinc-300 dark:border-zinc-700' },
  { id: 'interessant',    label: 'Intéressant',      icon: '⭐', color: 'border-blue-300 dark:border-blue-700' },
  { id: 'offre_envisagee',label: 'Offre envisagée',  icon: '📝', color: 'border-yellow-300 dark:border-yellow-700' },
  { id: 'ecarte',         label: 'Écarté / Acquis',  icon: '🏁', color: 'border-zinc-300 dark:border-zinc-600' },
];

const verdictStyle = {
  GO:        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  ATTENTION: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  STOP:      'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};
const verdictIcon = { GO: '✅', ATTENTION: '⚠️', STOP: '🛑' };

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export function Pipeline({ biens, onUpdateBien, onDeleteBien, onOpenBien }) {
  const [dragging, setDragging]       = useState(null); // bien.id
  const [dragOver, setDragOver]       = useState(null); // column.id
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  const handleDragStart = (e, bien) => {
    setDragging(bien.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(colId);
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    if (dragging) {
      const bien = biens.find((b) => b.id === dragging);
      if (bien && bien.status !== colId) {
        onUpdateBien({ ...bien, status: colId });
      }
    }
    setDragging(null);
    setDragOver(null);
  };

  const handleDragEnd = () => {
    setDragging(null);
    setDragOver(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="pt-16 pb-8 px-3 min-h-screen">
      <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 px-1 mb-4">
        🗂 Pipeline
      </h1>

      {/* Kanban grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {COLUMNS.map((col) => {
          const cards = biens.filter((b) => (b.status ?? 'a_analyser') === col.id);
          const isOver = dragOver === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragLeave={() => setDragOver(null)}
              className={`rounded-xl border-2 transition-colors min-h-[160px] ${col.color} ${
                isOver
                  ? 'bg-zinc-100 dark:bg-zinc-800/60'
                  : 'bg-zinc-50 dark:bg-zinc-900/60'
              }`}
            >
              {/* Column header */}
              <div className="px-3 pt-3 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{col.icon}</span>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {col.label}
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-400 dark:text-zinc-600 bg-zinc-200 dark:bg-zinc-700 rounded-full px-1.5 py-0.5 leading-none">
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="px-2 pb-3 space-y-2">
                {cards.map((bien) => (
                  <PipelineCard
                    key={bien.id}
                    bien={bien}
                    isDragging={dragging === bien.id}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onOpen={() => onOpenBien(bien)}
                    onDelete={() => setConfirmDelete(bien.id)}
                    columns={COLUMNS}
                    onMoveToColumn={(colId) => {
                      onUpdateBien({ ...bien, status: colId });
                    }}
                  />
                ))}

                {cards.length === 0 && (
                  <p className="text-center text-xs text-zinc-300 dark:text-zinc-700 py-4 select-none">
                    Déposer ici
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {biens.length === 0 && (
        <div className="text-center py-16 text-zinc-400 dark:text-zinc-600">
          <p className="text-3xl mb-3">🏠</p>
          <p className="text-sm">Aucun bien sauvegardé</p>
          <p className="text-xs mt-1">Analysez un bien et sauvegardez-le pour le voir apparaître ici.</p>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 w-full max-w-sm space-y-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Supprimer ce bien du pipeline ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDeleteBien(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Single pipeline card ───────────────────────────────────────────────────
function PipelineCard({ bien, isDragging, onDragStart, onDragEnd, onOpen, onDelete, columns, onMoveToColumn }) {
  const rendBrut = bien.inputs?.prixFAI > 0
    ? ((bien.inputs.loyerMensuel * 12) / bien.inputs.prixFAI) * 100
    : null;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, bien)}
      onDragEnd={onDragEnd}
      className={`bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${
        isDragging ? 'opacity-40 scale-95' : 'hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-sm'
      }`}
    >
      {/* Card header */}
      <div
        className="cursor-pointer"
        onClick={onOpen}
      >
        <div className="flex items-start justify-between gap-1 mb-1.5">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2">
            {bien.nom}
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${verdictStyle[bien.verdict]}`}>
            {verdictIcon[bien.verdict]}
          </span>
        </div>

        {bien.ville && (
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-1.5">
            📍 {bien.ville}
          </p>
        )}

        <div className="flex items-center justify-between">
          {rendBrut !== null && (
            <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
              {formatPercent(rendBrut)} brut
            </span>
          )}
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 ml-auto">
            {formatDate(bien.createdAt)}
          </span>
        </div>

        {/* Type badge */}
        {bien.type && (
          <span className="inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
            {bien.type === 'appartement' ? '🏢 Appart' : '🏡 Maison'}
          </span>
        )}

        {/* Annonce link */}
        {bien.url && (
          <a
            href={bien.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="block mt-1.5 text-[10px] text-blue-500 hover:text-blue-600 dark:text-blue-400 truncate"
          >
            🔗 Voir l'annonce
          </a>
        )}
      </div>

      {/* Missing data checklist */}
      {bien.unset && bien.unset.filter(field => field !== 'fraisGestion' && field !== 'fraisComptable').length > 0 && (
        <div onClick={onOpen} className="cursor-pointer">
          <MissingDataChecklist unset={bien.unset} onCheck={onOpen} />
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-700">
        {/* Move to column using native select for mobile robustability */}
        <div className="relative flex items-center bg-zinc-50 dark:bg-zinc-800/50 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
          <span className="text-[10px] text-zinc-400 pointer-events-none absolute left-1.5">↕</span>
          <select
            value={bien.status ?? 'a_analyser'}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              onMoveToColumn(e.target.value);
            }}
            className="pl-5 pr-2 py-1 text-[10px] font-medium text-zinc-600 dark:text-zinc-300 bg-transparent cursor-pointer appearance-none outline-none w-28"
            title="Déplacer vers…"
          >
            {columns.map((col) => (
              <option key={col.id} value={col.id}>
                {col.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 transition-colors p-0.5"
          aria-label="Supprimer"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
