'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChevronDown, ChevronUp, AlertTriangle, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import MonkIcon, { monkColors } from './MonkIcon';

type AnalyticsData = {
    averageScore: number;
    totalEmotionalLoss: number;
    totalTransactions: number;
    worstTransactions: any[];
    bestTransactions: any[];
};

export default function EmotionalAnalytics({ userId, refreshTrigger }: { userId: string, refreshTrigger: number }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            loadAnalytics();
        }
    }, [userId, refreshTrigger]);

    const loadAnalytics = async () => {
        try {
            // Buscar transações com happiness_score (apenas despesas)
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .not('happiness_score', 'is', null)
                .order('date', { ascending: false });

            if (error) throw error;

            if (!transactions || transactions.length === 0) {
                setLoading(false);
                return;
            }

            // Calcular métricas
            const totalScore = transactions.reduce((acc, t) => acc + (t.happiness_score || 0), 0);
            const averageScore = totalScore / transactions.length;

            // Calcular prejuízo emocional (dinheiro gasto em itens com nota <= 2)
            const totalEmotionalLoss = transactions.reduce((acc, t) => {
                const score = t.happiness_score || 0;
                if (score === 1) return acc + (t.amount * 0.8);
                if (score === 2) return acc + (t.amount * 0.6);
                return acc;
            }, 0);

            // Top Piores (Nota <= 2, ordenados por valor)
            const worstTransactions = transactions
                .filter(t => (t.happiness_score || 0) <= 2)
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 3);

            // Top Melhores (Nota >= 4, ordenados por valor)
            const bestTransactions = transactions
                .filter(t => (t.happiness_score || 0) >= 4)
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 3);

            setData({
                averageScore,
                totalEmotionalLoss,
                totalTransactions: transactions.length,
                worstTransactions,
                bestTransactions
            });

        } catch (error) {
            console.error('Erro ao carregar analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;
    if (!data) return null; // Não mostra nada se não tiver dados

    return (
        <div className="bg-card border rounded-xl overflow-hidden mb-6 transition-all shadow-sm">
            {/* Header (Sempre visível) */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full p-4 flex items-center justify-between transition-colors ${data.totalEmotionalLoss > 0 ? 'bg-red-500/5 hover:bg-red-500/10' : 'bg-secondary/30 hover:bg-secondary/50'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${data.averageScore >= 4 ? 'bg-green-500/20 text-green-600' :
                        data.averageScore >= 3 ? 'bg-yellow-500/20 text-yellow-600' :
                            'bg-red-500/20 text-red-600'
                        }`}>
                        <MonkIcon type="sentry" className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-sm flex items-center gap-2">
                            Monk.Sentry Report
                            {data.totalEmotionalLoss > 0 && <span className="text-[10px] bg-red-500 text-white px-1.5 rounded-full font-bold animate-pulse">ALERTA</span>}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Monitorando comportamento... ({data.totalTransactions} eventos)
                        </p>
                    </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
            </button>

            {/* Conteúdo Expandido */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="p-4 border-t border-border/50 space-y-4">

                            {/* Resumo de Perdas */}
                            {data.totalEmotionalLoss > 0 ? (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3">
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                    <div>
                                        <p className="text-xs text-red-600 font-medium">Prejuízo Emocional Total</p>
                                        <p className="text-lg font-bold text-red-600">R$ {data.totalEmotionalLoss.toFixed(2)}</p>
                                        <p className="text-[10px] text-red-600/80">Dinheiro gasto em experiências ruins</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-3">
                                    <Trophy className="w-8 h-8 text-green-500" />
                                    <div>
                                        <p className="text-xs text-green-600 font-medium">Parabéns!</p>
                                        <p className="text-sm font-bold text-green-600">Zero desperdício emocional!</p>
                                    </div>
                                </div>
                            )}

                            {/* Listas */}
                            <div className="grid gap-4">
                                {/* Piores Gastos */}
                                {data.worstTransactions.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">⚠️ Maiores Arrependimentos</h4>
                                        <div className="space-y-2">
                                            {data.worstTransactions.map(t => (
                                                <div key={t.id} className="flex justify-between items-center text-sm p-2 bg-secondary/50 rounded-md">
                                                    <span className="truncate flex-1 mr-2">{t.description}</span>
                                                    <div className="text-right">
                                                        <span className="block font-bold text-red-500">R$ {t.amount.toFixed(2)}</span>
                                                        <span className="text-xs text-muted-foreground">{t.happiness_score} ⭐</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Melhores Gastos */}
                                {data.bestTransactions.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">🏆 Melhores Investimentos</h4>
                                        <div className="space-y-2">
                                            {data.bestTransactions.map(t => (
                                                <div key={t.id} className="flex justify-between items-center text-sm p-2 bg-secondary/50 rounded-md">
                                                    <span className="truncate flex-1 mr-2">{t.description}</span>
                                                    <div className="text-right">
                                                        <span className="block font-bold text-green-500">R$ {t.amount.toFixed(2)}</span>
                                                        <span className="text-xs text-muted-foreground">{t.happiness_score} ⭐</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
