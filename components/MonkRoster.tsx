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
        <div className="w-full">
            <h3 className="text-[10px] text-muted-foreground/60 font-medium mb-4 uppercase tracking-[0.2em] px-1">
                Conheça os Monk&apos;s
            </h3>

            <div className="flex flex-col gap-3 w-full pb-10">
                {ROSTER_DATA.map((monk) => {
                    const isActive = activeId === monk.id;
                    const Icon = monk.icon;

                    return (
                        <motion.div
                            key={monk.id}
                            layout
                            onClick={() => setActiveId(isActive ? null : monk.id)}
                            className={cn(
                                "relative rounded-2xl border border-white/5 overflow-hidden cursor-pointer transition-all duration-300",
                                isActive ? "bg-[#1A1A1A] ring-1 ring-white/10" : "bg-[#09090B] hover:bg-[#111]"
                            )}
                        >
                            {/* Background Gradient Effect - Subtle */}
                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`absolute inset-0 bg-gradient-to-br ${monk.bgColor} to-transparent opacity-10 pointer-events-none`}
                                />
                            )}

                            <div className="p-6 flex flex-col items-center justify-center text-center relative z-10">
                                <div className={cn(
                                    "p-2 rounded-xl mb-3 transition-transform duration-300",
                                    isActive ? "scale-110" : "scale-100",
                                    monk.color
                                )}>
                                    <Icon className="w-6 h-6" />
                                </div>

                                <span className={cn(
                                    "text-xs font-bold uppercase tracking-widest transition-colors",
                                    isActive ? "text-white" : "text-gray-500"
                                )}>
                                    {monk.title}
                                </span>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden w-full"
                                        >
                                            <div className="pt-4 pb-2 flex flex-col items-center border-t border-white/5 mt-4 w-full">
                                                <span className={cn("text-[10px] uppercase tracking-wider mb-2", monk.color)}>
                                                    {monk.role}
                                                </span>
                                                <p className="text-sm text-gray-400 leading-relaxed max-w-[90%]">
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
