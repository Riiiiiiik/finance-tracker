'use client';

import { X, CreditCard, Landmark, Wallet, Bitcoin, Calendar, DollarSign, ShieldCheck, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (account: {
        name: string;
        type: 'checking' | 'credit' | 'wallet' | 'crypto' | 'investment';
        color: string;
        limit?: number;
        closingDay?: number;
        dueDay?: number;
    }) => Promise<void>;
}

export default function NewAccountModal({ isOpen, onClose, onSave }: NewAccountModalProps) {
    const [accountType, setAccountType] = useState<'checking' | 'credit' | 'wallet' | 'crypto' | 'investment'>('checking');
    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');
    const [limit, setLimit] = useState('');
    const [closingDay, setClosingDay] = useState('');
    const [dueDay, setDueDay] = useState('');
    const [selectedColor, setSelectedColor] = useState('#10B981');
    const [loading, setLoading] = useState(false);

    // Reset form on open
    useEffect(() => {
        if (isOpen) {
            setAccountType('checking');
            setName('');
            setBalance('');
            setLimit('');
            setClosingDay('');
            setDueDay('');
            setSelectedColor('#10B981');
            setLoading(false);
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!name) return;
        setLoading(true);
        try {
            await onSave({
                name,
                type: accountType,
                color: selectedColor,
                limit: accountType === 'credit' ? Number(limit) : undefined,
                closingDay: accountType === 'credit' ? Number(closingDay) : undefined,
                dueDay: accountType === 'credit' ? Number(dueDay) : undefined,
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Tipos de Conta com Ícones
    const types = [
        { id: 'checking', label: 'Conta Corrente', icon: <Landmark size={18} /> },
        { id: 'credit', label: 'Cartão Crédito', icon: <CreditCard size={18} /> },
        { id: 'wallet', label: 'Dinheiro/Carteira', icon: <Wallet size={18} /> },
        { id: 'investment', label: 'Investimentos', icon: <Bitcoin size={18} /> },
    ];

    const colors = ['#10B981', '#3F68FF', '#FF4B4B', '#FFD659', '#8B5CF6', '#EC4899', '#F97316', '#FFFFFF'];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-[#09090B] w-full max-w-md rounded-2xl border border-[#333] shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden flex flex-col relative z-10"
                >

                    {/* HEADER TÉCNICO */}
                    <div className="px-6 pt-6 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck size={16} className="text-[#10B981]" />
                                <span className="text-[#10B981] font-bold text-xs uppercase tracking-widest">Monk.Vault</span>
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Novo Ativo</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* BODY */}
                    <div className="p-6 space-y-6">

                        {/* 1. SELETOR DE TIPO (Visual) */}
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Classificação do Canal</label>
                            <div className="grid grid-cols-2 gap-2">
                                {types.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setAccountType(type.id as any)}
                                        className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-bold transition-all ${accountType === type.id
                                            ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981]'
                                            : 'bg-[#161616] border-[#333] text-gray-400 hover:border-gray-500'
                                            }`}
                                    >
                                        {type.icon} {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. IDENTIFICAÇÃO */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Identificador (Nome)</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Nubank Principal, Cofre..."
                                className="w-full bg-[#161616] border border-[#333] text-white rounded-lg p-3 focus:border-[#10B981] focus:outline-none transition-colors placeholder:text-gray-700 text-sm font-medium"
                            />
                        </div>

                        {/* 3. CAMPOS DINÂMICOS (Só aparecem se for Crédito) */}
                        {accountType === 'credit' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-4 border-l-2 border-[#10B981]/30 pl-4 py-1"
                            >

                                {/* Limite */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] text-[#10B981] font-bold uppercase tracking-widest">Teto Operacional (Limite)</label>
                                    <div className="relative">
                                        <DollarSign size={14} className="absolute left-3 top-3.5 text-[#10B981]" />
                                        <input
                                            type="number"
                                            value={limit}
                                            onChange={(e) => setLimit(e.target.value)}
                                            placeholder="0,00"
                                            className="w-full bg-[#161616] border border-[#333] text-white rounded-lg p-3 pl-9 focus:border-[#10B981] focus:outline-none font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Datas */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Fechamento</label>
                                        <div className="relative">
                                            <Calendar size={14} className="absolute left-3 top-3.5 text-gray-500" />
                                            <input
                                                type="number"
                                                value={closingDay}
                                                onChange={(e) => setClosingDay(e.target.value)}
                                                placeholder="Dia"
                                                max={31}
                                                className="w-full bg-[#161616] border border-[#333] text-white rounded-lg p-3 pl-9 focus:border-[#10B981] outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Vencimento</label>
                                        <div className="relative">
                                            <Calendar size={14} className="absolute left-3 top-3.5 text-gray-500" />
                                            <input
                                                type="number"
                                                value={dueDay}
                                                onChange={(e) => setDueDay(e.target.value)}
                                                placeholder="Dia"
                                                max={31}
                                                className="w-full bg-[#161616] border border-[#333] text-white rounded-lg p-3 pl-9 focus:border-[#10B981] outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 4. SELETOR DE COR (Limpo) */}
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Marcador Visual</label>
                            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center shrink-0 ${selectedColor === color ? 'scale-110 border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                        style={{ backgroundColor: color }}
                                    >
                                        {selectedColor === color && <Check size={12} className={color === '#FFFFFF' ? 'text-black' : 'text-white'} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* FOOTER */}
                    <div className="p-6 pt-0">
                        <button
                            onClick={handleSave}
                            disabled={loading || !name}
                            className="w-full py-4 rounded-xl bg-[#10B981] hover:bg-[#0fa372] text-[#09090B] font-bold text-sm uppercase tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span>Processando...</span>
                            ) : (
                                <>
                                    <ShieldCheck size={18} />
                                    Integrar ao Vault
                                </>
                            )}
                        </button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}
