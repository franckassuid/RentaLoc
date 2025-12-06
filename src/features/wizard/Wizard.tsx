
import { useWizard } from './WizardContext';
import { PurchaseStep } from './steps/PurchaseStep';
import { RentStep } from './steps/RentStep';
import { ChargesStep } from './steps/ChargesStep';
import { CreditStep } from './steps/CreditStep';

import { ResultsDashboard } from '../results/ResultsDashboard';
import { Button } from '../../components/ui/Button';
import { ChevronRightIcon, ChevronLeftIcon, RotateCcwIcon } from 'lucide-react';

export const Wizard = () => {
    const { currentStep, nextStep, prevStep, steps, setCurrentStep } = useWizard();

    const renderStep = () => {
        switch (currentStep) {
            case 0: return <PurchaseStep />;
            case 1: return <RentStep />;
            case 2: return <ChargesStep />;
            case 3: return <CreditStep />;
            case 4: return <ResultsDashboard />;
            default: return <div>Unknown step</div>;
        }
    };

    const isLastStep = currentStep === steps.length - 1;

    return (
        <div className="wizard-container">
            {/* Progress Bar */}
            <div className="progress-bar-container">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
                    />
                </div>
                <div className="step-label">
                    {isLastStep ? 'Résultats' : `Étape ${currentStep + 1} / ${steps.length - 1}`}
                </div>
            </div>

            {/* Step Content */}
            <div className="step-content animate-fade-in" key={currentStep}>
                {renderStep()}
            </div>

            {/* Navigation */}
            <div className="wizard-nav glass-panel">
                {currentStep > 0 && !isLastStep && (
                    <Button variant="secondary" onClick={prevStep}>
                        <ChevronLeftIcon size={20} /> Retour
                    </Button>
                )}
                {currentStep === 0 && !isLastStep && <div />}

                {!isLastStep ? (
                    <Button variant="primary" onClick={nextStep} style={{ marginLeft: 'auto' }}>
                        Suivant <ChevronRightIcon size={20} />
                    </Button>
                ) : (
                    <div style={{ width: '100%', display: 'flex', gap: 'var(--spacing-md)' }}>
                        <Button variant="secondary" onClick={prevStep} style={{ flex: 1 }}>
                            <ChevronLeftIcon size={20} /> Modifier
                        </Button>
                        <Button variant="outline" onClick={() => setCurrentStep(0)} style={{ flex: 1 }}>
                            <RotateCcwIcon size={20} /> Nouveau
                        </Button>
                    </div>
                )}
            </div>

            <style>{`
                .wizard-container {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-lg);
                    padding-bottom: 80px; /* Space for fixed nav */
                }

                .progress-bar-container {
                    margin-bottom: var(--spacing-sm);
                }

                .progress-bar {
                    height: 4px;
                    background: rgba(255,255,255,0.1);
                    border-radius: var(--radius-full);
                    overflow: hidden;
                    margin-bottom: var(--spacing-xs);
                }

                .progress-fill {
                    height: 100%;
                    background: var(--color-primary);
                    transition: width 0.3s ease;
                }

                .step-label {
                    text-align: right;
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                }

                .wizard-nav {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--spacing-md);
                    
                    /* Fixed positioning at bottom */
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    z-index: 100;
                    
                    /* Match container width rules + glass effect */
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-top: 1px solid var(--color-border);
                    
                    /* Constrain width to reasonable max on desktop */
                    max-width: 600px;
                    margin: 0 auto;
                    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
                }
            `}</style>
        </div>
    );
};
