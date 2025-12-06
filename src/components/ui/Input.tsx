import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    suffix?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    suffix,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

    return (
        <div className={`input-wrapper ${className}`}>
            {label && <label htmlFor={inputId} className="input-label">{label}</label>}

            <div className="input-container">
                {icon && <div className="input-icon">{icon}</div>}
                <input
                    id={inputId}
                    className={`glass-input ${icon ? 'has-icon' : ''} ${suffix ? 'has-suffix' : ''} ${error ? 'input-error' : ''}`}
                    {...props}
                />
                {suffix && <span className="input-suffix">{suffix}</span>}
            </div>

            {error && <p className="input-error-msg">{error}</p>}
        </div>
    );
};
