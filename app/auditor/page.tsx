'use client';

import React, { useEffect, useState } from 'react';
import { RiskHud } from '../../components/auditor/RiskHud';
import { CreditTimeline } from '../../components/auditor/CreditTimeline';
import { LiabilitiesGrid } from '../../components/auditor/LiabilitiesGrid';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { usePrivacy } from '@/lib/privacy-context';
import { MonkEye } from '@/components/MonkEye';

export default function AuditorPage() {
    const router = useRouter();
    const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
    const [loading, setLoading] = useState(true);
    const [creditCards, setCreditCards] = useState<any[]>([]);
    const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
    const [fixedIncomes, setFixedIncomes] = useState<any[]>([]);
    const [totalCommitted, setTotalCommitted] = useState(0);
    const [income, setIncome] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]); // For timeline logs

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login');
            return;
        }

        try {
            const userId = session.user.id;

            // 1. Fetch Credit Cards
            const { data: accounts } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', userId)
                .eq('type', 'credit');

            const cards = accounts || [];
            setCreditCards(cards);

            // 2. Fetch Profile (Base Income)
            const { data: profile } = await supabase
                .from('profiles')
                .select('monthly_income')
                .eq('id', userId)
                .single();

            // 3. Fetch Transactions (Last 45 days)
            const today = new Date();
            const pastDate = new Date();
            pastDate.setDate(today.getDate() - 45);

            const { data: txs } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .gte('date', pastDate.toISOString())
                .order('date', { ascending: false });

            setTransactions(txs || []);

            // 4. Fetch Recurrences (Active)
            const { data: recurrences } = await supabase
                .from('recurrences')
                .select('*')
                .eq('user_id', userId)
                .eq('active', true);

            const allRecurrences = recurrences || [];
            const expenses = allRecurrences.filter(r => r.type === 'expense');
            const recurringIncomes = allRecurrences.filter(r => r.type === 'income');

            // --- BUILD INCOME LIST ---
            let finalIncomes = [...recurringIncomes];

            // A. Add Profile Income (if exists)
            if (profile?.monthly_income && profile.monthly_income > 0) {
                finalIncomes.push({
                    id: 'profile-income',
                    name: 'RENDA BASE (PERFIL)',
                    amount: profile.monthly_income,
                    due_day: null,
                    type: 'profile'
                });
            }

            // B. Add Salary Transactions (Sum of 'Salário' category in current month)
            const currentMonth = new Date().getMonth();
            const salarySum = (txs || [])
                .filter(t => t.type === 'income' && (t.category === 'Salário' || t.description?.toLowerCase().includes('salário')))
                .filter(t => new Date(t.date).getMonth() === currentMonth)
                .reduce((acc, t) => acc + t.amount, 0);

            if (salarySum > 0) {
                finalIncomes.push({
                    id: 'salary-realized',
                    name: 'ENTRADAS [SALÁRIO]',
                    amount: salarySum,
                    due_day: new Date().getDate(),
                    type: 'realized'
                });
            }

            setFixedExpenses(expenses);
            setFixedIncomes(finalIncomes);

            // 5. Calculate Totals
            const cardsDebt = cards.reduce((acc, card) => {
                return acc + (card.balance < 0 ? Math.abs(card.balance) : 0);
            }, 0);

            const fixedTotal = expenses.reduce((acc, item) => acc + item.amount, 0);
            const totalIncome = finalIncomes.reduce((acc, curr) => acc + curr.amount, 0);

            setTotalCommitted(cardsDebt + fixedTotal);
            setIncome(totalIncome);

        } catch (error) {
            console.error('Error fetching auditor data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-black text-[#333] flex items-center justify-center font-mono text-xs tracking-[0.5em] animate-pulse">INITIALIZING...</div>;

    // Calculate Totals for HUD
    const cardsDebtTotal = creditCards.reduce((acc, card) => acc + (card.balance < 0 ? Math.abs(card.balance) : 0), 0);
    const cardsLimitTotal = creditCards.reduce((acc, card) => acc + (card.limit || 0), 0);

    return (
        <div className="min-h-screen bg-black bg-grid text-white p-6 pb-20 selection:bg-red-900 selection:text-white">
            <div className="max-w-md mx-auto border-x border-white/5 min-h-screen bg-black/50 backdrop-blur-sm">

                {/* HEADER: IDENTITY (MONK INDIGO - SENTRY PATTERN) */}
                <header className="mb-10 flex items-center justify-between border-b border-[#2a2d3a] pb-6 mt-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[rgba(88,101,242,0.1)] text-[#5865F2] border border-[#5865F2]/20 shadow-[0_0_15px_rgba(88,101,242,0.15)]">
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-sans font-bold text-white tracking-wide leading-none mb-1">
                                Monk.Auditor
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#5865F2] animate-pulse"></div>
                                <p className="text-[10px] font-bold text-[#5865F2] tracking-[0.2em] uppercase shadow-indigo-500/50">
                                    SISTEMA DE VIGILÂNCIA E RISCO
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={togglePrivacyMode}
                            className={`p-2 transition-colors border border-transparent rounded-lg privacy-toggle ${isPrivacyMode ? 'active' : ''}`}
                            title={isPrivacyMode ? "Desativar Vigilância" : "Ativar Modo Vigilante"}
                        >
                            <MonkEye className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <RiskHud
                    totalCommitted={totalCommitted}
                    income={income}
                    cardsTotal={cardsDebtTotal}
                    cardsLimit={cardsLimitTotal}
                />

                <CreditTimeline creditCards={creditCards} fixedExpenses={fixedExpenses} />

                <LiabilitiesGrid
                    creditCards={creditCards}
                    fixedExpenses={fixedExpenses}
                    fixedIncomes={fixedIncomes}
                    transactions={transactions}
                />
            </div>
        </div>
    );
}
