import { useState } from 'react';
import { Layout } from './components/Layout';
import { WizardProvider, useWizard } from './features/wizard/WizardContext';
import { Wizard } from './features/wizard/Wizard';
import { SimpleCalculator } from './features/simple/SimpleCalculator';
import { ProfileModal } from './features/profile/ProfileModal';
import { UserIcon, LayoutGridIcon, ActivityIcon } from 'lucide-react';
import { Button } from './components/ui/Button';
import { TrashIcon, ClockIcon } from 'lucide-react';
import { InstallPrompt } from './components/InstallPrompt';
// Inner component to access Context (which is provided in App)
const MainContent = () => {
  const [view, setView] = useState<'home' | 'simple' | 'complex'>('home');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { savedProjects, loadProject, deleteProject, resetToProfileDefaults } = useWizard();

  const handleLoad = (project: any) => {
    loadProject(project);
    setView('complex');
  };

  const handleStartNew = () => {
    resetToProfileDefaults();
    setView('complex');
  };

  const renderHeaderAction = () => (
    <button
      onClick={() => setIsProfileOpen(true)}
      className="profile-btn"
      aria-label="Profil"
    >
      <UserIcon size={20} />
    </button>
  );

  return (
    <Layout showLogo={view !== 'home'} onLogoClick={() => setView('home')}>
      <div className="top-nav-actions">
        {view !== 'home' && (
          <Button variant="ghost" size="sm" onClick={() => setView('home')}>
            <LayoutGridIcon size={16} /> Accueil
          </Button>
        )}
        {renderHeaderAction()}
      </div>

      {view === 'home' && (
        <div className="home-container animate-fade-in">
          <div className="hero-section">
            <img src="/logo.png" alt="Rentaloc" className="hero-logo" />
          </div>

          <h2 style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>Que souhaitez-vous faire ?</h2>

          <div className="menu-grid">
            <button className="menu-card primary" onClick={() => setView('simple')}>
              <ActivityIcon size={32} />
              <h3>Estimation Rapide</h3>
              <p>Calcul de rentabilité brute en 2 clics.</p>
            </button>

            <button className="menu-card secondary" onClick={handleStartNew}>
              <LayoutGridIcon size={32} />
              <h3>Étude Complète (Vierge)</h3>
              <p>Analyse détaillée : Net, Cashflow, Impôts.</p>
            </button>
          </div>

          {savedProjects.length > 0 && (
            <div className="projects-section">
              <h3 className="section-title">Mes Projets Sauvegardés</h3>
              <div className="projects-list">
                {savedProjects.map(p => (
                  <div key={p.id} className="project-item glass-panel" onClick={() => handleLoad(p)}>
                    <div className="project-info">
                      <strong>{p.projectName || 'Sans Nom'}</strong>
                      <span className="project-date">
                        <ClockIcon size={12} /> {new Date(p.lastModified).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={(e) => { e.stopPropagation(); deleteProject(p.id!); }}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <InstallPrompt />
        </div>
      )}

      {view === 'simple' && (
        <SimpleCalculator onSwitchToComplex={() => setView('complex')} />
      )}

      {view === 'complex' && (
        <Wizard />
      )}

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      <style>{`
        .top-nav-actions {
            position: fixed; /* Fixed to stay on top of Layout header */
            top: 12px;
            right: 12px;
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            z-index: 60;
        }

        .profile-btn {
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--color-border);
            color: var(--color-text-main);
            width: 40px;
            height: 40px;
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        .profile-btn:hover { background: rgba(255,255,255,0.1); }

        .home-menu {
             display: flex;
             flex-direction: column;
             justify-content: center;
             min-height: 60vh;
        }

        .menu-grid {
            display: grid;
            gap: var(--spacing-lg);
            max-width: 400px;
            margin: 0 auto;
            width: 100%;
        }

        .menu-card {
            background: var(--color-bg-card);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--spacing-xl);
            color: var(--color-text-main);
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
        }

        .menu-card:hover {
            transform: translateY(-4px);
            border-color: var(--color-primary);
        }

        .menu-card h3 { margin: 0; font-size: 1.25rem; }
        .menu-card p { margin: 0; color: var(--color-text-muted); font-size: 0.9rem; }
        
        .menu-card.primary svg { color: var(--color-primary); }
        .menu-card.secondary svg { color: var(--color-text-accent); }

        .home-container {
             display: flex;
             flex-direction: column;
             align-items: center;
             padding-top: var(--spacing-xl);
             padding-bottom: var(--spacing-xl);
             width: 100%;
        }

        .projects-section {
            margin-top: var(--spacing-2xl);
            width: 100%;
            max-width: 480px;
        }

        .projects-list {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm);
        }

        .project-item {
            padding: var(--spacing-md);
            border-radius: var(--radius-md);
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            border: 1px solid transparent;
            transition: all 0.2s;
        }

        .project-item:hover {
            border-color: var(--color-primary);
            background: rgba(255,255,255,0.03);
        }

        .project-info {
            display: flex;
            flex-direction: column;
        }
        
        .project-date {
            font-size: 0.75rem;
            color: var(--color-text-muted);
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .delete-btn {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: var(--radius-full);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
        .delete-btn:hover { background: rgba(239, 68, 68, 0.2); }

        .hero-section {
            margin-bottom: var(--spacing-xl);
            display: flex;
            justify-content: center;
        }

        .hero-logo {
            width: 120px;
            height: 120px;
            object-fit: contain;
            filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.2));
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
      `}</style>
    </Layout>
  );
};

function App() {
  return (
    <WizardProvider>
      <MainContent />
    </WizardProvider>
  );
}

export default App;
