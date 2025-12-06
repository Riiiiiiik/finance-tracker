'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

interface SentryConfirmState {
    isOpen: boolean;
    options: {
        title?: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        variant?: 'danger' | 'warning' | 'info';
    };
    onConfirm: () => void;
    onCancel: () => void;
}

interface SentryToastProps {
    message: string | null;
    onClose: () => void;
    confirmState?: SentryConfirmState;
}

export default function SentryToast({ message, onClose, confirmState }: SentryToastProps) {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(onClose, 5000); // Auto close after 5s
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    // Priority: Confirmation > Error Message
    const isConfirming = confirmState?.isOpen;

    return (
        <AnimatePresence mode="wait">
            {/* ERROR TOAST */}
            {message && !isConfirming && (
                <motion.div
                    key="error-toast"
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none"
                >
                    <div className="bg-[#121212] border border-red-900/50 shadow-[0_0_30px_rgba(220,38,38,0.2)] rounded-2xl p-4 w-full max-w-sm pointer-events-auto flex gap-4 backdrop-blur-xl">
                        {/* Icon Box */}
                        <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 flex items-center justify-center shrink-0 h-fit">
                            <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-0.5">
                            <div className="flex justify-between items-start">
                                <h3 className="text-red-500 font-bold text-sm tracking-wide uppercase flex items-center gap-2">
                                    Monk.Sentry
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="text-red-500/50 hover:text-red-500 transition-colors -mt-1 -mr-1 p-1"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            <p className="text-gray-300 text-xs mt-1 leading-relaxed font-medium">
                                {message}
                            </p>

                            <div className="mt-2 text-[10px] text-red-500/60 font-mono uppercase tracking-widest">
                                Protocolo de Segurança Ativado
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* CONFIRMATION DIALOG */}
            {isConfirming && confirmState && (
                <motion.div
                    key="confirm-dialog"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-[#121212] border border-[#333] w-full max-w-md rounded-3xl p-6 shadow-2xl"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-yellow-500/10 p-3 rounded-xl border border-yellow-500/20">
                                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Monk.Sentry</h3>
                                <p className="text-yellow-500 text-xs uppercase tracking-widest font-mono">Confirmação Necessária</p>
                            </div>
                        </div>

                        <p className="text-gray-300 text-base mb-8 leading-relaxed">
                            {confirmState.options.message}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={confirmState.onCancel}
                                className="flex-1 py-3 px-4 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] text-gray-400 font-medium transition-colors"
                            >
                                {confirmState.options.cancelText || 'Cancelar'}
                            </button>
                            <button
                                onClick={confirmState.onConfirm}
                                className="flex-1 py-3 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-all transform active:scale-95"
                            >
                                {confirmState.options.confirmText || 'Confirmar'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
