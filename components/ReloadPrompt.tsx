'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReloadPrompt() {
    const [needRefresh, setNeedRefresh] = useState(false);
    const [wb, setWb] = useState<any>(null);

    useEffect(() => {
        // Only run on client-side
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (window as any).workbox !== undefined) {
            const wbInstance = (window as any).workbox;
            setWb(wbInstance);

            // Add event listeners to detect when a new SW is waiting
            const onWaiting = () => {
                console.log('New service worker waiting. Showing Monk update prompt.');
                setNeedRefresh(true);
            };

            wbInstance.addEventListener('waiting', onWaiting);
            wbInstance.addEventListener('externalwaiting', onWaiting);

            return () => {
                wbInstance.removeEventListener('waiting', onWaiting);
                wbInstance.removeEventListener('externalwaiting', onWaiting);
            };
        }
    }, []);

    const updateServiceWorker = async () => {
        if (wb) {
            wb.messageSkipWaiting();
            wb.addEventListener('controlling', () => {
                window.location.reload();
            });
        }
    };

    return (
        <AnimatePresence>
            {needRefresh && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-20 left-0 right-0 z-[9999] flex justify-center px-3"
                >
                    <div className="relative bg-[#0A0A0A] border-2 border-[#10B981]/30 rounded-2xl p-4 shadow-[0_0_50px_rgba(16,185,129,0.3)] overflow-hidden w-full max-w-sm">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/5 via-transparent to-[#10B981]/5 animate-pulse"></div>

                        {/* Decorative line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#10B981] to-transparent"></div>

                        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                            {/* Icon + Content */}
                            <div className="flex items-center gap-3 flex-1 w-full">
                                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl flex items-center justify-center">
                                    <Zap size={20} className="text-[#10B981] animate-pulse" />
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-white font-bold text-xs sm:text-sm uppercase tracking-wider mb-0.5 flex items-center gap-2">
                                        Protocolo de Atualização
                                        <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse"></span>
                                    </h3>
                                    <p className="text-gray-400 text-[10px] sm:text-xs">
                                        Sistema requer sincronização
                                    </p>
                                </div>
                            </div>

                            {/* Button */}
                            <button
                                onClick={updateServiceWorker}
                                className="group w-full sm:w-auto flex-shrink-0 px-5 py-2.5 bg-[#10B981] hover:bg-[#0EA572] text-black font-bold rounded-lg text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-105 active:scale-95"
                            >
                                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                                Sincronizar
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
