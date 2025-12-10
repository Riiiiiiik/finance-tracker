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

    const isMonk = theme === 'monk';

    const toggleMonk = () => {
        if (isMonk) {
            setTheme('dark');
        } else {
            setTheme('monk');
        }
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
                {isMonk ? 'MONK_ON' : 'MONK_OFF'}
            </span>
        </button>
    );
}
