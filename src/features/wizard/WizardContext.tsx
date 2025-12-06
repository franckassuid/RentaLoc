import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_PROFILE } from '../../lib/types';
import type { CalculatorInput, UserProfile, SavedProject } from '../../lib/types';
import { useLocalStorage } from '../../lib/useLocalStorage';


// Helper to generate default input from profile
const createInitialState = (profile: UserProfile): CalculatorInput => ({
    id: crypto.randomUUID(),
    projectName: '',
    purchasePrice: 100000,
    notaryFeesRate: profile.defaultNotaryRate,
    agencyFees: 5000,
    worksCost: 0,
    furnitureCost: 0,
    guaranteeFees: 1000,
    monthlyRent: 800,
    extraMonthlyIncome: 0,
    vacancyRate: 0,
    taxeFonciere: 800,
    coOwnershipNonRecoverable: 500,
    insurancePNO: profile.defaultPnoCost,
    insuranceGLI: 200,
    maintenanceBudget: 300,
    propertyManagementRate: 0,
    loanAmount: 80000,
    loanRate: profile.defaultLoanRate,
    loanDurationYears: profile.defaultLoanDuration,
    loanInsuranceRate: profile.defaultLoanInsurance,
    rentalType: profile.rentalType,
    taxRegime: profile.taxRegime,
    tmi: profile.tmi,
    socialTaxRate: 17.2,
    amortizationAnnual: 3000,
    personalCashInvested: 30000,
});

interface WizardContextType {
    input: CalculatorInput;
    setInput: React.Dispatch<React.SetStateAction<CalculatorInput>>;
    updateField: (field: keyof CalculatorInput, value: any) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    steps: string[];
    profile: UserProfile;
    updateProfile: (newProfile: UserProfile) => void;
    resetToProfileDefaults: () => void;
    savedProjects: SavedProject[];
    saveProject: () => void;
    loadProject: (project: SavedProject) => void;
    deleteProject: (id: string) => void;
}


const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useLocalStorage<UserProfile>('rentaloc_profile', DEFAULT_PROFILE);
    const [savedProjects, setSavedProjects] = useLocalStorage<SavedProject[]>('rentaloc_projects', []);
    const [input, setInput] = useState<CalculatorInput>(() => createInitialState(profile));
    const [currentStep, setCurrentStep] = useState(0);

    const steps = ['Acquisition', 'Revenus', 'Charges', 'Financement', 'Résultats'];

    // Auto-update fiscal params if they match the OLD profile default (simple sync)
    useEffect(() => {
        // Only update defaults if the user hasn't loaded a specific project (checked by name/id existence)
        // Actually, let's just be simple: If ID is null (new project) and nothing edited, we sync.
        // But for now, we keep previous behavior of syncing TMI.
        setInput(prev => ({
            ...prev,
            tmi: profile.tmi,
        }));
    }, [profile.tmi]);

    const updateField = (field: keyof CalculatorInput, value: any) => {
        setInput(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const updateProfile = (newProfile: UserProfile) => {
        setProfile(newProfile);
    };

    const resetToProfileDefaults = () => {
        setInput(createInitialState(profile));
        setCurrentStep(0);
    };

    const saveProject = () => {
        const projectToSave: SavedProject = {
            ...input,
            id: input.id || crypto.randomUUID(),
            projectName: input.projectName || 'Projet Sans Nom',
            lastModified: Date.now()
        };

        // If ID exists, update. Else push.
        const existingIndex = savedProjects.findIndex(p => p.id === projectToSave.id);
        let newProjects = [...savedProjects];

        if (existingIndex >= 0) {
            newProjects[existingIndex] = projectToSave;
        } else {
            newProjects.push(projectToSave);
        }

        setSavedProjects(newProjects);
        setInput(projectToSave); // Update input with generated ID if needed
    };

    const loadProject = (project: SavedProject) => {
        setInput(project);
        setCurrentStep(0); // Start at beginning or maybe Results? Let's say beginning for review.
    };

    const deleteProject = (id: string) => {
        const newProjects = savedProjects.filter(p => p.id !== id);
        setSavedProjects(newProjects);
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    return (
        <WizardContext.Provider value={{
            input,
            setInput,
            updateField,
            currentStep,
            setCurrentStep,
            nextStep,
            prevStep,
            steps,
            profile,
            updateProfile,
            resetToProfileDefaults,
            savedProjects,
            saveProject,
            loadProject,
            deleteProject
        }}>
            {children}
        </WizardContext.Provider>
    );
};

export const useWizard = () => {
    const context = useContext(WizardContext);
    if (!context) throw new Error("useWizard must be used within WizardProvider");
    return context;
};
