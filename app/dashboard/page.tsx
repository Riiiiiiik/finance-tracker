'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, User, Eye, EyeOff, Star, Trash2, Repeat } from 'lucide-react';
import { checkAndGenerateRecurrences } from '@/lib/recurrence';
import Link from 'next/link';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import EmotionalAnalytics from '@/components/EmotionalAnalytics';
import AccountCarousel from '@/components/AccountCarousel';
import MagicTransactionForm from '@/components/MagicTransactionForm';
import PayInvoiceModal from '@/components/PayInvoiceModal';
import FutureInvoices from '@/components/FutureInvoices';
import { usePrivacy } from '@/lib/privacy-context';
import MonkIcon, { monkColors } from '@/components/MonkIcon';
import MonkGrid from '@/components/MonkGrid';

import MonkLetter from '@/components/MonkLetter';

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
                        <div className="flex items-center gap-2">
                            <p className="font-medium">{transaction.description}</p>
                            {transaction.recurrence_id && (
                                <Repeat className="w-3 h-3 text-muted-foreground/60" />
                            )}
                        </div>
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

import CreateRecurrenceModal from '@/components/CreateRecurrenceModal';

// ... (existing helper functions)

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
    const [showPayInvoiceModal, setShowPayInvoiceModal] = useState(false);
    const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);

    // Monk Grid Data States
    const [wishlistMain, setWishlistMain] = useState({ name: 'Nova Meta', percent: 0 });
    const [nextInvoiceDate, setNextInvoiceDate] = useState('10/12');
    const [dailyAllowance, setDailyAllowance] = useState(0);

    useEffect(() => {
        checkUser();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    // Recarregar transações quando mudar a conta selecionada
    useEffect(() => {
        if (userId && selectedAccountId) {
            loadTransactions(userId, selectedAccountId);
        }
    }, [selectedAccountId, userId]);

    const loadWishlist = async (uid: string) => {
        // 1. Fetch Total Balance (Integridade)
        const { data: accountsData } = await supabase
            .from('accounts')
            .select('balance, type')
            .eq('user_id', uid);

        const totalBalance = accountsData
            ? accountsData.reduce((acc, curr) => {
                if (['checking', 'savings', 'investment', 'cash'].includes(curr.type)) {
                    return acc + curr.balance;
                }
                return acc;
            }, 0)
            : 0;

        // 2. Fetch Wishlist Items to find the Top Priority one
        // We fetch all active items to sort correctly in JS (since 'high' < 'low' alphabetically)
        const { data: wishlistItems } = await supabase
            .from('wishlist_items')
            .select('*')
            .eq('user_id', uid);

        if (wishlistItems && wishlistItems.length > 0) {
            // Priority Map
            const priorityMap: Record<string, number> = { 'high': 3, 'medium': 2, 'low': 1 };

            // Sort: Priority DESC, then Price ASC (Easier first?) or CreatedAt DESC
            const sortedItems = wishlistItems.sort((a, b) => {
                const pA = priorityMap[a.priority] || 0;
                const pB = priorityMap[b.priority] || 0;
                if (pA !== pB) return pB - pA; // Higher priority first
                return a.price - b.price; // Cheaper items first (Quick wins)
            });

            const topItem = sortedItems[0];
            const percent = Math.min(100, Math.round((totalBalance / topItem.price) * 100));

            setWishlistMain({ name: topItem.name, percent });
        } else {
            setWishlistMain({ name: 'Nova Meta', percent: 0 });
        }
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

            // ----------------------------------------------------
            // AUDITOR LOGIC: Calculate Nearest Invoice Date
            // ----------------------------------------------------
            if (data) {
                const creditAccounts = data.filter(a => a.type === 'credit' || a.closing_day);
                if (creditAccounts.length > 0) {
                    const today = new Date();
                    const currentDay = today.getDate();
                    const currentMonth = today.getMonth(); // 0-indexed
                    const currentYear = today.getFullYear();

                    let nearestDate: Date | null = null;

                    creditAccounts.forEach(acc => {
                        const closingDay = acc.closing_day || 31;
                        let targetDate = new Date(currentYear, currentMonth, closingDay);

                        // If closing day already passed this month, moves to next
                        if (currentDay > closingDay) {
                            targetDate.setMonth(currentMonth + 1);
                        }

                        // Check if this is nearer than what we found
                        if (!nearestDate || targetDate < nearestDate) {
                            nearestDate = targetDate;
                        }
                    });

                    if (nearestDate) {
                        const day = String(nearestDate.getDate()).padStart(2, '0');
                        const month = String(nearestDate.getMonth() + 1).padStart(2, '0');
                        setNextInvoiceDate(`${day}/${month}`);
                    } else {
                        setNextInvoiceDate('--/--');
                    }
                } else {
                    setNextInvoiceDate('Sem Faturas');
                }
            }

            // Se não tiver conta selecionada e houver contas, seleciona 'all'
            if (!selectedAccountId && data) {
                setSelectedAccountId('all');
            }
        } catch (error) {
            console.error('Erro ao carregar contas:', error);
        }
    };

    const loadPockets = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('pockets')
                .select('current_balance')
                .eq('user_id', userId);

            if (error) throw error;

            const totalPockets = data
                ? data.reduce((acc, curr) => acc + curr.current_balance, 0)
                : 0;

            setDailyAllowance(totalPockets);

        } catch (error) {
            console.error('Erro ao carregar pockets:', error);
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
        // 1. Buscar detalhes da transação antes de deletar
        const { data: transaction } = await supabase
            .from('transactions')
            .select('*')
            .eq('id', id)
            .single();

        if (!transaction) return;

        // 2. Deletar transação
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (!error) {
            // 3. Atualizar saldo da conta (Reverter a operação)
            const { data: account } = await supabase
                .from('accounts')
                .select('balance')
                .eq('id', transaction.account_id)
                .single();

            if (account) {
                const amount = transaction.amount;
                const isExpense = transaction.type === 'expense';
                const newBalance = isExpense
                    ? account.balance + amount
                    : account.balance - amount;

                await supabase
                    .from('accounts')
                    .update({ balance: newBalance })
                    .eq('id', transaction.account_id);
            }

            // 4. Update Pocket Balance (Refund)
            // Se a transação estava ligada a um pocket, devolvemos o dinheiro ao pocket
            if (transaction.pocket_id) {
                const { data: pocket } = await supabase
                    .from('pockets')
                    .select('current_balance')
                    .eq('id', transaction.pocket_id)
                    .single();

                if (pocket) {
                    // Se era despesa, devolvemos (soma). Se era renda, tiramos (subtrai).
                    // Budget Logic: Expense reduces balance. Deleting expense increases balance.
                    const refundAmount = transaction.type === 'expense' ? transaction.amount : -transaction.amount;
                    await supabase
                        .from('pockets')
                        .update({ current_balance: pocket.current_balance + refundAmount })
                        .eq('id', transaction.pocket_id);
                }
            }

            setTransactions(transactions.filter(t => t.id !== id));
            setUpdateTrigger(prev => prev + 1);
            if (userId) {
                loadAccounts(userId);
                loadPockets(userId); // Refresh pockets UI
            }
        } else {
            console.error('Erro ao deletar transação:', error);
            alert('Erro ao deletar transação');
        }
    };

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

        // Check for Recurrences
        checkAndGenerateRecurrences(session.user.id).then((result) => {
            if (result.success && result.count && result.count > 0) {
                loadTransactions(session.user.id, selectedAccountId || 'all');
                loadAccounts(session.user.id);
            }
        });

        // Carregar dados iniciais
        await loadAccounts(session.user.id);
        loadPockets(session.user.id); // Load Pockets Sum
        loadTransactions(session.user.id, 'all');
        loadWishlist(session.user.id);

        setLoading(false);
    };

    if (loading) return <div className="p-8 text-center animate-pulse text-muted-foreground">Iniciando protocolo...</div>;

    return (
        <div className="min-h-screen pb-16 max-w-md mx-auto bg-background selection:bg-emerald-500/30">
            {/* THE HEADER: IDENTITY */}
            <header className="flex justify-between items-center p-6 bg-transparent">
                {/* ... existing header content ... */}
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">The Order</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                            Olá, {userName ? userName.split(' ')[0] : 'Initiate'}. O Santuário está seguro.
                        </p>
                    </div>
                </div>

                <Link href="/profile" className="relative w-9 h-9 rounded-full overflow-hidden border border-border/50 hover:border-emerald-500/50 transition-colors">
                    {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />

                    ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                    )}
                </Link>
            </header>

            <main className="px-4 space-y-6">

                {/* SECTION 1: MONK.AI (HERO - COMMAND CENTER) */}
                {userId && (
                    <section className="relative pt-2">
                        {/* AI Input como centro das atenções */}
                        <MagicTransactionForm
                            userId={userId}
                            selectedAccountId={selectedAccountId}
                            accounts={accounts}
                            onTransactionAdded={() => {
                                loadAccounts(userId);
                                loadPockets(userId); // Refresh pockets
                                if (userId && selectedAccountId) {
                                    loadTransactions(userId, selectedAccountId);
                                    loadWishlist(userId);
                                }
                                setUpdateTrigger(prev => prev + 1);
                            }}
                        />
                    </section>
                )}

                {/* SECTION 2: VAULT CONTEXT (WIDGET STYLE) */}
                {/* ... existing sections ... */}
                {userId && (
                    <section className="relative animate-in slide-in-from-bottom-5 duration-700 delay-100">
                        <AccountCarousel
                            userId={userId}
                            accounts={accounts}
                            selectedAccountId={selectedAccountId}
                            onAccountSelect={(id) => {
                                setSelectedAccountId(id);
                                loadTransactions(userId, id);
                            }}
                            onUpdate={() => loadAccounts(userId)}
                            onPayInvoice={() => setShowPayInvoiceModal(true)}
                        />
                    </section>
                )}

                {userId && (
                    <section className="animate-in slide-in-from-bottom-5 duration-700 delay-200">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-[1px] flex-1 bg-white/10"></div>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-mono">Módulos</span>
                            <div className="h-[1px] flex-1 bg-white/10"></div>
                        </div>
                        <MonkGrid
                            dailyAllowance={dailyAllowance}
                            riskCount={0}
                            wishlistMainItem={wishlistMain}
                            nextInvoiceDate={nextInvoiceDate}
                        />
                    </section>
                )}

                {/* Hidden Logic Components (Logic Only) */}
                <div className="hidden">
                    {userId && <FutureInvoices userId={userId} />}
                    {userId && <EmotionalAnalytics userId={userId} refreshTrigger={updateTrigger} />}
                </div>

                {/* SHARED: Transactions */}
                <section className="animate-in slide-in-from-bottom-5 duration-700 delay-300 pt-4">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                            Registro Recente
                        </h3>
                        {transactions.length > 0 && (
                            <Link href="/transactions" className="text-[10px] uppercase tracking-wider text-emerald-500 hover:text-emerald-400 transition-colors">
                                Expanded View
                            </Link>
                        )}
                    </div>

                    {transactions.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/5 rounded-xl bg-white/[0.02]">
                            <p className="text-muted-foreground text-xs font-mono">Nenhum dado registrado.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
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
                </section>
            </main>

            {/* Pay Invoice Modal */}
            {userId && (
                <PayInvoiceModal
                    isOpen={showPayInvoiceModal}
                    onClose={() => setShowPayInvoiceModal(false)}
                    userId={userId}
                    accounts={accounts}
                    onPaymentComplete={() => loadAccounts(userId)}
                />
            )}

            {/* Recurrence Modal */}
            {userId && (
                <CreateRecurrenceModal
                    isOpen={showRecurrenceModal}
                    onClose={() => setShowRecurrenceModal(false)}
                    userId={userId}
                    onComplete={() => {
                        loadTransactions(userId, selectedAccountId || 'all');
                        loadAccounts(userId);
                    }}
                />
            )}
        </div>
    );
}
