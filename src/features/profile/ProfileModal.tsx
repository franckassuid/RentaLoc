import React from 'react';

import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useWizard } from '../wizard/WizardContext';
import { XIcon, UserIcon, SaveIcon } from 'lucide-react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { profile, updateProfile } = useWizard();
    const [localProfile, setLocalProfile] = React.useState(profile);

    // Sync when opening
    React.useEffect(() => {
        if (isOpen) setLocalProfile(profile);
    }, [isOpen, profile]);

    if (!isOpen) return null;

    const handleSave = () => {
        updateProfile(localProfile);
        onClose();
    };

    const updateField = (field: keyof typeof profile, value: any) => {
        setLocalProfile(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="modal-overlay animate-fade-in">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <h3 className="modal-title"><UserIcon size={20} /> Mon Profil</h3>
                    <button className="close-btn" onClick={onClose}><XIcon size={24} /></button>
                </div>

                <div className="modal-body">
                    <p className="text-muted text-sm mb-4">
                        Ces paramètres seront sauvegardés sur votre appareil et utilisés par défaut pour vos futurs calculs.
                    </p>

                    <h4 className="section-title">Fiscalité</h4>
                    <Input
                        label="Taux Marginal d'Imposition (TMI) %"
                        value={localProfile.tmi}
                        onChange={(e) => updateField('tmi', Number(e.target.value))}
                        type="number"
                        suffix="%"
                    />

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Régime par défaut</label>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button
                                className={`btn ${localProfile.rentalType === 'LMNP' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                onClick={() => updateField('rentalType', 'LMNP')}
                                style={{ flex: 1 }}
                            >
                                LMNP
                            </button>
                            <button
                                className={`btn ${localProfile.rentalType === 'NU' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                onClick={() => updateField('rentalType', 'NU')}
                                style={{ flex: 1 }}
                            >
                                Nu
                            </button>
                        </div>
                    </div>

                    <h4 className="section-title mt-4">Banque (Défauts)</h4>
                    <Input
                        label="Taux crédit estimé %"
                        value={localProfile.defaultLoanRate}
                        onChange={(e) => updateField('defaultLoanRate', Number(e.target.value))}
                        type="number"
                        step="0.01"
                        suffix="%"
                    />
                    <Input
                        label="Durée emprunt (années)"
                        value={localProfile.defaultLoanDuration}
                        onChange={(e) => updateField('defaultLoanDuration', Number(e.target.value))}
                        type="number"
                        suffix="ans"
                    />

                </div>

                <div className="modal-footer">
                    <Button variant="primary" fullWidth onClick={handleSave}>
                        <SaveIcon size={18} /> Enregistrer
                    </Button>
                </div>
            </div>

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.8);
                    z-index: 100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-md);
                }

                .modal-content {
                    width: 100%;
                    max-width: 400px;
                    max-height: 90vh;
                    overflow-y: auto;
                    border-radius: var(--radius-lg);
                    background: var(--color-bg-base); /* reinforce opacity for modal */
                }

                .modal-header {
                    padding: var(--spacing-md);
                    border-bottom: 1px solid var(--color-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-title {
                    margin: 0;
                    display: flex;
                    gap: var(--spacing-sm);
                    align-items: center;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: var(--color-text-muted);
                    cursor: pointer;
                }

                .modal-body {
                    padding: var(--spacing-md);
                }

                .modal-footer {
                    padding: var(--spacing-md);
                    border-top: 1px solid var(--color-border);
                }

                .section-title {
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    color: var(--color-primary);
                    margin-bottom: var(--spacing-md);
                    margin-top: var(--spacing-md);
                }
                .text-sm { font-size: 0.85rem; }
                .text-muted { color: var(--color-text-muted); }
                .mb-4 { margin-bottom: var(--spacing-md); }
            `}</style>
        </div>
    );
};
