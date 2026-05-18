import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import { useActiveMode, useSavedBiens } from './hooks/usePersist';
import { useProfile } from './hooks/useProfile';
import { Header } from './components/Header';
import { QuickView } from './components/QuickView';
import { FullAnalysis } from './components/FullAnalysis';
import { Comparator } from './components/Comparator';
import { SavedBiens } from './components/SavedBiens';
import { ProfileScreen } from './components/ProfileScreen';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useActiveMode();
  const { biens, saveBien, deleteBien } = useSavedBiens();
  const { effectiveDefaults } = useProfile();

  const [showSaved, setShowSaved] = useState(false);
  const [prefill, setPrefill] = useState(null);

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handleOpenProfile = () => {
    setMode('profile');
  };

  const handleSwitchToAnalysis = (values) => {
    setPrefill(values);
    setMode('analysis');
  };

  const handleOpenSaved = (bien) => {
    setPrefill(bien.inputs);
    setMode('analysis');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-200">
      <Header
        mode={mode}
        onModeChange={handleModeChange}
        savedCount={biens.length}
        onOpenSaved={() => setShowSaved(true)}
        onOpenProfile={handleOpenProfile}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main>
        {mode === 'quickview' && (
          <QuickView
            onSwitchToAnalysis={handleSwitchToAnalysis}
            onSave={saveBien}
          />
        )}

        {mode === 'analysis' && (
          <FullAnalysis
            key={JSON.stringify(prefill)}
            prefill={prefill}
            effectiveDefaults={effectiveDefaults}
            onSave={saveBien}
          />
        )}

        {mode === 'compare' && (
          <Comparator
            effectiveDefaults={effectiveDefaults}
            onSave={saveBien}
          />
        )}

        {mode === 'profile' && (
          <ProfileScreen />
        )}
      </main>

      {showSaved && (
        <SavedBiens
          biens={biens}
          onOpen={handleOpenSaved}
          onDelete={deleteBien}
          onClose={() => setShowSaved(false)}
        />
      )}
    </div>
  );
}
