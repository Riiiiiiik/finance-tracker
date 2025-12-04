'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, User, Eye, EyeOff, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import EmotionalAnalytics from '@/components/EmotionalAnalytics';
import AccountCarousel from '@/components/AccountCarousel';
import MagicTransactionForm from '@/components/MagicTransactionForm';
import { usePrivacy } from '@/lib/privacy-context';

// Componente de Transação com Swipe-to-Delete
function TransactionItem({
    transaction,
    isPrivacyMode,
    onDelete
}: {
    transaction: any,
    isPrivacyMode: boolean,
    onDelete: (id: string) => void
}) {
    const controls = useAnimation();

    const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x < -100) {
            await controls.start({ x: -1000, transition: { duration: 0.2 } });
            onDelete(transaction.id);
        } else {
            controls.start({ x: 0 });
        }
    };

    return (
        <div className="relative mb-2 overflow-hidden rounded-lg">
            {/* Fundo de Ação (Lixeira) */}
            <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-4 rounded-lg">
                <Trash2 className="w-5 h-5 text-white" />
            </div>

            {/* Card Arrastável */}
            <motion.div
                drag="x"
                dragConstraints={{ right: 0 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ touchAction: 'pan-y' }}
                className="relative bg-card border rounded-lg p-3 bg-background"
            >
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                            {transaction.happiness_score && (
                                <div className="flex text-yellow-500" title={`Nota: ${transaction.happiness_score}/5`}>
                                    {[...Array(transaction.happiness_score)].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 fill-current" />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <p className={`font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'} ${isPrivacyMode ? 'blur-sm' : ''}`}>
                        {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [updateTrigger, setUpdateTrigger] = useState(0);

    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [accounts, setAccounts] = useState<any[]>([]);

    useEffect(() => {
        checkUser();
    }, []);

    // Recarregar transações quando mudar a conta selecionada
    useEffect(() => {
        if (userId && selectedAccountId) {
            loadTransactions(userId, selectedAccountId);
        }
    }, [selectedAccountId, userId]);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login');
            return;
        }

        setUserId(session.user.id);

        // Load user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', session.user.id)
            .single();

        if (profile) {
            setUserName(profile.full_name || '');
            setAvatarUrl(profile.avatar_url || '');
        }

        // Carregar contas e transações iniciais
        await loadAccounts(session.user.id);
        loadTransactions(session.user.id, 'all');

        setLoading(false);
    };

    const loadAccounts = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setAccounts(data || []);

            // Se não tiver conta selecionada e houver contas, seleciona 'all'
            if (!selectedAccountId && data) {
                setSelectedAccountId('all');
            }
        } catch (error) {
            console.error('Erro ao carregar contas:', error);
        }
    };

    const loadTransactions = async (userId: string, accountId: string) => {
        try {
            let query = supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId);

            // Se não for "all", filtra por conta específica
            if (accountId !== 'all') {
                query = query.eq('account_id', accountId);
            }

            const { data, error } = await query
                .order('date', { ascending: false })
                .limit(5);

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
        }
    };

    const handleDeleteTransaction = async (id: string) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (!error) {
            setTransactions(transactions.filter(t => t.id !== id));
            setUpdateTrigger(prev => prev + 1);
            // Atualizar saldo da conta também seria ideal aqui
            if (userId) loadAccounts(userId);
        } else {
            console.error('Erro ao deletar transação:', error);
            alert('Erro ao deletar transação');
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando...</div>;

    return (
        <div className="min-h-screen p-4 pb-20 max-w-md mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Olá, {userName || 'Visitante'}</h1>
                    <p className="text-sm text-muted-foreground">Controle suas finanças</p>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={togglePrivacyMode}
                        className="p-2 hover:bg-secondary rounded-full transition-colors"
                        title={isPrivacyMode ? 'Mostrar valores' : 'Ocultar valores'}
                    >
                        {isPrivacyMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <Link href="/profile" className="relative w-10 h-10 rounded-full overflow-hidden border border-border hover:opacity-80 transition-opacity" title="Meu Perfil">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center">
                                <User className="w-5 h-5 text-muted-foreground" />
                            </div>
                        )}
                    </Link>
                </div>
            </header>

            {/* Carrossel de Contas */}
            {userId && (
                <AccountCarousel
                    userId={userId}
                    accounts={accounts}
                    selectedAccountId={selectedAccountId}
                    onAccountSelect={(id) => {
                        setSelectedAccountId(id);
                        loadTransactions(userId, id);
                    }}
                    onUpdate={() => loadAccounts(userId)}
                />
            )}

            {/* Analytics Minimizado */}
            {userId && <EmotionalAnalytics userId={userId} refreshTrigger={updateTrigger} />}

            {/* Magic Transaction Form */}
            {userId && (
                <MagicTransactionForm
                    userId={userId}
                    selectedAccountId={selectedAccountId}
                    accounts={accounts}
                    onTransactionAdded={() => {
                        if (userId && selectedAccountId) {
                            loadTransactions(userId, selectedAccountId);
                            loadAccounts(userId); // Atualizar saldos
                        }
                        setUpdateTrigger(prev => prev + 1);
                    }}
                />
            )}

            {/* Transações Recentes */}
            <div className="space-y-3">
                <h3 className="font-bold text-sm flex items-center gap-2">
                    <span className="text-lg">📊</span> Histórico Recente
                </h3>
                {transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Nenhuma transação ainda.</p>
                ) : (
                    <div className="space-y-2">
                        {transactions.map((t) => (
                            <TransactionItem
                                key={t.id}
                                transaction={t}
                                isPrivacyMode={isPrivacyMode}
                                onDelete={handleDeleteTransaction}
                            />
                        ))}
                    </div>
                )}
                {transactions.length > 0 && (
                    <Link
                        href="/transactions"
                        className="block text-center text-sm text-primary hover:underline mt-3"
                    >
                        Ver todas as transações →
                    </Link>
                )}
            </div>
        </div>
    );
}
