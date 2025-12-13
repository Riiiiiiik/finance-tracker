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

            // Auto-check for updates every 30 minutes
            const checkForUpdates = async () => {
                try {
                    const registration = await navigator.serviceWorker.getRegistration();
                    if (registration) {
                        console.log('Checking for service worker updates...');
                        await registration.update();
                    }
                } catch (error) {
                    console.error('Error checking for updates:', error);
                }
            };

            // Check immediately on mount
            checkForUpdates();

            // Then check every 30 minutes (1800000ms)
            const updateInterval = setInterval(checkForUpdates, 30 * 60 * 1000);

            return () => {
                wbInstance.removeEventListener('waiting', onWaiting);
                wbInstance.removeEventListener('externalwaiting', onWaiting);
                clearInterval(updateInterval);
            };
        }
    }, []);

    const updateServiceWorker = async () => {
        if (wb) {
            // Tell service worker to skip waiting
            wb.messageSkipWaiting();

            // Add listener for when new SW takes control
            wb.addEventListener('controlling', () => {
                window.location.reload();
            });

            // Also reload immediately as fallback (in case event doesn't fire)
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    };

    return (
        <AnimatePresence>
            {needRefresh && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="fixed bottom-6 right-6 z-[9999] flex justify-center px-4"
                >
                    <div className="bg-[#111] border border-gray-800 rounded-lg p-4 shadow-xl flex items-center gap-4 max-w-md backdrop-blur-sm">
                        <div className="flex-shrink-0 bg-blue-500/10 text-blue-500 p-2 rounded-full">
                            <Zap size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-medium text-sm">
                                Nova atualização disponível
                            </h3>
                            <p className="text-gray-400 text-xs mt-0.5">
                                Clique para carregar a versão mais recente.
                            </p>
                        </div>
                        <button
                            onClick={updateServiceWorker}
                            className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                        >
                            <RefreshCw size={12} />
                            Atualizar
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
