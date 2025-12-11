'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    Tag,
    Utensils,
    Car,
    Home,
    Heart,
    GraduationCap,
    ShoppingBag,
    Smartphone,
    Briefcase,
    Plane,
    Coffee,
    Check,
    X,
    Plus,
    Layers
} from 'lucide-react';

interface TransactionPreviewCardProps {
    amount: string;
    description: string;
    type: 'income' | 'expense';
    category: string;
    date?: string;
    installments?: number;
    hideInstallments?: boolean; // New prop
    onUpdate: (data: { amount?: string; description?: string; type?: 'income' | 'expense'; date?: string; category?: string; installments?: number }) => void;
    children?: React.ReactNode;
}

// Mapeamento de categorias para ícones
const categoryIcons: Record<string, any> = {
    'Alimentação': Utensils,
    'Transporte': Car,
    'Moradia': Home,
    'Saúde': Heart,
    'Educação': GraduationCap,
    'Lazer': Coffee,
    'Compras': ShoppingBag,
    'Delivery': Utensils,
    'Streaming': Smartphone,
    'Salário': Briefcase,
    'Investimentos': TrendingUp,
    'Viagem': Plane,
};

export default function TransactionPreviewCard({
    amount,
    description,
    type,
    category,
    date,
    installments = 1,
    hideInstallments = false, // Default to false
    onUpdate,
    children
}: TransactionPreviewCardProps) {
    // Estados de Edição
    const [isEditingAmount, setIsEditingAmount] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [isEditingInstallments, setIsEditingInstallments] = useState(false);

    // Estados Temporários
    const [tempAmount, setTempAmount] = useState(amount);
    const [tempDescription, setTempDescription] = useState(description);
    const [tempType, setTempType] = useState(type);
    const [tempDate, setTempDate] = useState(date || new Date().toISOString().split('T')[0]);
    const [searchCategory, setSearchCategory] = useState('');
    const [tempInstallments, setTempInstallments] = useState(installments);

    // Refs
    const amountInputRef = useRef<HTMLInputElement>(null);
    const descriptionInputRef = useRef<HTMLInputElement>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const categoryInputRef = useRef<HTMLInputElement>(null);
    const installmentsInputRef = useRef<HTMLInputElement>(null);

    const isIncome = type === 'income';
    const numericAmount = parseFloat(amount) || 0;

    // Selecionar ícone da categoria
    const CategoryIcon = categoryIcons[category] || Tag;

    // Formatar data
    const formattedDate = date
        ? new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        : new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    // Focar no input quando abrir edição de valor
    useEffect(() => {
        if (isEditingAmount && amountInputRef.current) {
            amountInputRef.current.focus();
            amountInputRef.current.select();
        }
    }, [isEditingAmount]);

    // Focar no input quando abrir edição de descrição
    useEffect(() => {
        if (isEditingDescription && descriptionInputRef.current) {
            descriptionInputRef.current.focus();
            descriptionInputRef.current.select();
        }
    }, [isEditingDescription]);

    // Focar no input quando abrir edição de data
    useEffect(() => {
        if (isEditingDate && dateInputRef.current) {
            dateInputRef.current.focus();
        }
    }, [isEditingDate]);

    // Focar no input quando abrir edição de categoria
    useEffect(() => {
        if (isEditingCategory && categoryInputRef.current) {
            categoryInputRef.current.focus();
        }
    }, [isEditingCategory]);

    // Focar no input quando abrir edição de parcelas
    useEffect(() => {
        if (isEditingInstallments && installmentsInputRef.current) {
            installmentsInputRef.current.focus();
            // Select element doesn't have .select(), so we remove that call
        }
    }, [isEditingInstallments]);

    // Sincronizar estados temporários com props
    useEffect(() => {
        setTempAmount(amount);
        setTempDescription(description);
        setTempType(type);
        setTempDate(date || new Date().toISOString().split('T')[0]);
        setTempInstallments(installments);
    }, [amount, type, date, installments]);

    // Salvar Valor
    const handleSaveAmount = () => {
        if (!tempAmount || isNaN(parseFloat(tempAmount))) return;
        onUpdate({ amount: tempAmount, type: tempType });
        setIsEditingAmount(false);
    };

    // Salvar Descrição
    const handleSaveDescription = () => {
        if (!tempDescription.trim()) return;
        onUpdate({ description: tempDescription });
        setIsEditingDescription(false);
    };

    // Salvar Data
    const handleSaveDate = (newDate: string) => {
        onUpdate({ date: newDate });
        setIsEditingDate(false);
    };

    // Salvar Categoria
    const handleSaveCategory = (newCategory: string) => {
        onUpdate({ category: newCategory });
        setIsEditingCategory(false);
        setSearchCategory('');
    };

    // Salvar Parcelas
    const handleSaveInstallments = () => {
        if (tempInstallments < 1) setTempInstallments(1);
        onUpdate({ installments: tempInstallments });
        setIsEditingInstallments(false);
    };

    const handleKeyDownAmount = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSaveAmount();
        if (e.key === 'Escape') {
            setTempAmount(amount);
            setTempType(type);
            setIsEditingAmount(false);
        }
    };

    // Filtrar categorias
    const filteredCategories = Object.keys(categoryIcons).filter(cat =>
        cat.toLowerCase().includes(searchCategory.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative overflow-visible"
        >
            {/* Card Principal - STOIC / BRUTALIST VERSION */}
            <div className={`
                relative bg-[#09090b] rounded-lg p-3 md:p-5 shadow-2xl border transition-all duration-300
                ${isIncome
                    ? 'border-emerald-900/30' // Income stays subtle green but dark
                    : 'border-[#451a1a]' // Oxide/Terracotta for Expense
                }
            `}>
                {/* Header: Label + Amount */}
                <div className="mb-4">
                    {!isEditingAmount ? (
                        <button
                            onClick={() => {
                                setTempAmount(amount);
                                setTempType(type);
                                setIsEditingAmount(true);
                                setIsEditingDate(false);
                                setIsEditingCategory(false);
                                setIsEditingInstallments(false);
                            }}
                            className="group w-full text-left transition-all active:scale-98"
                        >
                            {/* Label: SAÍDA DE RECURSO */}
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono">
                                    {isIncome ? 'ENTRADA DE RECURSO' : 'SAÍDA DE RECURSO'}
                                </span>
                                {/* Icon is subtle or removed, maybe just a directional arrow */}
                                {isIncome ? (
                                    <span className="text-[10px] text-emerald-700 font-mono">↗ INFLOW</span>
                                ) : (
                                    <span className="text-[10px] text-[#7f2e2e] font-mono">↘ OUTFLOW</span>
                                )}
                            </div>

                            {/* Amount: Serif & Elegant */}
                            <div className={`
                                text-3xl md:text-5xl font-serif italic tracking-tight transition-all
                                ${isIncome ? 'text-emerald-500/90' : 'text-[#e0e0e0]'}
                            `}>
                                {isIncome ? '+' : '-'} R$ {numericAmount.toFixed(2).replace('.', ',')}
                            </div>
                        </button>
                    ) : (
                        // Editing Mode (Keep functional but style matches)
                        <div className="animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">ADJUSTING ALLOCATION</span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setTempType('income')}
                                        className={`px-2 py-0.5 text-[9px] font-mono border rounded-sm transition-all ${tempType === 'income'
                                            ? 'border-emerald-800 text-emerald-500 bg-emerald-900/20'
                                            : 'border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700'
                                            }`}
                                    >
                                        ENTRADA
                                    </button>
                                    <button
                                        onClick={() => setTempType('expense')}
                                        className={`px-2 py-0.5 text-[9px] font-mono border rounded-sm transition-all ${tempType === 'expense'
                                            ? 'border-[#5c2222] text-[#c24141] bg-[#2a0f0f]'
                                            : 'border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700'
                                            }`}
                                    >
                                        SAÍDA
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-2xl md:text-4xl font-serif italic ${tempType === 'income' ? 'text-emerald-700' : 'text-[#5c2222]'}`}>
                                    R$
                                </span>
                                <input
                                    ref={amountInputRef}
                                    type="number"
                                    value={tempAmount}
                                    onChange={(e) => setTempAmount(e.target.value)}
                                    onKeyDown={handleKeyDownAmount}
                                    className={`
                                        w-full bg-transparent text-2xl md:text-4xl font-serif italic outline-none border-b transition-all
                                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                                        ${tempType === 'income'
                                            ? 'text-emerald-500 border-emerald-900/50 focus:border-emerald-500'
                                            : 'text-[#e0e0e0] border-[#451a1a] focus:border-[#d4a8a8]'
                                        }
                                    `}
                                />
                                <div className="flex gap-1">
                                    <button onClick={() => setIsEditingAmount(false)} className="p-1.5 text-zinc-600 hover:text-zinc-300">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <button onClick={handleSaveAmount} className="p-1.5 text-emerald-600 hover:text-emerald-400">
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Metadata: Terminal Style Log */}
                <div className="space-y-1 mb-5">
                    {/* Alvo / Descrição */}
                    <div className="flex items-baseline gap-2 text-xs md:text-sm font-mono text-zinc-400">
                        <span className="text-zinc-600 select-none">{'>'} ALVO:</span>
                        {!isEditingDescription ? (
                            <button
                                onClick={() => setIsEditingDescription(true)}
                                className="text-zinc-300 font-bold truncate hover:text-zinc-100 transition-colors text-left"
                            >
                                {description || 'N/A'}
                            </button>
                        ) : (
                            <input
                                ref={descriptionInputRef}
                                type="text"
                                value={tempDescription}
                                onChange={(e) => setTempDescription(e.target.value)}
                                onBlur={handleSaveDescription}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveDescription()}
                                className="bg-transparent outline-none text-zinc-100 font-bold border-b border-zinc-700 focus:border-emerald-500 w-full"
                            />
                        )}
                    </div>

                    {/* Linha de Dados: Data | Categoria | Parcelas */}
                    <div className="flex flex-wrap items-baseline gap-3 text-[10px] md:text-xs font-mono text-zinc-500">
                        {/* DATA */}
                        <button
                            onClick={() => !isEditingDate && setIsEditingDate(true)}
                            className="hover:text-zinc-300 transition-colors text-left flex items-center gap-1"
                        >
                            <span className="text-zinc-700 select-none">{'>'} DATA:</span>
                            {isEditingDate ? (
                                <input
                                    autoFocus
                                    type="date"
                                    value={tempDate}
                                    onChange={(e) => {
                                        setTempDate(e.target.value);
                                        handleSaveDate(e.target.value);
                                    }}
                                    onBlur={() => setIsEditingDate(false)}
                                    className="bg-transparent outline-none w-20 text-zinc-200"
                                />
                            ) : formattedDate}
                        </button>

                        <span className="text-zinc-800">|</span>

                        {/* CATEGORIA */}
                        <div className="relative inline-block">
                            <button
                                onClick={() => setIsEditingCategory(!isEditingCategory)}
                                className="hover:text-zinc-300 transition-colors text-left flex items-center gap-1"
                            >
                                <span className="text-zinc-700 select-none">{'>'} CAT:</span>
                                <span className={isIncome ? 'text-emerald-700' : 'text-[#8b4343]'}>
                                    {category ? category.toUpperCase() : 'GERAL'}
                                </span>
                            </button>

                            {/* Compact Category Dropdown (Keep logic, update style) */}
                            <AnimatePresence>
                                {isEditingCategory && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute top-full left-0 mt-1 w-48 bg-[#09090b] border border-[#27272a] rounded-sm shadow-xl z-50 overflow-hidden"
                                    >
                                        <div className="max-h-32 overflow-y-auto p-0">
                                            {filteredCategories.map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => handleSaveCategory(cat)}
                                                    className="w-full px-3 py-2 text-[10px] font-mono hover:bg-[#27272a] text-zinc-400 hover:text-zinc-100 transition-colors text-left truncate border-b border-[#18181b] last:border-0"
                                                >
                                                    {cat.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {type === 'expense' && !hideInstallments && (
                            <>
                                <span className="text-zinc-800">|</span>
                                <button
                                    onClick={() => setIsEditingInstallments(true)}
                                    className="hover:text-zinc-300 transition-colors text-left flex items-center gap-1"
                                >
                                    <span className="text-zinc-700 select-none">{'>'} PARC:</span>
                                    {isEditingInstallments ? (
                                        <div className="flex items-center gap-1 bg-[#09090b] rounded-sm border-b border-zinc-700">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newVal = Math.max(1, tempInstallments - 1);
                                                    setTempInstallments(newVal);
                                                    onUpdate({ installments: newVal });
                                                }}
                                                className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-zinc-200 active:scale-95 transition-all text-[10px]"
                                            >
                                                -
                                            </button>

                                            <input
                                                ref={installmentsInputRef}
                                                type="text"
                                                inputMode="none"
                                                pattern="[0-9]*"
                                                value={tempInstallments}
                                                readOnly
                                                className="bg-transparent outline-none w-6 text-center text-zinc-200 text-xs font-mono cursor-default select-none"
                                            />

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newVal = Math.min(18, tempInstallments + 1);
                                                    setTempInstallments(newVal);
                                                    onUpdate({ installments: newVal });
                                                }}
                                                className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-zinc-200 active:scale-95 transition-all text-[10px]"
                                            >
                                                +
                                            </button>

                                            <span className="text-[8px] text-zinc-600 mr-1">x</span>
                                        </div>
                                    ) : (
                                        <span className="text-zinc-400">{installments > 1 ? `${installments}x` : '1x'}</span>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* INJECTED CHILDREN (METHOD SELECTOR / BUTTON) */}
                {children && (
                    <div className="mt-2 pt-2 border-t border-[#18181b]">
                        {children}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
