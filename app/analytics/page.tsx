'use client';

import { useState, useEffect } from 'react';
import { supabase, Transaction } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import SpendingCalendar from '@/components/SpendingCalendar';
import { usePrivacy } from '@/lib/privacy-context';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AnalyticsPage() {
    const router = useRouter();
    const { isPrivacyMode } = usePrivacy();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewType, setViewType] = useState<'income' | 'expense'>('expense');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            const { data } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', session.user.id)
                .order('date', { ascending: true });

            if (data) setTransactions(data);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    // 1. Totais
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const balance = totalIncome - totalExpense;

    // 2. Dados por Categoria (Donut Chart)
    const categoryData = transactions
        .filter(t => t.type === viewType)
        .reduce((acc: any, t) => {
            const cat = t.category || 'Outros';
            acc[cat] = (acc[cat] || 0) + t.amount;
            return acc;
        }, {});

    const pieChartData = Object.keys(categoryData).map(key => ({
        name: key,
        value: categoryData[key]
    }));

    // 3. Dados por Tag (Bar Chart)
    const tagData = transactions
        .filter(t => t.type === 'expense' && t.tags && t.tags.length > 0)
        .reduce((acc: any, t) => {
            t.tags?.forEach(tag => {
                acc[tag] = (acc[tag] || 0) + t.amount;
            });
            return acc;
        }, {});

    const barChartData = Object.keys(tagData)
        .map(key => ({ name: `#${key}`, amount: tagData[key] }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    if (loading) return <div className="p-8 text-center">Carregando analytics...</div>;

    return (
        <div className="min-h-screen p-4 pb-24 max-w-md mx-auto space-y-6">
            <h1 className="text-2xl font-bold mb-6">Analytics</h1>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-card border p-3 rounded-xl text-center">
                    <ArrowUpCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground">Entradas</p>
                    <p className={`font-bold text-sm text-green-500 ${isPrivacyMode ? 'blur-md select-none' : ''}`}>R$ {totalIncome.toFixed(0)}</p>
                </div>
                <div className="bg-card border p-3 rounded-xl text-center">
                    <ArrowDownCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground">Saídas</p>
                    <p className={`font-bold text-sm text-red-500 ${isPrivacyMode ? 'blur-md select-none' : ''}`}>R$ {totalExpense.toFixed(0)}</p>
                </div>
                <div className="bg-card border p-3 rounded-xl text-center">
                    <Wallet className="w-6 h-6 text-primary mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground">Saldo</p>
                    <p className={`font-bold text-sm ${balance >= 0 ? 'text-primary' : 'text-red-500'} ${isPrivacyMode ? 'blur-md select-none' : ''}`}>
                        R$ {balance.toFixed(0)}
                    </p>
                </div>
            </div>

            {/* Gráfico de Categorias */}
            <div className="bg-card border p-4 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold">Por Categoria</h2>
                    <div className="flex bg-secondary rounded-lg p-1">
                        <button
                            onClick={() => setViewType('expense')}
                            className={`px-3 py-1 text-xs rounded-md transition-all ${viewType === 'expense' ? 'bg-background shadow' : ''}`}
                        >
                            Saídas
                        </button>
                        <button
                            onClick={() => setViewType('income')}
                            className={`px-3 py-1 text-xs rounded-md transition-all ${viewType === 'income' ? 'bg-background shadow' : ''}`}
                        >
                            Entradas
                        </button>
                    </div>
                </div>

                <div className="h-64 w-full">
                    {pieChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                            Sem dados para exibir
                        </div>
                    )}
                </div>
            </div>

            {/* Gráfico de Tags (Projetos) */}
            {barChartData.length > 0 && (
                <div className="bg-card border p-4 rounded-xl">
                    <h2 className="font-bold mb-4">Top Projetos (#Tags)</h2>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                                <Bar dataKey="amount" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                    {barChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Calendário Visual */}
            <SpendingCalendar transactions={transactions} />
        </div>
    );
}
