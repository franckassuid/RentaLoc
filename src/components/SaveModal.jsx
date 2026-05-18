import { useState } from 'react';

export function SaveModal({
  onSave,
  onClose,
  initialNom = '',
  initialVille = '',
  initialUrl = '',
  initialType = 'appartement',
  initialNote = ''
}) {
  const [nom, setNom] = useState(initialNom);
  const [ville, setVille] = useState(initialVille);
  const [url, setUrl] = useState(initialUrl);
  const [type, setType] = useState(initialType);
  const [note, setNote] = useState(initialNote);

  const handleSave = () => {
    if (!nom.trim()) return;
    onSave({ nom: nom.trim(), ville: ville.trim(), url: url.trim(), type, note: note.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Sauvegarder ce bien
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="ex: Appart Henriville"
              className="input-base"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Ville
            </label>
            <input
              type="text"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="ex: Amiens"
              className="input-base"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Lien de l'annonce <span className="text-zinc-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://leboncoin.fr/..."
              className="input-base"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Type de bien
            </label>
            <div className="flex gap-4 pt-1">
              {[{ value: 'appartement', label: '🏢 Appartement' }, { value: 'maison', label: '🏡 Maison' }].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={opt.value}
                    checked={type === opt.value}
                    onChange={() => setType(opt.value)}
                    className="accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Note <span className="text-zinc-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Bon état, DPE C, copro saine — à rappeler vendredi"
              className="input-base resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!nom.trim()}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
