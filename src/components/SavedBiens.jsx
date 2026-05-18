import { useState, useMemo } from 'react';

const verdictStyle = {
  GO: 'verdict-go',
  ATTENTION: 'verdict-attention',
  STOP: 'verdict-stop',
};

const verdictIcon = {
  GO: '✅',
  ATTENTION: '⚠️',
  STOP: '🛑',
};

const VERDICT_ORDER = { GO: 0, ATTENTION: 1, STOP: 2 };

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const SORT_OPTIONS = [
  { id: 'date_desc', label: 'Plus récents' },
  { id: 'date_asc',  label: 'Plus anciens' },
  { id: 'name_asc',  label: 'Nom A→Z' },
  { id: 'verdict',   label: 'Verdict' },
];

export function SavedBiens({ biens, onOpen, onDelete, onClose }) {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterVerdict, setFilterVerdict] = useState('ALL');
  const [filterVille, setFilterVille] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  // Unique cities for filter
  const cities = useMemo(() => {
    const set = new Set(biens.map((b) => b.ville).filter(Boolean));
    return ['', ...Array.from(set).sort()];
  }, [biens]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...biens];

    if (filterVerdict !== 'ALL') {
      list = list.filter((b) => b.verdict === filterVerdict);
    }
    if (filterVille) {
      list = list.filter((b) => b.ville === filterVille);
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return a.createdAt - b.createdAt;
        case 'date_desc':
          return b.createdAt - a.createdAt;
        case 'name_asc':
          return a.nom.localeCompare(b.nom, 'fr');
        case 'verdict':
          return (VERDICT_ORDER[a.verdict] ?? 3) - (VERDICT_ORDER[b.verdict] ?? 3);
        default:
          return 0;
      }
    });

    return list;
  }, [biens, filterVerdict, filterVille, sortBy]);

  const hasFilters = filterVerdict !== 'ALL' || filterVille !== '';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Biens sauvegardés
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {filtered.length} / {biens.length} bien{biens.length !== 1 ? 's' : ''}
              {hasFilters && ' (filtrés)'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 space-y-2">
          {/* Verdict filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'GO', 'ATTENTION', 'STOP'].map((v) => (
              <button
                key={v}
                onClick={() => setFilterVerdict(v)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all duration-150 ${
                  filterVerdict === v
                    ? v === 'ALL'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent'
                      : v === 'GO'
                      ? 'bg-green-500 text-white border-transparent'
                      : v === 'ATTENTION'
                      ? 'bg-yellow-500 text-white border-transparent'
                      : 'bg-red-500 text-white border-transparent'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                }`}
              >
                {v === 'ALL' ? 'Tous' : `${verdictIcon[v]} ${v}`}
              </button>
            ))}
          </div>

          {/* City filter + Sort */}
          <div className="flex gap-2">
            {/* City selector */}
            {cities.length > 1 && (
              <select
                value={filterVille}
                onChange={(e) => setFilterVille(e.target.value)}
                className="flex-1 text-xs font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
              >
                <option value="">Toutes les villes</option>
                {cities.filter(Boolean).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            {/* Sort selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 text-xs font-medium bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={() => { setFilterVerdict('ALL'); setFilterVille(''); }}
                className="px-2.5 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-red-500 transition-colors"
                title="Effacer les filtres"
              >
                ✕ Effacer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.length === 0 && biens.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 dark:text-zinc-500">
            <p className="text-3xl mb-3">🏠</p>
            <p className="text-sm">Aucun bien sauvegardé</p>
            <p className="text-xs mt-1">
              Utilisez le bouton "Sauvegarder" pour conserver vos analyses.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 dark:text-zinc-500">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm">Aucun bien ne correspond aux filtres</p>
            <button
              onClick={() => { setFilterVerdict('ALL'); setFilterVille(''); }}
              className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 underline"
            >
              Effacer les filtres
            </button>
          </div>
        ) : (
          filtered.map((bien) => (
            <div
              key={bien.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors active:scale-[0.99]"
            >
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => {
                  onOpen(bien);
                  onClose();
                }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {bien.nom}
                  </span>
                  {bien.ville && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                      📍 {bien.ville}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${verdictStyle[bien.verdict]}`}
                  >
                    {verdictIcon[bien.verdict]} {bien.verdict}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {formatDate(bien.createdAt)}
                </p>
                {bien.note && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate italic">
                    {bien.note}
                  </p>
                )}
                {bien.url && (
                  <a
                    href={bien.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 mt-1.5 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    🔗 Voir l'annonce
                  </a>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(bien.id);
                }}
                className="p-2 text-zinc-300 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                aria-label="Supprimer"
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 w-full max-w-sm space-y-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Supprimer ce bien ? Cette action est irréversible.
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
                  onDelete(confirmDelete);
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
