import { useEffect, useState } from 'react';
import { DownloadIcon, XIcon, ShareIcon, PlusSquareIcon } from 'lucide-react';
import { Button } from './ui/Button';

export const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        // Check if dismissed before
        const isDismissed = localStorage.getItem('pwa_install_dismissed');
        if (isDismissed) return;

        // Android / Chrome
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // iOS Detection
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (isIOS) {
            setShowIOSPrompt(true);
            setIsVisible(true);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsVisible(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('pwa_install_dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="install-prompt glass-panel animate-slide-up">
            <button className="close-btn" onClick={handleDismiss}>
                <XIcon size={20} />
            </button>

            <div className="prompt-content">
                <div className="prompt-header">
                    <strong>Installer Rentaloc</strong>
                    <p>Pour une meilleure expérience</p>
                </div>

                {deferredPrompt && (
                    <Button variant="primary" size="sm" onClick={handleInstall} fullWidth>
                        <DownloadIcon size={16} /> Installer l'App
                    </Button>
                )}

                {showIOSPrompt && (
                    <div className="ios-instructions">
                        <p>Sur iOS :</p>
                        <ol>
                            <li>Touchez le bouton Partager <ShareIcon size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></li>
                            <li>Sélectionnez "Sur l'écran d'accueil" <PlusSquareIcon size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></li>
                        </ol>
                    </div>
                )}
            </div>

            <style>{`
                .install-prompt {
                    position: fixed;
                    bottom: var(--spacing-md);
                    left: var(--spacing-md);
                    right: var(--spacing-md);
                    padding: var(--spacing-md);
                    z-index: 1000;
                    max-width: 400px;
                    margin: 0 auto;
                    border: 1px solid var(--color-primary);
                    background: rgba(15, 23, 42, 0.95);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                }

                .close-btn {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: none;
                    border: none;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    padding: 4px;
                }
                .close-btn:hover { color: var(--color-text-main); }

                .prompt-header {
                    margin-bottom: var(--spacing-md);
                }
                .prompt-header p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: var(--color-text-muted);
                }

                .ios-instructions {
                    font-size: 0.85rem;
                    color: var(--color-text-main);
                    background: rgba(255,255,255,0.05);
                    padding: var(--spacing-sm);
                    border-radius: var(--radius-md);
                }
                .ios-instructions ol {
                    padding-left: 20px;
                    margin: 4px 0 0 0;
                }
                .ios-instructions li {
                    margin-bottom: 4px;
                }

                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </div>
    );
};
