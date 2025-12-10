'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

import Link from 'next/link';
import MonkIcon, { monkColors } from './MonkIcon';

interface FutureInvoicesProps {
    userId: string;
}

interface MonthlyInvoice {
    month: string; // YYYY-MM-DD (dia 1)
    amount: number;
}

export default function FutureInvoices({ userId }: FutureInvoicesProps) {
    const [invoices, setInvoices] = useState<MonthlyInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        loadFutureInvoices();
    }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps


    const loadFutureInvoices = async () => {
        try {
            const today = new Date();
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            const nextMonthStr = nextMonth.toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('transactions')
                .select('amount, invoice_month')
                .eq('user_id', userId)
                .eq('type', 'expense')
                .gte('invoice_month', nextMonthStr)
                .order('invoice_month', { ascending: true });

            if (error) throw error;

            // Agrupar por mês
            const grouped: Record<string, number> = {};
            data?.forEach(t => {
                if (t.invoice_month) {
                    grouped[t.invoice_month] = (grouped[t.invoice_month] || 0) + t.amount;
                }
            });

            const result = Object.entries(grouped).map(([month, amount]) => ({
                month,
                amount
            })).sort((a, b) => a.month.localeCompare(b.month));

            setInvoices(result);
        } catch (error) {
            console.error('Erro ao carregar faturas futuras:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || invoices.length === 0) return null;

    const totalFuture = invoices.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="mb-6">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`${monkColors.auditor.replace('text-', 'bg-')}/20 p-2 rounded-lg`}>
                        <MonkIcon type="auditor" className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <p className={`text-sm font-bold ${monkColors.auditor}`}>Monk.Auditor Log</p>
                        <p className="text-lg font-bold text-foreground">R$ {totalFuture.toFixed(2)}</p>
                        <p className="text-[10px] text-muted-foreground">Faturas e Assinaturas Futuras</p>
                    </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>

            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className={`mt-2 space-y-2 pl-4 border-l-2 ml-6 ${monkColors.auditor.replace('text-', 'border-')}/30`}>
                        {invoices.map((inv) => {
                            const date = new Date(inv.month);
                            // Ajuste de fuso horário simples
                            date.setHours(12);

                            const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

                            return (
                                <div key={inv.month} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0 hover:bg-secondary/30 px-2 rounded transition-colors cursor-default group">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${monkColors.auditor.replace('text-', 'bg-')} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                        <span className="capitalize text-sm text-foreground">{monthName}</span>
                                    </div>
                                    <span className="font-bold text-sm text-foreground">R$ {inv.amount.toFixed(2)}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
