'use client';

import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import SentryToast from '@/components/SentryToast';

interface SentryConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

interface SentryContextType {
    notifyError: (message: string) => void;
    confirmAction: (options: SentryConfirmOptions) => Promise<boolean>;
}

const SentryContext = createContext<SentryContextType | undefined>(undefined);

export function SentryProvider({ children }: { children: ReactNode }) {
    const [error, setError] = useState<string | null>(null);
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        options: SentryConfirmOptions;
    } | null>(null);

    const confirmResolver = useRef<((value: boolean) => void) | null>(null);

    const notifyError = (message: string) => {
        setError(message);
    };

    const closeError = () => {
        setError(null);
    };

    const confirmAction = (options: SentryConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            confirmResolver.current = resolve;
            setConfirmState({
                isOpen: true,
                options
            });
        });
    };

    const handleConfirm = (result: boolean) => {
        if (confirmResolver.current) {
            confirmResolver.current(result);
            confirmResolver.current = null;
        }
        setConfirmState(null);
    };

    return (
        <SentryContext.Provider value={{ notifyError, confirmAction }}>
            {children}
            <SentryToast
                message={error}
                onClose={closeError}
                confirmState={confirmState ? { ...confirmState, onConfirm: () => handleConfirm(true), onCancel: () => handleConfirm(false) } : undefined}
            />
        </SentryContext.Provider>
    );
}

export function useSentry() {
    const context = useContext(SentryContext);
    if (!context) {
        throw new Error('useSentry must be used within a SentryProvider');
    }
    return context;
}
