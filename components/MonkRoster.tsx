'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lock, Star, CheckCircle, Eye, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { monkColors, monkBgColors } from './MonkIcon';

type MonkType = 'vault' | 'ai' | 'sentry' | 'wish' | 'pockets' | 'auditor';

interface MonkLore {
    id: MonkType;
    title: string;
    description: string;
    role: string;
    icon: any;
    color: string;
    bgColor: string;
    likes: number;
}

const ROSTER_DATA: MonkLore[] = [
    {
        id: 'vault',
        title: 'Monk.Vault',
        description: 'A fortaleza inexpugnável. Protege a integridade do seu império financeiro.',
        role: 'Guardião do Saldo',
        icon: Lock,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        likes: 842,
    },
    {
        id: 'ai',
        title: 'Monk.AI',
        description: 'A onisciência digital. Analisa padrões e prevê o futuro das suas finanças.',
        role: 'Oráculo de Dados',
        icon: Sparkles,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        likes: 1205,
    },
    {
        id: 'sentry',
        title: 'Monk.Sentry',
        description: 'Olhos que nunca dormem. Detecta gastos anômalos e riscos ocultos.',
        role: 'Sentinela de Risco',
        icon: Eye,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        likes: 342,
    },
    {
        id: 'wish',
        title: 'Monk.Wish',
        description: 'O arquiteto de sonhos. Materializa desejos através de planejamento estratégico.',
        role: 'Realizador',
        icon: Star,
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        likes: 956,
    },
    {
        id: 'pockets',
        title: 'Monk.Pockets',
        description: 'O mestre da distribuição. Garante que cada moeda tenha um propósito diário.',
        role: 'Gerente Diário',
        icon: Shield,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        likes: 621,
    },
    {
        id: 'auditor',
        title: 'Monk.Auditor',
        description: 'A memória perfeita. Nada é esquecido, tudo é registrado.',
        role: 'O Escriba',
        icon: CheckCircle,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10',
        likes: 489,
    },
];

export default function MonkRoster() {
    const [activeId, setActiveId] = useState<MonkType | null>(null);

    return (
        <div className="w-full px-1 py-2">
            <h3 className="text-[10px] text-muted-foreground/60 font-medium mb-3 uppercase tracking-[0.2em] px-1">
                Conheça os Monk&apos;s
            </h3>

            <div className="flex flex-row gap-2 h-48 w-full">
                {ROSTER_DATA.map((monk) => {
                    const isActive = activeId === monk.id;
                    const Icon = monk.icon;

                    return (
                        <motion.div
                            key={monk.id}
                            layout
                            onClick={() => setActiveId(isActive ? null : monk.id)} // Click to toggle on mobile/desktop
                            onHoverStart={() => setActiveId(monk.id)} // Hover to open on desktop
                            className={cn(
                                "relative rounded-xl border border-white/5 overflow-hidden cursor-pointer transition-colors duration-300",
                                isActive ? "flex-[4]" : "flex-[1]",
                                isActive ? "bg-[#1A1A1A]" : "bg-[#111111] hover:bg-[#161616]"
                            )}
                            animate={{
                                flex: isActive ? 4 : 1,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {/* Background Gradient Effect */}
                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`absolute inset-0 bg-gradient-to-b ${monk.bgColor} to-transparent opacity-20 pointer-events-none`}
                                />
                            )}

                            <div className="absolute inset-0 p-3 flex flex-col items-center justify-center">
                                {/* Icon Always Visible */}
                                <motion.div layout="position" className="flex flex-col items-center gap-2">
                                    <div className={cn(
                                        "p-2 rounded-full backdrop-blur-sm transition-colors",
                                        isActive ? "bg-white/5" : "bg-transparent",
                                        monk.color
                                    )}>
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    {!isActive && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground rotate-0 mt-4 whitespace-nowrap hidden sm:block"
                                            style={{ writingMode: 'vertical-rl' }}
                                        >
                                            {monk.title.split('.')[1]}
                                        </motion.span>
                                    )}
                                </motion.div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.2, delay: 0.1 }}
                                            className="w-full flex flex-col justify-between h-full pt-10 px-2 pb-2"
                                        >
                                            <div className="flex flex-col gap-1 items-start w-full">
                                                <div className="flex items-center gap-2 w-full justify-between">
                                                    <div>
                                                        <h4 className={cn("text-base font-bold", monk.color)}>
                                                            {monk.title}
                                                        </h4>
                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                            {monk.role}
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-xs text-center sm:text-left text-gray-400 mt-2 leading-relaxed">
                                                    &quot;{monk.description}&quot;
                                                </p>
                                            </div>


                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
