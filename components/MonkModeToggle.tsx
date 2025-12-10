'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Eye, Terminal, Monitor } from 'lucide-react';

export default function MonkModeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    // Estado local otimista para resposta instantânea ao clique
    const [optimisticMonk, setOptimisticMonk] = useState<boolean | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const isMonkTheme = theme === 'monk';


    const isMonk = optimisticMonk !== null ? optimisticMonk : isMonkTheme;

    const toggleMonk = () => {
        // Feedback tátil/visual imediato
        const newState = !isMonk;
        setOptimisticMonk(newState);

        // Aplica o tema real com um leve delay se necessário para animação, ou direto
        // setTimeout(() => setTheme(newState ? 'monk' : 'dark'), 50); 
        setTheme(newState ? 'monk' : 'dark');

        // Sincroniza estado final após transição (opcional, mas garante consistência)
        setTimeout(() => setOptimisticMonk(null), 500);
    };

    return (
        <button
            onClick={toggleMonk}
            className={`
                fixed top-4 right-4 z-50 
                flex items-center gap-2 px-3 py-1.5 
                border rounded-full transition-all duration-300
                ${isMonk
                    ? 'bg-black border-[#00FF00] text-[#00FF00] shadow-[0_0_10px_#00FF00]'
                    : 'bg-black/20 border-white/10 text-white/60 hover:text-white hover:bg-black/40 backdrop-blur-md'
                }
            `}
            title={isMonk ? "Deactivate Monk Mode" : "Activate Monk Mode"}
        >
            {isMonk ? <Terminal size={14} /> : <Eye size={14} />}
            <span className="text-xs font-mono uppercase font-bold tracking-wider">
                {isMonk ? 'MODO: ATIVO' : 'MODO: PADRÃO'}
            </span>
        </button>
    );
}
