import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
    return (
        <div className={`glass-panel p-4 rounded-xl ${className}`} style={{ padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-lg)' }}>
            {title && <h3 style={{ marginTop: 0, marginBottom: 'var(--spacing-md)', fontSize: '1.25rem' }}>{title}</h3>}
            {children}
        </div>
    );
};
