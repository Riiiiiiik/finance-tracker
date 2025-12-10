'use client';

import { useState, useEffect } from 'react';
import { supabase, Transaction } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Calendar, Tag, ArrowRightLeft, FileSearch, CheckCircle } from 'lucide-react';
import TransactionItem from '@/components/TransactionItem';

export default function TransactionsPage() {
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Filtros
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        checkUser();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login');
            return;
        }
        loadTransactions(session.user.id);
    };

    const loadTransactions = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error('Erro ao carregar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!startDate || !endDate) {
            alert('Por favor, selecione o período (data início e fim)');
            return;
        }

        let filtered = [...transactions];

        // Filtro de data
        filtered = filtered.filter(t => t.date >= startDate && t.date <= endDate + 'T23:59:59');

        // Filtro de categoria
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(t => t.category === selectedCategory);
        }

        // Filtro de tipo
        if (selectedType !== 'all') {
            filtered = filtered.filter(t => t.type === selectedType);
        }

        setFilteredTransactions(filtered);
        setHasSearched(true);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (!error) {
            setTransactions(transactions.filter(t => t.id !== id));
            setFilteredTransactions(filteredTransactions.filter(t => t.id !== id));
        }
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedCategory('all');
        setSelectedType('all');
        setHasSearched(false);
    };

    // Agrupar por categoria
    const groupedByCategory = filteredTransactions.reduce((acc, t) => {
        const cat = t.category || 'Sem Categoria';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(t);
        return acc;
    }, {} as Record<string, Transaction[]>);

    const categories = Array.from(new Set(transactions.map(t => t.category || 'Sem Categoria')));

    const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#09090B] min-h-screen text-white font-sans pb-24 px-4 pt-6 max-w-md mx-auto">

            {/* CABEÇALHO DO MÓDULO */}
            <header className="mb-8 relative">
                <Link href="/dashboard" className="absolute top-1 left-0 p-2 hover:bg-[#3F68FF]/10 text-gray-400 hover:text-white rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex flex-col items-center justify-center pt-2">
                    <div className="bg-[#3F68FF]/20 p-3 rounded-xl mb-3 shadow-[0_0_15px_rgba(63,104,255,0.2)] icon-glow">
                        <FileSearch size={28} className="text-[#3F68FF]" />
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-wide">Monk.Auditor</h1>
                    <p className="text-[10px] text-[#3F68FF] font-bold tracking-[0.2em] uppercase mt-1">
                        O Escriba da Verdade
                    </p>
                </div>
            </header>

            {/* CARD DE FILTROS */}
            <div className="bg-[#161616] rounded-xl border border-[#333] border-t-4 border-t-[#3F68FF] p-6 shadow-2xl relative overflow-hidden mb-8">
                {/* Efeito de fundo sutil */}
                <FileSearch className="absolute -right-6 -bottom-6 text-[#3F68FF] opacity-5 w-48 h-48 pointer-events-none" />

                <div className="relative z-10 space-y-6">
                    {/* Título da Seção */}
                    <div className="flex items-center gap-2 text-white font-semibold pb-2 border-b border-white/5">
                        <Calendar size={18} className="text-[#3F68FF]" />
                        <h3 className="text-sm">Período de Análise</h3>
                        {hasSearched && (
                            <button onClick={clearFilters} className="ml-auto text-xs text-[#3F68FF] hover:text-[#3F68FF]/80 transition-colors uppercase font-bold">
                                Limpar
                            </button>
                        )}
                    </div>

                    {/* Inputs de Data */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Início</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-[#09090B] border border-[#333] text-white text-sm rounded-lg p-3 focus:border-[#3F68FF] focus:outline-none focus:ring-1 focus:ring-[#3F68FF]/50 transition-all color-scheme-dark"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Fim</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-[#09090B] border border-[#333] text-white text-sm rounded-lg p-3 focus:border-[#3F68FF] focus:outline-none focus:ring-1 focus:ring-[#3F68FF]/50 transition-all color-scheme-dark"
                            />
                        </div>
                    </div>

                    {/* Tipo de Movimentação */}
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Natureza da Operação</label>
                        <div className="bg-[#09090B] p-1 rounded-lg flex gap-1 border border-[#333]">
                            {[
                                { id: 'all', label: 'Todas' },
                                { id: 'income', label: 'Entradas' },
                                { id: 'expense', label: 'Saídas' }
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id as any)}
                                    className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${selectedType === type.id
                                        ? 'bg-[#3F68FF] text-white shadow-lg'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Classificação</label>
                        <div className="relative">
                            <Tag size={16} className="absolute left-3 top-3.5 text-[#3F68FF]" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-[#09090B] border border-[#333] text-gray-300 text-sm rounded-lg p-3 pl-10 focus:border-[#3F68FF] focus:outline-none appearance-none cursor-pointer hover:border-[#3F68FF]/50 transition-colors"
                            >
                                <option value="all">Todas as categorias</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* BOTÃO DE AÇÃO */}
                    <button
                        onClick={handleSearch}
                        className="w-full bg-[#3F68FF] hover:bg-[#3252cc] text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(63,104,255,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mt-4 group"
                    >
                        <Search size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                        <span className="tracking-wide">CONSULTAR REGISTROS</span>
                    </button>
                </div>
            </div>

            {/* Resultados - Só aparece após pesquisar */}
            {hasSearched && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <div className="h-px bg-gray-800 flex-1" />
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">Resultados</span>
                        <div className="h-px bg-gray-800 flex-1" />
                    </div>

                    {/* Resumo */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-[#161616] border border-green-900/30 rounded-xl p-4 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors" />
                            <p className="text-[10px] text-green-500 mb-1 font-bold uppercase tracking-wider relative z-10">Entradas</p>
                            <p className="font-bold text-green-400 text-lg relative z-10">R$ {totalIncome.toFixed(2)}</p>
                        </div>
                        <div className="bg-[#161616] border border-red-900/30 rounded-xl p-4 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors" />
                            <p className="text-[10px] text-red-500 mb-1 font-bold uppercase tracking-wider relative z-10">Saídas</p>
                            <p className="font-bold text-red-400 text-lg relative z-10">R$ {totalExpense.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Transações Agrupadas por Categoria */}
                    <div className="space-y-4">
                        {Object.entries(groupedByCategory).map(([category, txs]) => {
                            const categoryTotal = txs.reduce((sum, t) =>
                                sum + (t.type === 'income' ? t.amount : -t.amount), 0
                            );

                            return (
                                <div key={category} className="bg-[#161616] border border-[#333] rounded-xl p-4 hover:border-[#3F68FF]/30 transition-colors">
                                    <div className="flex items-center justify-between mb-3 border-b border-[#222] pb-2">
                                        <h3 className="font-bold text-sm text-gray-200">{category}</h3>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{txs.length} registros</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {txs.map(t => (
                                            <TransactionItem key={t.id} transaction={t} onDelete={handleDelete} />
                                        ))}
                                    </div>
                                    <div className="mt-3 pt-2 border-t border-[#222] flex justify-between items-center">
                                        <span className="text-[10px] text-gray-500">Total da Categoria</span>
                                        <span className={`font-bold text-sm ${categoryTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            R$ {Math.abs(categoryTotal).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredTransactions.length === 0 && (
                            <div className="text-center py-12 bg-[#161616] rounded-xl border border-dashed border-[#333]">
                                <FileSearch className="w-12 h-12 text-[#3F68FF] mx-auto mb-3 opacity-50" />
                                <p className="text-gray-400 font-medium">Nenhum registro encontrado.</p>
                                <p className="text-sm text-gray-600 mt-1">A memória da ordem está vazia para este período.</p>
                                <button onClick={clearFilters} className="text-[#3F68FF] text-sm hover:underline mt-4 font-bold">
                                    REDEFINIR PARÂMETROS
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Helper Footer */}
            <div className="mt-12 text-center opacity-40">
                <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500">Monk.Auditor v2.4</p>
                <p className="text-[10px] text-gray-600 mt-1">Sistema de Rastreamento Financeiro</p>
            </div>
        </div>
    );
}
