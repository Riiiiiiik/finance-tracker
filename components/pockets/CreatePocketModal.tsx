'use client';

import { useState, useEffect } from 'react';
import { supabase, Pocket } from '@/lib/supabase';
import { X, Wallet, Zap, Coffee, Car, ShoppingBag, Utensils, Repeat, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSentry } from '@/lib/sentry-context';

interface CreatePocketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
    initialData?: Pocket | null;
}

export default function CreatePocketModal({ isOpen, onClose, onCreated, initialData }: CreatePocketModalProps) {
    const { user } = useAuth();
    const { notifyError } = useSentry();
    const [loading, setLoading] = useState(false);

    // Form States
    const [amount, setAmount] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('food');
    const [isRecurring, setIsRecurring] = useState(true);
    const [customName, setCustomName] = useState('');

    useEffect(() => {
        if (initialData) {
            setAmount(initialData.goal_amount.toString());
            setSelectedIcon(initialData.icon || 'food');
            setIsRecurring(initialData.renewal_cycle === 'monthly');
            setCustomName(initialData.name);
        } else {
            // Reset form when opening for creation
            setAmount('');
            setSelectedIcon('food');
            setIsRecurring(true);
            setCustomName('');
        }
    }, [initialData, isOpen]);

    // Presets para agilidade (O Pocket é rápido!)
    const presets = [
        { id: 'food', label: 'iFood/Mercado', icon: <Utensils size={20} /> },
        { id: 'transport', label: 'Uber/Combust.', icon: <Car size={20} /> },
        { id: 'leisure', label: 'Lazer/Fim de Sem.', icon: <Coffee size={20} /> },
        { id: 'shopping', label: 'Compras Rápidas', icon: <ShoppingBag size={20} /> },
    ];

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!user || !amount) return;

        setLoading(true);
        try {
            // Determine name: Custom Name OR Label from selected preset
            const presetLabel = presets.find(p => p.id === selectedIcon)?.label || 'Pocket';
            const finalName = customName.trim() || presetLabel;

            const pocketData = {
                user_id: user.id,
                name: finalName,
                goal_amount: parseFloat(amount.replace(',', '.')),
                renewal_cycle: isRecurring ? 'monthly' : 'one-off',
                icon: selectedIcon,
                color: 'yellow' // Gold standard
            };

            let error;

            if (initialData) {
                // Update existing pocket
                const newGoal = parseFloat(amount.replace(',', '.'));
                const goalDiff = newGoal - initialData.goal_amount;

                const updatePayload: any = { ...pocketData };

                // If limit changed, update balance by the same delta to preserve "amount spent" logic
                if (goalDiff !== 0) {
                    updatePayload.current_balance = initialData.current_balance + goalDiff;
                }

                const { error: updateError } = await supabase
                    .from('pockets')
                    .update(updatePayload)
                    .eq('id', initialData.id);
                error = updateError;
            } else {
                // Create new pocket
                const { error: insertError } = await supabase
                    .from('pockets')
                    .insert({
                        ...pocketData,
                        current_balance: pocketData.goal_amount // Initialize with full budget available
                    });
                error = insertError;
            }

            if (error) throw error;
            onCreated();
            onClose();

            // Clear form
            if (!initialData) {
                setAmount('');
                setCustomName('');
                setIsRecurring(true);
                setSelectedIcon('food');
            }
        } catch (error) {
            console.error('Error saving pocket:', error);
            notifyError(`Erro ao salvar pocket: ${(error as any).message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in zoom-in-95 duration-200">

            {/* O Card Tático */}
            <div className="bg-[#121212] w-full max-w-sm rounded-3xl border border-[#333] shadow-[0_0_60px_rgba(255,214,89,0.1)] overflow-hidden">

                {/* Header Compacto */}
                <div className="px-6 pt-6 flex justify-between items-center">
                    <h2 className="text-white font-bold text-lg flex items-center gap-2">
                        <span className="bg-[#FFD659] text-black p-1 rounded-md"><Wallet size={16} /></span>
                        {initialData ? 'Editar Pocket' : 'Novo Pocket'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors bg-[#222] p-2 rounded-full">
                        <X size={18} />
                    </button>
                </div>

                {/* ÁREA CENTRAL: VALOR (O Protagonista) */}
                <div className="py-8 text-center relative">
                    <p className="text-[#FFD659] text-xs font-bold uppercase tracking-widest mb-2">Teto de Gastos</p>
                    <div className="flex justify-center items-center gap-1 text-white">
                        <span className="text-2xl text-gray-500 font-medium mt-2">R$</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="bg-transparent text-6xl font-bold w-48 text-center outline-none placeholder:text-gray-800 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            autoFocus
                        />
                    </div>
                    {/* Aviso visual de recorrência */}
                    {isRecurring && (
                        <div className="absolute bottom-2 left-0 w-full flex justify-center">
                            <span className="bg-[#222] text-gray-400 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#333]">
                                <Repeat size={10} /> Renova mensalmente
                            </span>
                        </div>
                    )}
                </div>

                {/* SELEÇÃO RÁPIDA (Grid) */}
                <div className="bg-[#1A1A1A] p-6 rounded-t-3xl border-t border-[#333]">

                    <label className="text-gray-500 text-xs font-bold uppercase mb-4 block">Para que serve este bolso?</label>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {presets.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedIcon(p.id)}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedIcon === p.id
                                    ? 'bg-[#FFD659] border-[#FFD659] text-black shadow-[0_0_15px_rgba(255,214,89,0.4)]'
                                    : 'bg-[#09090B] border-[#333] text-gray-400 hover:bg-[#222]'
                                    }`}
                            >
                                {p.icon}
                                <span className="text-sm font-bold">{p.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Configurações Extras (Nome e Recorrência) */}
                    <div className="space-y-4">
                        <div className="bg-[#09090B] p-3 rounded-xl border border-[#333] flex items-center gap-3">
                            <Zap size={18} className="text-[#FFD659]" />
                            <input
                                type="text"
                                value={customName}
                                onChange={(e) => setCustomName(e.target.value)}
                                placeholder="Nome personalizado (Opcional)"
                                className="bg-transparent text-sm text-white w-full outline-none placeholder:text-gray-600"
                            />
                        </div>

                        {/* Toggle de Recorrência */}
                        <div className="flex items-center justify-between p-1">
                            <span className="text-xs text-gray-400 font-medium">Renovar saldo todo mês?</span>
                            <button
                                onClick={() => setIsRecurring(!isRecurring)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${isRecurring ? 'bg-[#FFD659]' : 'bg-[#333]'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isRecurring ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                    </div>

                    {/* BOTÃO FINAL */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full mt-6 bg-[#FFD659] hover:bg-[#ECC652] text-black font-extrabold text-lg py-4 rounded-xl shadow-[0_5px_20px_rgba(255,214,89,0.2)] transition-all transform active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={24} className="animate-spin" /> : (initialData ? 'Salvar Alterações' : 'Criar Pocket')}
                    </button>

                </div>
            </div>
        </div>
    );
}
