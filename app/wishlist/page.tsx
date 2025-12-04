'use client';

import { useState, useEffect } from 'react';
import { supabase, WishlistItem } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Gift, Plus, Trash2, ExternalLink, Check, X, CheckCircle2, Clock, Ban } from 'lucide-react';
import { usePrivacy } from '@/lib/privacy-context';
import { useCountdown } from '@/hooks/useCountdown';
import { motion, useAnimation, PanInfo } from 'framer-motion';

// Componente do Card de Item com Swipe e Cooling-off
function WishlistItemCard({
    item,
    isPurchased,
    isPrivacyMode,
    balance,
    onPurchase,
    onDelete,
    onStartCoolingOff,
    onCancelCoolingOff
}: {
    item: WishlistItem,
    isPurchased: boolean,
    isPrivacyMode: boolean,
    balance: number,
    onPurchase: (item: WishlistItem) => void,
    onDelete: (id: string) => void,
    onStartCoolingOff: (item: WishlistItem) => void,
    onCancelCoolingOff: (item: WishlistItem) => void
}) {
    const timeLeft = useCountdown(item.cooling_off_until || null);
    const progress = getProgress(item.price, balance);
    const canAfford = balance >= item.price;
    const controls = useAnimation();

    // Estado do botão de compra
    const isCoolingOff = item.cooling_off_until && !timeLeft.isExpired;
    const isReadyToBuy = item.cooling_off_until && timeLeft.isExpired;

    const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.x < -100) {
            await controls.start({ x: -1000, transition: { duration: 0.2 } });
            onDelete(item.id);
        } else {
            controls.start({ x: 0 });
        }
    };

    return (
        <div className="relative mb-4 overflow-hidden rounded-xl">
            {/* Fundo de Ação (Lixeira) */}
            <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-6 rounded-xl">
                <Trash2 className="w-6 h-6 text-white" />
            </div>

            {/* Card Arrastável */}
            <motion.div
                drag="x"
                dragConstraints={{ right: 0 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ touchAction: 'pan-y' }}
                className={`relative bg-card border rounded-xl p-4 ${isPurchased ? 'opacity-75' : ''} bg-background`}
            >
                <div className="flex gap-3">
                    {/* Image */}
                    {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                    ) : (
                        <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center">
                            {isPurchased ? (
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            ) : (
                                <Gift className="w-8 h-8 text-muted-foreground" />
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="font-bold">{item.name}</h3>
                                <p className={`text-lg font-bold text-primary ${isPrivacyMode ? 'blur-md select-none' : ''}`}>
                                    R$ {item.price.toFixed(2)}
                                </p>
                                {isPurchased && item.purchased_at && (
                                    <p className="text-xs text-green-500 mt-1">
                                        ✅ Comprado em {new Date(item.purchased_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                                {!isPurchased && (
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(item.priority)}`}>
                                        {getPriorityLabel(item.priority)}
                                    </span>
                                )}
                                {isCoolingOff && (
                                    <span className="text-xs px-2 py-1 rounded-full border bg-yellow-500/20 text-yellow-500 border-yellow-500/30 animate-pulse font-medium">
                                        🚧 Quarentena Reflexiva
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Progress - Apenas para itens ativos */}
                        {!isPurchased && (
                            <div className="mb-3">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-muted-foreground">
                                        {canAfford ? 'Você já pode comprar! 🎉' : `Faltam R$ ${(item.price - balance).toFixed(2)}`}
                                    </span>
                                    <span className={`font-bold ${isPrivacyMode ? 'blur-sm' : ''}`}>{progress.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${canAfford ? 'bg-green-500' : 'bg-primary'}`}
                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Cooling Off Timer */}
                        {isCoolingOff && (
                            <div className="mb-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
                                <div className="text-xs text-blue-600 font-medium">
                                    <p>Período de reflexão ativo</p>
                                    <p className="font-mono text-sm">
                                        {String(timeLeft.hours).padStart(2, '0')}:
                                        {String(timeLeft.minutes).padStart(2, '0')}:
                                        {String(timeLeft.seconds).padStart(2, '0')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                            {item.link && (
                                <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1 p-2 bg-secondary hover:bg-secondary/80 rounded-md text-xs transition-colors"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Ver
                                </a>
                            )}

                            {!isPurchased && (
                                <>
                                    {!item.cooling_off_until ? (
                                        <button
                                            onClick={() => onStartCoolingOff(item)}
                                            className="flex-1 flex items-center justify-center gap-1 p-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-xs transition-colors font-bold"
                                        >
                                            <Clock className="w-3 h-3" />
                                            {canAfford ? 'Comprar' : 'Quero Comprar!'}
                                        </button>
                                    ) : isCoolingOff ? (
                                        <button
                                            onClick={() => onCancelCoolingOff(item)}
                                            className="flex-1 flex items-center justify-center gap-1 p-2 bg-secondary hover:bg-secondary/80 text-muted-foreground rounded-md text-xs transition-colors"
                                        >
                                            <Ban className="w-3 h-3" />
                                            Desistir
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => onPurchase(item)}
                                            className="flex-1 flex items-center justify-center gap-1 p-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs transition-colors font-bold animate-pulse"
                                        >
                                            <Check className="w-3 h-3" />
                                            Confirmar!
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// Helpers
const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'high': return 'bg-red-500/20 text-red-500 border-red-500/30';
        case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
        case 'low': return 'bg-green-500/20 text-green-500 border-green-500/30';
        default: return 'bg-secondary';
    }
};

const getPriorityLabel = (priority: string) => {
    switch (priority) {
        case 'high': return '🔴 Alta';
        case 'medium': return '🟡 Média';
        case 'low': return '🟢 Baixa';
        default: return priority;
    }
};

const getProgress = (price: number, balance: number) => {
    if (balance >= price) return 100;
    if (balance <= 0) return 0;
    return (balance / price) * 100;
};

export default function WishlistPage() {
    const router = useRouter();
    const { isPrivacyMode } = usePrivacy();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [purchasedItems, setPurchasedItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [balance, setBalance] = useState(0);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

    // Form states
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [link, setLink] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
    const [category, setCategory] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login');
            return;
        }
        loadWishlist(session.user.id);
        loadPurchasedItems(session.user.id);
        loadBalance(session.user.id);
    };

    const loadWishlist = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('wishlist_items')
                .select('*')
                .eq('user_id', userId)
                .is('purchased_at', null)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Erro ao carregar wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPurchasedItems = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('wishlist_items')
                .select('*')
                .eq('user_id', userId)
                .not('purchased_at', 'is', null)
                .order('purchased_at', { ascending: false });

            if (error) throw error;
            setPurchasedItems(data || []);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        }
    };

    const loadBalance = async (userId: string) => {
        try {
            const { data } = await supabase
                .from('transactions')
                .select('amount, type')
                .eq('user_id', userId);

            if (data) {
                const bal = data.reduce((acc, t) =>
                    t.type === 'income' ? acc + t.amount : acc - t.amount, 0
                );
                setBalance(bal);
            }
        } catch (error) {
            console.error('Erro ao carregar saldo:', error);
        }
    };

    const handleAdd = async () => {
        if (!name || !price) {
            alert('Nome e preço são obrigatórios');
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
            .from('wishlist_items')
            .insert([{
                user_id: session.user.id,
                name,
                price: Number(price),
                link: link || null,
                image_url: imageUrl || null,
                priority,
                category: category || null,
                notes: notes || null,
            }])
            .select()
            .single();

        if (error) {
            console.error('Erro ao adicionar:', error);
            alert('Erro ao adicionar item');
            return;
        }

        if (data) {
            setItems([data, ...items]);
            resetForm();
            setShowAddModal(false);
        }
    };

    const handleDelete = async (id: string) => {
        // Confirmação visual já é dada pelo swipe, mas podemos adicionar um confirm se quiser
        // if (!confirm('Tem certeza que deseja remover este item?')) return;

        const { error } = await supabase
            .from('wishlist_items')
            .delete()
            .eq('id', id);

        if (!error) {
            setItems(items.filter(i => i.id !== id));
            setPurchasedItems(purchasedItems.filter(i => i.id !== id));
        } else {
            alert('Erro ao deletar item');
        }
    };

    const handleStartCoolingOff = async (item: WishlistItem) => {
        const coolingOffUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now

        const { error } = await supabase
            .from('wishlist_items')
            .update({ cooling_off_until: coolingOffUntil })
            .eq('id', item.id);

        if (!error) {
            setItems(items.map(i =>
                i.id === item.id ? { ...i, cooling_off_until: coolingOffUntil } : i
            ));
            alert('⏳ Período de reflexão iniciado! Volte em 24h para confirmar a compra.');
        } else {
            console.error('Erro ao iniciar cooling-off:', error);
            alert('Erro ao iniciar período de reflexão');
        }
    };

    const handleCancelCoolingOff = async (item: WishlistItem) => {
        const { error } = await supabase
            .from('wishlist_items')
            .update({ cooling_off_until: null })
            .eq('id', item.id);

        if (!error) {
            setItems(items.map(i =>
                i.id === item.id ? { ...i, cooling_off_until: undefined } : i
            ));
        }
    };

    const handlePurchase = async (item: WishlistItem) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Criar transação
        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .insert([{
                user_id: session.user.id,
                amount: item.price,
                description: item.name,
                type: 'expense',
                category: item.category || 'Compras',
                date: new Date().toISOString(),
            }])
            .select()
            .single();

        if (txError) {
            console.error('Erro ao criar transação:', txError);
            alert('Erro ao registrar compra');
            return;
        }

        // Marcar como comprado
        const { error: updateError } = await supabase
            .from('wishlist_items')
            .update({
                purchased_at: new Date().toISOString(),
                transaction_id: transaction.id,
                cooling_off_until: null // Limpar cooling off
            })
            .eq('id', item.id);

        if (!updateError) {
            setItems(items.filter(i => i.id !== item.id));
            loadPurchasedItems(session.user.id);
            loadBalance(session.user.id);
            alert('🎉 Item comprado e registrado nas transações!');
        }
    };

    const resetForm = () => {
        setName('');
        setPrice('');
        setLink('');
        setImageUrl('');
        setPriority('medium');
        setCategory('');
        setNotes('');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        );
    }

    const currentItems = activeTab === 'active' ? items : purchasedItems;

    return (
        <div className="min-h-screen bg-background pb-24 px-4 pt-4 max-w-md mx-auto">
            {/* Header */}
            <header className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Gift className="w-6 h-6 text-primary" />
                        <h1 className="text-2xl font-bold">Lista de Desejos</h1>
                    </div>
                    {activeTab === 'active' && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-secondary p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'active'
                            ? 'bg-background shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        🎯 Ativos ({items.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'history'
                            ? 'bg-background shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        ✅ Comprados ({purchasedItems.length})
                    </button>
                </div>
            </header>

            {/* Items List */}
            {currentItems.length === 0 ? (
                <div className="text-center py-16">
                    {activeTab === 'active' ? (
                        <>
                            <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-muted-foreground mb-2">Sua lista está vazia</p>
                            <p className="text-sm text-muted-foreground">Adicione itens que você deseja comprar!</p>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-muted-foreground mb-2">Nenhum item comprado ainda</p>
                            <p className="text-sm text-muted-foreground">Itens comprados aparecerão aqui</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {currentItems.map(item => (
                        <WishlistItemCard
                            key={item.id}
                            item={item}
                            isPurchased={activeTab === 'history'}
                            isPrivacyMode={isPrivacyMode}
                            balance={balance}
                            onPurchase={handlePurchase}
                            onDelete={handleDelete}
                            onStartCoolingOff={handleStartCoolingOff}
                            onCancelCoolingOff={handleCancelCoolingOff}
                        />
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="bg-card border rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">Adicionar Item</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-secondary rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Nome *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ex: iPhone 15 Pro"
                                    className="w-full p-2 rounded-md bg-background border"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Preço (R$) *</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full p-2 rounded-md bg-background border"
                                    required
                                    step="0.01"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Prioridade</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setPriority('high')}
                                        className={`flex-1 p-2 rounded-md text-xs transition-colors ${priority === 'high' ? 'bg-red-600 text-white' : 'bg-secondary'
                                            }`}
                                    >
                                        🔴 Alta
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPriority('medium')}
                                        className={`flex-1 p-2 rounded-md text-xs transition-colors ${priority === 'medium' ? 'bg-yellow-600 text-white' : 'bg-secondary'
                                            }`}
                                    >
                                        🟡 Média
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPriority('low')}
                                        className={`flex-1 p-2 rounded-md text-xs transition-colors ${priority === 'low' ? 'bg-green-600 text-white' : 'bg-secondary'
                                            }`}
                                    >
                                        🟢 Baixa
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Link (opcional)</label>
                                <input
                                    type="url"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full p-2 rounded-md bg-background border text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">URL da Imagem (opcional)</label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full p-2 rounded-md bg-background border text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Categoria (opcional)</label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="Ex: Eletrônicos"
                                    className="w-full p-2 rounded-md bg-background border"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Notas (opcional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Observações..."
                                    className="w-full p-2 rounded-md bg-background border text-sm"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 p-3 rounded-md border border-border hover:bg-secondary transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAdd}
                                    className="flex-1 p-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
