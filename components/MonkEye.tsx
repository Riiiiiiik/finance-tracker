import React from 'react';

interface MonkEyeProps {
    className?: string;
}

export const MonkEye = ({ className = '' }: MonkEyeProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`monk-eye-icon ${className}`}
        >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />

            <circle cx="12" cy="12" r="3" className="monk-pupil" />

            <line x1="12" y1="5" x2="12" y2="3" />
            <line x1="12" y1="19" x2="12" y2="21" />
            <line x1="5" y1="12" x2="3" y2="12" />
            <line x1="19" y1="12" x2="21" y2="12" />
        </svg>
    );
};
