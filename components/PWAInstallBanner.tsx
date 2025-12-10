'use client';

import { useEffect, useState } from 'react';
import { X, Share, PlusSquare, Shield, ChevronRight, Terminal } from 'lucide-react';

export default function PWAInstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [status, setStatus] = useState<'idle' | 'installing'>('idle');

    useEffect(() => {
        // Check if running in standalone mode
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
        setIsStandalone(isStandaloneMode);

        // Check if already closed (using v2 for new design)
        const bannerClosed = localStorage.getItem('pwa_banner_closed_v2');

        if (isStandaloneMode || bannerClosed) return;

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Delay timer (e.g. 10 seconds for testing, user suggested 30s but 10 is better for verifying)
        // Adjust to 15s for "Operational" feel
        const timer = setTimeout(() => {
            // If iOS, just show it after delay
            if (isIosDevice) {
                setShowBanner(true);
            }
        }, 15000);

        // Handle Android install prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show banner after delay even for Android
            setTimeout(() => setShowBanner(true), 15000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            clearTimeout(timer);
        };
    }, []);

    const handleInstallClick = async () => {
        setStatus('installing');

        // Simulating "compiling" delay
        setTimeout(async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    setDeferredPrompt(null);
                    setShowBanner(false);
                }
                setStatus('idle');
            }
        }, 1500);
    };

    const handleClose = () => {
        setShowBanner(false);
        localStorage.setItem('pwa_banner_closed_v2', 'true');
    };

    if (!showBanner || isStandalone) return null;

    return (
        <div
            id="pwa-install-banner"
            className="fixed bottom-0 left-0 w-full z-[9999] p-4 flex justify-center animate-slide-up"
        >
            <div className={`
                w-full max-w-md 
                bg-[#050505] 
                border-t border-x border-[#10B981]/50
                shadow-[0_-4px_20px_rgba(16,185,129,0.15)] 
                p-5 relative font-mono text-xs
                before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[#10B981] before:to-transparent
            `}>

                {/* Close Button - Technical X */}
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 text-[#10B981]/50 hover:text-[#10B981] transition-colors uppercase tracking-widest text-[10px]"
                >
                    [RECUSAR]
                </button>

                <div className="flex items-start gap-4">
                    {/* Icon - Shield/Terminal */}
                    <div className="text-[#10B981] mt-1 p-2 border border-[#10B981]/30 bg-[#10B981]/10">
                        {isIOS ? <Terminal size={20} /> : <Shield size={20} />}
                    </div>

                    <div className="flex-1">
                        <h4 className="m-0 text-sm font-bold text-[#10B981] mb-2 tracking-wider flex items-center gap-2">
                            {'>'} {isIOS ? 'ACESSO_PERMANENTE' : 'CONEXÃO_NATIVA'}
                            <span className="animate-pulse w-2 h-4 bg-[#10B981] block"></span>
                        </h4>

                        <div className="text-[#a0a0a0] leading-relaxed mb-4">
                            {isIOS ? (
                                <span className="block">
                                    O navegador é inseguro. Para fixar o terminal:
                                    <br />
                                    1. Execute <Share size={10} className="inline text-[#10B981]" /> <b>COMPARTILHAR</b>
                                    <br />
                                    2. Selecione <PlusSquare size={10} className="inline text-[#10B981]" /> <b>ADICIONAR À TELA DE INÍCIO</b>
                                </span>
                            ) : (
                                "Execute o protocolo localmente para latência zero e segurança máxima. Elimine a dependência do navegador."
                            )}
                        </div>

                        {!isIOS && (
                            <button
                                onClick={handleInstallClick}
                                disabled={status === 'installing'}
                                className="group w-full border border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-black py-3 px-4 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                                {status === 'installing' ? (
                                    <>COMPILANDO<span className="animate-pulse">...</span></>
                                ) : (
                                    <>
                                        [ INICIALIZAR SISTEMA ]
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
