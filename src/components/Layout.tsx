import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
    showLogo?: boolean;
    onLogoClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, showLogo = true, onLogoClick }) => {
    return (
        <div className="layout">
            <header className="header glass-panel">
                <div className="container header-content">
                    {showLogo && (
                        <button
                            className="logo-btn"
                            onClick={onLogoClick}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                            aria-label="Retour à l'accueil"
                        >
                            <div className="logo">
                                <img src="/logo.png" alt="Rentaloc Logo" className="logo-icon" style={{ height: '48px', width: 'auto', maxHeight: '48px', objectFit: 'contain' }} />
                            </div>
                        </button>
                    )}
                </div>
            </header>
            <main className="container main-content">
                {children}
            </main>

            <style>{`
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .header {
          position: sticky;
          top: 0;
          z-index: 50;
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
          border-top: none;
          margin-bottom: var(--spacing-xl);
        }

        .header-content {
            height: 64px;
            display: flex;
            align-items: center;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            color: var(--color-primary);
        }

        .logo-text {
            font-size: 1.25rem;
            font-weight: 700;
            margin: 0;
            color: var(--color-text-main);
        }

        .container {
          width: 100%;
          max-width: 600px; /* Mobile-first optimization keeping it narrow like mobile app */
          margin: 0 auto;
          padding: 0 var(--spacing-md);
          box-sizing: border-box;
        }

        .main-content {
          flex: 1;
          padding-bottom: var(--spacing-xl);
        }
      `}</style>
        </div>
    );
};
