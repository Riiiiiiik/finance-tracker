'use client';

import { useState, useEffect } from 'react';
import { BalanceCard } from '@/components/balance-card';
import { TransactionList } from '@/components/transaction-list';
import { AddTransactionModal } from '@/components/add-transaction-modal';
import { FloatingActionButton } from '@/components/floating-action-button';
import { BottomNav } from '@/components/bottom-nav';
import { Transaction, getTransactions, addTransaction as addTransactionToDb } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Bell, Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Protect route - redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Load transactions from Supabase
    useEffect(() => {
        const loadTransactions = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const data = await getTransactions();
                setTransactions(data);
            } catch (err: any) {
                console.error('Error loading transactions:', err);
                setError('Erro ao carregar transações');
            } finally {
                setLoading(false);
            }
        };

        loadTransactions();
    }, [user]);

    // Calculate totals
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
        try {
            const transaction = await addTransactionToDb(newTransaction);
            setTransactions(prev => [transaction, ...prev]);
        } catch (err: any) {
            console.error('Error adding transaction:', err);
            setError('Erro ao adicionar transação');
        }
    };

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Don't render if not authenticated
    if (!user) {
        return null;
    }

    return (
        <>
            <div className="min-h-screen pb-24">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
                    <div className="flex items-center justify-between p-4">
                        <div>
                            <h1 className="text-2xl font-bold">Dashboard</h1>
                            <p className="text-sm text-muted-foreground">
                                {new Date().toLocaleDateString('pt-BR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long'
                                })}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
                                <Search className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-4 space-y-6">
                    {/* Balance Section */}
                    <BalanceCard balance={balance} income={income} expenses={expenses} />

                    {/* Transactions Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Transações Recentes</h2>
                            <button className="text-sm text-primary font-medium hover:underline">
                                Ver todas
                            </button>
                        </div>
                        <TransactionList transactions={transactions} />
                    </div>
                </main>
            </div>

            {/* FAB */}
            <FloatingActionButton onClick={() => setIsModalOpen(true)} />

            {/* Bottom Navigation */}
            <BottomNav />

            {/* Add Transaction Modal */}
            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddTransaction}
            />
        </>
    );
}
