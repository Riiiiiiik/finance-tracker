'use client';

import { useState, useEffect } from 'react';
import { supabase, Transaction } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Eye, ShieldCheck, ShieldAlert, TrendingDown, TrendingUp, Activity, PieChart as PieChartIcon } from 'lucide-react';
import MonkRiskWidget from '@/components/MonkRiskWidget';
import { usePrivacy } from '@/lib/privacy-context';

const COLORS = ['#FF4B4B', '#FF8042', '#7C3AED', '#B91C1C', '#EAB308', '#F87171'];

export default function AnalyticsPage() {
    const router = useRouter();
    const { isPrivacyMode } = usePrivacy();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewType, setViewType] = useState<'income' | 'expense'>('expense');
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setLoading(false);
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

    // 2. Dados por Categoria (Pie Chart)
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

    // Calcular Nível de Risco
    let statusRisco = "SEGURO";
    if (balance < 0) {
        statusRisco = "CRÍTICO";
    } else if (totalExpense > totalIncome * 0.8) {
        statusRisco = "MODERADO";
    }

    // Dias do mês para o calendário (simplificado para o mês atual)
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Filtrar transações APENAS do mês atual para o calendário
    const monthlyTransactions = transactions.filter(t => {
        if (!t.date) return false;
        const parts = t.date.split('-');
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        return year === currentYear && month === currentMonth;
    });

    const monthlyTotalExpense = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    // Mapear gastos por dia
    const dailyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            const day = parseInt(t.date.split('-')[2]);
            acc[day] = (acc[day] || 0) + t.amount;
            return acc;
        }, {} as Record<number, number>);

    // Mapear entradas por dia
    const dailyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => {
            const day = parseInt(t.date.split('-')[2]);
            acc[day] = (acc[day] || 0) + t.amount;
            return acc;
        }, {} as Record<number, number>);

    // Média diária para definir "Alto Gasto"
    // Usa o total do mês filtrado dividido pelos dias do mês para evitar distorções
    const averageDailyExpense = monthlyTotalExpense / (daysInMonth || 1);

    if (loading) return (
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
            <div className="text-[#FF4B4B] animate-pulse font-mono tracking-widest">INICIANDO PROTOCOLO SENTRY...</div>
        </div>
    );

    return (
        <div className="bg-[#09090B] min-h-screen text-white p-6 font-sans pb-24 max-w-md mx-auto">

            {/* CABEÇALHO DO SENTINELA */}
            <header className="mb-8 border-b border-gray-800 pb-4 flex justify-between items-end">
                {/* ... header content ... */}
                <div className="flex items-center gap-3">
                    <div className="bg-[#FF4B4B]/20 p-2 rounded-lg border border-[#FF4B4B]/30">
                        <Eye size={24} className="text-[#FF4B4B]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-wide">Monk.Sentry</h1>
                        <p className="text-[10px] text-[#FF4B4B] font-medium tracking-[0.2em] uppercase flex items-center gap-2 mt-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4B4B]"></span>
                            </span>
                            Vigilância Ativa
                        </p>
                    </div>
                </div>

                {/* Badge de Status de Segurança */}
                <div className={`px-3 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${statusRisco === 'SEGURO' ? 'bg-green-500/10 border-green-500 text-green-500' :
                    statusRisco === 'MODERADO' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' :
                        'bg-red-500/10 border-red-500 text-red-500'
                    }`}>
                    Risco: {statusRisco}
                </div>
            </header>

            {/* HUD PRINCIPAL (Cards) */}
            <div className="grid grid-cols-1 gap-4 mb-6">
                {/* ... Cards ... */}
                {/* Drenagem (Saídas) - DESTAQUE */}
                <div className="bg-[#161616] p-5 rounded-xl border-t-2 border-t-[#FF4B4B] relative overflow-hidden shadow-[0_0_15px_rgba(255,75,75,0.1)] group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingDown size={40} className="text-[#FF4B4B]" />
                    </div>
                    <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2 flex items-center gap-1">
                        Drenagem (Saídas)
                    </p>
                    <p className={`text-3xl font-mono text-[#FF4B4B] ${isPrivacyMode ? 'blur-md' : ''}`}>
                        R$ {totalExpense.toFixed(2)}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Entradas (Reforços) */}
                    <div className="bg-[#161616] p-4 rounded-xl border-t-2 border-t-emerald-500 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={24} className="text-emerald-500" />
                        </div>
                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Reforços</p>
                        <p className={`text-lg font-mono text-emerald-400 ${isPrivacyMode ? 'blur-md' : ''}`}>
                            R$ {totalIncome.toFixed(2)}
                        </p>
                    </div>

                    {/* Saldo (Integridade) */}
                    <div className="bg-[#161616] p-4 rounded-xl border-t-2 border-t-gray-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <ShieldAlert size={24} className="text-gray-400" />
                        </div>
                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Integridade</p>
                        <p className={`text-lg font-mono ${balance >= 0 ? 'text-white' : 'text-red-500'} ${isPrivacyMode ? 'blur-md' : ''}`}>
                            R$ {balance.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* SEÇÃO RADAR E CALENDÁRIO */}
            <div className="space-y-6">

                {/* Gráfico (Mapeamento) */}
                <div id="charts-section" className="bg-[#161616] rounded-xl border border-[#333] p-6 relative">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-bold flex items-center gap-2 text-sm">
                            <PieChartIcon size={16} className="text-[#FF4B4B]" />
                            Mapeamento
                        </h3>
                        {/* Toggle */}
                        <div className="bg-[#09090B] rounded p-1 flex text-[10px]">
                            <button
                                onClick={() => setViewType('expense')}
                                className={`px-3 py-1 rounded shadow transition-colors ${viewType === 'expense' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                Saídas
                            </button>
                            <button
                                onClick={() => setViewType('income')}
                                className={`px-3 py-1 rounded shadow transition-colors ${viewType === 'income' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                Entradas
                            </button>
                        </div>
                    </div>

                    {/* Gráfico Real com Estilo Radar */}
                    <div className="h-48 w-full relative flex justify-center items-center">
                        {/* Elementos Decorativos de Radar */}
                        <div className="absolute w-40 h-40 border border-[#333] rounded-full opacity-50 pointer-events-none"></div>
                        <div className="absolute w-28 h-28 border border-[#333] rounded-full opacity-50 pointer-events-none"></div>

                        {pieChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <span className="text-xs text-gray-600">Sem dados</span>
                        )}

                        {/* Status Central */}
                        <div className="absolute text-center pointer-events-none">
                            <span className="block text-xl font-bold text-white shadow-black drop-shadow-md">100%</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 mt-4 text-[10px]">
                        {pieChartData.slice(0, 3).map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-1 text-gray-400">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendário (Registro de Ocorrências) */}
                {/* Monk Risk Widget (Substituindo Calendário) */}
                <MonkRiskWidget
                    riskLevel={statusRisco}
                    onNavigate={() => {
                        const chartSection = document.getElementById('charts-section');
                        if (chartSection) {
                            chartSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                />

            </div>

            {/* Footer Sentry */}
            <div className="mt-8 text-center opacity-30">
                <p className="text-[10px] font-mono text-xs text-[#FF4B4B] uppercase tracking-[0.3em]">Monk.Sentry Online</p>
            </div>
        </div>
    );
}
