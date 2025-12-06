'use client';

import { useState, useEffect } from 'react';
import { supabase, WishlistItem } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Gift, Plus, Trash2, ExternalLink, Check, X, CheckCircle2, Clock, Ban, DollarSign, Link as LinkIcon, Image as ImageIcon, Tag, FileText, List, AlertCircle, ChevronDown, Sparkles, Rocket, Target, Star } from 'lucide-react';
import { usePrivacy } from '@/lib/privacy-context';
import { useCountdown } from '@/hooks/useCountdown';
import { motion, useAnimation, PanInfo, AnimatePresence } from 'framer-motion';
import MonkIcon, { monkColors } from '@/components/MonkIcon';
import ReflectionModal from '@/components/ReflectionModal';

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
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [showReflectionModal, setShowReflectionModal] = useState(false);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setLoading(false);
                router.push('/login');
                return;
            }
            loadWishlist(session.user.id);
            loadPurchasedItems(session.user.id);
            loadBalance(session.user.id);
        } catch (error) {
            console.error('Erro ao verificar sessão:', error);
            setLoading(false);
        }
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
        // Limpar formatação do preço (R$ 1.500,00 -> 1500.00)
        const cleanPrice = price.replace(/[^\d,]/g, '').replace(',', '.');
        const priceNumber = parseFloat(cleanPrice);

        if (!name || isNaN(priceNumber) || priceNumber <= 0) {
            alert('Nome e preço válido são obrigatórios');
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
            .from('wishlist_items')
            .insert([{
                user_id: session.user.id,
                name,
                price: priceNumber,
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
            setShowReflectionModal(true);
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
    const totalWishlistCost = items.reduce((acc, item) => acc + item.price, 0);
    const materializedPercent = totalWishlistCost > 0 ? Math.min(Math.max((balance / totalWishlistCost) * 100, 0), 100) : 0;

    return (
        <div className="min-h-screen pb-24 max-w-md mx-auto bg-background selection:bg-blue-500/30 font-sans relative">
            {/* Efeito de Fundo (Nebulosa Azul - Mais sutil) */}
            <div className="fixed top-0 right-0 w-full h-96 bg-[#6CA8FF] opacity-[0.03] blur-[120px] pointer-events-none z-0"></div>

            {/* Header Padronizado */}
            <header className="flex justify-between items-center p-6 bg-transparent relative z-10">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">Monk.Wish</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium flex items-center gap-2">
                            <Sparkles size={10} className="text-[#6CA8FF]" />
                            Visualizando o Futuro
                        </p>
                    </div>
                </div>

                {activeTab === 'active' && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#6CA8FF] hover:bg-[#5b95e8] text-[#09090B] p-2 rounded-full transition-all shadow-[0_0_15px_rgba(108,168,255,0.3)]"
                    >
                        <Plus size={20} strokeWidth={3} />
                    </button>
                )}
            </header>

            <main className="px-4 space-y-6 relative z-10">
                {/* HUD DE PROGRESSO GLOBAL */}
                {activeTab === 'active' && (
                    <div className="bg-card rounded-xl p-4 border border-border relative overflow-hidden">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">Potencial de Conquista</span>
                                <div className={`text-2xl font-mono font-bold text-foreground ${isPrivacyMode ? 'blur-md' : ''}`}>
                                    R$ {totalWishlistCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[#6CA8FF] text-xl font-bold">{materializedPercent.toFixed(0)}%</span>
                                <span className="text-muted-foreground text-[10px] block uppercase">Materializado</span>
                            </div>
                        </div>
                        {/* Barra de Progresso Neon */}
                        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#6CA8FF] transition-all duration-1000 ease-out shadow-[0_0_10px_#6CA8FF]"
                                style={{ width: `${materializedPercent}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 bg-card p-1 rounded-xl border border-border">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'active'
                            ? 'bg-[#6CA8FF]/10 text-[#6CA8FF] border border-[#6CA8FF]/30'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        🚀 Em Foco ({items.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'history'
                            ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        🏆 Conquistados ({purchasedItems.length})
                    </button>
                </div>

                {/* Items List */}
                {currentItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center relative">
                        {activeTab === 'active' ? (
                            <>
                                {/* Ícone Conceitual (Blueprint/Alvo) */}
                                <div className="relative mb-6 group">
                                    <div className="absolute inset-0 bg-[#6CA8FF] blur-2xl opacity-10 rounded-full"></div>
                                    <div className="bg-card p-6 rounded-full border border-dashed border-[#6CA8FF]/40 relative">
                                        <Rocket size={48} className="text-[#6CA8FF] opacity-80" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-2">O Horizonte está Vazio</h3>
                                <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-8">
                                    O Visionário aguarda suas ordens. <br />
                                    Adicione um item para começar a <span className="text-[#6CA8FF]">materializar</span> seus desejos.
                                </p>

                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex items-center gap-2 px-6 py-3 border border-[#6CA8FF]/30 rounded-full text-[#6CA8FF] hover:bg-[#6CA8FF]/10 transition-all font-medium text-sm"
                                >
                                    <Target size={16} />
                                    Definir Primeira Meta
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="bg-card p-6 rounded-full border border-border mb-4">
                                    <CheckCircle2 className="w-12 h-12 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-bold mb-1">Nenhuma Conquista Ainda</p>
                                <p className="text-xs text-muted-foreground">Suas vitórias serão celebradas aqui.</p>
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
            </main>

            {/* Add Modal */}
            {showAddModal && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-4 transition-all duration-300"
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="bg-[#161616] border border-[#333] rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-10 fade-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-xl flex items-center gap-2 text-white">
                                <Plus className="w-5 h-5 text-[#6CA8FF]" />
                                Definir Nova Visão
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-[#333] rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            {/* Nome */}
                            <div className="relative group">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Nome do Sonho *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Tag className="h-5 w-5 text-gray-500 group-focus-within:text-[#6CA8FF] transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Novo Setup, Viagem..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#09090B] border border-[#333] text-white focus:border-[#6CA8FF] focus:ring-2 focus:ring-[#6CA8FF]/20 outline-none transition-all font-medium placeholder-gray-700"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Preço com Máscara */}
                            <div className="relative group">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Custo de Materialização *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign className="h-5 w-5 text-gray-500 group-focus-within:text-[#6CA8FF] transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={price}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            if (!value) {
                                                setPrice('');
                                                return;
                                            }
                                            const floatValue = parseFloat(value) / 100;
                                            setPrice(floatValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
                                        }}
                                        placeholder="R$ 0,00"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#09090B] border border-[#333] text-white focus:border-[#6CA8FF] focus:ring-2 focus:ring-[#6CA8FF]/20 outline-none transition-all font-bold text-lg tracking-wide placeholder-gray-700"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Prioridade */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Prioridade</label>
                                <div className="flex gap-2 p-1 bg-[#09090B] rounded-xl border border-[#333]">
                                    <button
                                        type="button"
                                        onClick={() => setPriority('high')}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${priority === 'high' ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'text-gray-500 hover:text-white'
                                            }`}
                                    >
                                        🔴 Alta
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPriority('medium')}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 'text-gray-500 hover:text-white'
                                            }`}
                                    >
                                        🟡 Média
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPriority('low')}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${priority === 'low' ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'text-gray-500 hover:text-white'
                                            }`}
                                    >
                                        🟢 Baixa
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-[#333] my-2" />

                            {/* Categoria Select Customizado */}
                            <div className="relative group z-20">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Categoria</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <List className="h-5 w-5 text-gray-500 group-focus-within:text-[#6CA8FF] transition-colors" />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#09090B] border border-[#333] text-white focus:border-[#6CA8FF] focus:ring-2 focus:ring-[#6CA8FF]/20 outline-none transition-all text-left flex items-center justify-between"
                                    >
                                        <span className={category ? 'text-white' : 'text-gray-700 font-medium'}>
                                            {category || "Selecione uma categoria..."}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isCategoryOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-[#161616] border border-[#333] rounded-xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto"
                                            >
                                                {[
                                                    { value: "Eletrônicos", label: "📱 Eletrônicos" },
                                                    { value: "Casa", label: "🏠 Casa" },
                                                    { value: "Vestuário", label: "👕 Vestuário" },
                                                    { value: "Lazer", label: "🎮 Lazer" },
                                                    { value: "Saúde", label: "💊 Saúde" },
                                                    { value: "Educação", label: "📚 Educação" },
                                                    { value: "Viagem", label: "✈️ Viagem" },
                                                    { value: "Outros", label: "📦 Outros" }
                                                ].map((option) => (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => {
                                                            setCategory(option.value);
                                                            setIsCategoryOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-[#333] transition-colors flex items-center gap-2 ${category === option.value ? 'text-[#6CA8FF] font-bold bg-[#6CA8FF]/10' : 'text-gray-400'
                                                            }`}
                                                    >
                                                        {option.label}
                                                        {category === option.value && <Check className="w-4 h-4 ml-auto" />}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Link e Imagem Agrupados */}
                            <div className="grid grid-cols-1 gap-4">
                                {/* Link */}
                                <div className="relative group">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Link de Referência</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <LinkIcon className="h-5 w-5 text-gray-500 group-focus-within:text-[#6CA8FF] transition-colors" />
                                        </div>
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#09090B] border border-[#333] text-white focus:border-[#6CA8FF] focus:ring-2 focus:ring-[#6CA8FF]/20 outline-none transition-all text-sm placeholder-gray-700"
                                        />
                                    </div>
                                </div>

                                {/* URL da Imagem */}
                                <div className="relative group">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Inspiração Visual (URL)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <ImageIcon className="h-5 w-5 text-gray-500 group-focus-within:text-[#6CA8FF] transition-colors" />
                                        </div>
                                        <input
                                            type="url"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#09090B] border border-[#333] text-white focus:border-[#6CA8FF] focus:ring-2 focus:ring-[#6CA8FF]/20 outline-none transition-all text-sm placeholder-gray-700"
                                        />
                                    </div>

                                    {imageUrl && (
                                        <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-[#333] bg-[#09090B] flex items-center justify-center">
                                            <img
                                                src={imageUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notas */}
                            <div className="relative group">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block ml-1">Manifesto (Notas)</label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <FileText className="h-5 w-5 text-gray-500 group-focus-within:text-[#6CA8FF] transition-colors" />
                                    </div>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Por que este sonho é importante..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#09090B] border border-[#333] text-white focus:border-[#6CA8FF] focus:ring-2 focus:ring-[#6CA8FF]/20 outline-none transition-all text-sm min-h-[80px] placeholder-gray-700"
                                    />
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3.5 rounded-xl border border-[#333] text-gray-400 hover:bg-[#333] hover:text-white font-medium transition-all active:scale-95"
                                >
                                    Descartar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAdd}
                                    className="flex-1 py-3.5 rounded-xl bg-[#6CA8FF] text-[#09090B] hover:bg-[#5b95e8] font-bold shadow-[0_0_20px_rgba(108,168,255,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Materializar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ReflectionModal
                isOpen={showReflectionModal}
                onClose={() => setShowReflectionModal(false)}
            />
        </div>
    );
}
