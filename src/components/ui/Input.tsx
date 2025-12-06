import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    suffix?: string;
}

import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    suffix,
    className = '',
    id,
    type,
    step,
    ...props
}) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);
    const isNumber = type === 'number';

    const handleStep = (direction: 1 | -1) => {
        // Create synthetic event to trigger onChange
        const currentVal = Number(props.value) || 0;
        const stepVal = Number(step) || 1;

        let newVal = currentVal + (stepVal * direction);

        // Handle floating point precision issues
        if (!Number.isInteger(stepVal)) {
            newVal = parseFloat(newVal.toFixed(2));
        }

        // Mock event object
        const mockEvent = {
            target: { value: newVal.toString() }
        } as React.ChangeEvent<HTMLInputElement>;

        props.onChange?.(mockEvent);
    };

    return (
        <div className={`input-wrapper ${className}`}>
            {label && <label htmlFor={inputId} className="input-label">{label}</label>}

            <div className="input-container">
                {icon && <div className="input-icon">{icon}</div>}

                <input
                    id={inputId}
                    type={type}
                    step={step}
                    className={`glass-input ${icon ? 'has-icon' : ''} ${suffix ? 'has-suffix' : ''} ${error ? 'input-error' : ''} ${isNumber ? 'has-controls' : ''}`}
                    {...props}
                />

                {suffix && <span className="input-suffix">{suffix}</span>}

                {isNumber && (
                    <div className="input-controls">
                        <button type="button" onClick={() => handleStep(1)} className="control-btn up" tabIndex={-1}>
                            <ChevronUpIcon size={14} />
                        </button>
                        <button type="button" onClick={() => handleStep(-1)} className="control-btn down" tabIndex={-1}>
                            <ChevronDownIcon size={14} />
                        </button>
                    </div>
                )}
            </div>

            {error && <p className="input-error-msg">{error}</p>}
        </div>
    );
};
