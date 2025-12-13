'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Eye, Terminal, Monitor } from 'lucide-react';

export default function MonkModeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    // Hide on Newsletter page to avoid overlap with Zen Mode controls
    if (typeof window !== 'undefined' && window.location.pathname.includes('/community/newsletter')) {
        return null;
    }

    const isMonk = theme === 'monk';

    const toggleMonk = () => {
        setTheme(isMonk ? 'dark' : 'monk');
    };

    return (
        <button
            onClick={toggleMonk}
            className={`
                fixed top-4 right-4 z-50 
                flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 
                border rounded-full transition-all duration-500 group
                ${isMonk
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : 'bg-black/20 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10'
                }
            `}
            title={isMonk ? "Desativar Monk Mode" : "Ativar Monk Mode"}
        >
            {/* ICON INDICATOR */}
            <div className="relative flex items-center justify-center">
                {isMonk ? (
                    <>
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                        </span>
                    </>
                ) : (
                    <div className="h-2.5 w-2.5 rounded-full border border-zinc-600 group-hover:border-zinc-400 transition-colors" />
                )}
            </div>

            {/* TEXT LABEL - HIDDEN ON MOBILE */}
            <span className={`
                hidden md:inline text-[10px] font-mono font-bold tracking-[0.2em] uppercase transition-all duration-300
                ${isMonk ? '[text-shadow:0_0_10px_rgba(16,185,129,0.5)]' : ''}
            `}>
                {isMonk ? '>_ MODO: ATIVO' : '>_ MODO: ESPERA'}
            </span>
        </button>
    );
}
