'use client';

import { useState, useEffect } from 'react';
import { supabase, Transaction } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
    }, []);

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
        <div className="min-h-screen bg-background pb-24 px-4 pt-4 max-w-md mx-auto">
            {/* Header */}
            <header className="flex items-center gap-3 mb-6">
                <Link href="/dashboard" className="p-2 hover:bg-secondary rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-xl font-bold">Buscar Transações</h1>
                    <p className="text-xs text-muted-foreground">
                        {hasSearched ? `${filteredTransactions.length} transações encontradas` : 'Selecione o período'}
                    </p>
                </div>
            </header>

            {/* Filtros */}
            <div className="bg-card border rounded-xl p-4 mb-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm">📅 Período de Busca</h3>
                    {hasSearched && (
                        <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                            Nova Busca
                        </button>
                    )}
                </div>

                {/* Período */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Data Início *</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 rounded-md bg-background border text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">Data Fim *</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 rounded-md bg-background border text-sm"
                            required
                        />
                    </div>
                </div>

                {/* Tipo */}
                <div>
                    <label className="text-xs text-muted-foreground block mb-1">Tipo</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedType('all')}
                            className={`flex-1 p-2 rounded-md text-xs transition-colors ${selectedType === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                                }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setSelectedType('income')}
                            className={`flex-1 p-2 rounded-md text-xs transition-colors ${selectedType === 'income' ? 'bg-green-600 text-white' : 'bg-secondary'
                                }`}
                        >
                            Entradas
                        </button>
                        <button
                            onClick={() => setSelectedType('expense')}
                            className={`flex-1 p-2 rounded-md text-xs transition-colors ${selectedType === 'expense' ? 'bg-red-600 text-white' : 'bg-secondary'
                                }`}
                        >
                            Saídas
                        </button>
                    </div>
                </div>

                {/* Categoria */}
                <div>
                    <label className="text-xs text-muted-foreground block mb-1">Categoria</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-2 rounded-md bg-background border text-sm"
                    >
                        <option value="all">Todas as categorias</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Botão Pesquisar */}
                <button
                    onClick={handleSearch}
                    className="w-full bg-primary text-primary-foreground p-3 rounded-md font-bold hover:bg-primary/90 transition-colors"
                >
                    🔍 Pesquisar
                </button>
            </div>

            {/* Resultados - Só aparece após pesquisar */}
            {hasSearched && (
                <>
                    {/* Resumo */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                            <p className="text-xs text-green-500 mb-1">Entradas</p>
                            <p className="font-bold text-green-500">R$ {totalIncome.toFixed(2)}</p>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                            <p className="text-xs text-red-500 mb-1">Saídas</p>
                            <p className="font-bold text-red-500">R$ {totalExpense.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Transações Agrupadas por Categoria */}
                    <div className="space-y-4">
                        {Object.entries(groupedByCategory).map(([category, txs]) => {
                            const categoryTotal = txs.reduce((sum, t) =>
                                sum + (t.type === 'income' ? t.amount : -t.amount), 0
                            );

                            return (
                                <div key={category} className="bg-card border rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-sm">{category}</h3>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">{txs.length} transações</p>
                                            <p className={`font-bold text-sm ${categoryTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                R$ {Math.abs(categoryTotal).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {txs.map(t => (
                                            <TransactionItem key={t.id} transaction={t} onDelete={handleDelete} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {filteredTransactions.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">Nenhuma transação encontrada neste período</p>
                                <button onClick={clearFilters} className="text-primary text-sm hover:underline mt-2">
                                    Fazer nova busca
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Mensagem inicial */}
            {!hasSearched && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-sm">
                        Selecione o período e clique em Pesquisar para ver suas transações
                    </p>
                </div>
            )}
        </div>
    );
}
