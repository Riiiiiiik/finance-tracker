'use client';

import { useEffect, useState } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';

export default function PWAInstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if running in standalone mode
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
        setIsStandalone(isStandaloneMode);

        // Check if already closed
        const bannerClosed = localStorage.getItem('pwa_banner_closed');

        if (isStandaloneMode || bannerClosed) return;

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        if (isIosDevice) {
            setShowBanner(true);
        }

        // Handle Android install prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowBanner(false);
            }
        }
    };

    const handleClose = () => {
        setShowBanner(false);
        localStorage.setItem('pwa_banner_closed', 'true');
    };

    if (!showBanner || isStandalone) return null;

    return (
        <div
            id="pwa-install-banner"
            className="fixed bottom-0 left-0 w-full z-[9999] p-4 animate-slide-up"
        >
            <div className="max-w-md mx-auto bg-white dark:bg-[#111] border-t-4 border-[#007bff] dark:border-[#10B981] rounded-t-lg shadow-[0_-5px_20px_rgba(0,0,0,0.2)] p-4 relative font-sans">

                <button
                    onClick={handleClose}
                    className="absolute -top-3 -right-2 bg-white dark:bg-[#222] text-gray-500 dark:text-gray-400 rounded-full p-1 shadow-md hover:text-red-500 transition-colors"
                >
                    <X size={16} />
                </button>

                <div className="flex items-center gap-4">
                    <div className="text-3xl animate-bounce">📱</div>

                    <div className="flex-1">
                        <h4 className="m-0 text-sm font-bold text-gray-900 dark:text-white mb-1">
                            {isIOS ? 'Instalar no iPhone' : 'Instale nosso App'}
                        </h4>
                        <div className="text-xs text-gray-600 dark:text-gray-300 leading-tight">
                            {isIOS ? (
                                <span className="flex flex-wrap items-center gap-1">
                                    Toque em <Share size={12} className="inline text-[#007bff]" />
                                    <b>Compartilhar</b> e depois em
                                    <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-1 rounded border border-gray-300 dark:border-gray-700">
                                        <PlusSquare size={10} /> Tela de Início
                                    </span>
                                </span>
                            ) : (
                                "Acesse seus dados financeiros direto da tela inicial, sem abrir o navegador."
                            )}
                        </div>
                    </div>
                </div>

                {!isIOS && (
                    <button
                        onClick={handleInstallClick}
                        className="mt-3 w-full bg-[#007bff] dark:bg-[#10B981] text-white py-2 rounded-md text-sm font-bold active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        <Download size={14} /> Instalar Agora
                    </button>
                )}

                {isIOS && (
                    <div className="mt-3 text-[10px] text-center text-gray-400">
                        Disponível apenas no Safari
                    </div>
                )}
            </div>
        </div>
    );
}
