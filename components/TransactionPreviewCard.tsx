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
    onUpdate: (data: { amount?: string; type?: 'income' | 'expense'; date?: string; category?: string; installments?: number }) => void;
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
    onUpdate,
    children
}: TransactionPreviewCardProps) {
    // Estados de Edição
    const [isEditingAmount, setIsEditingAmount] = useState(false);
    const [isEditingDate, setIsEditingDate] = useState(false);
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [isEditingInstallments, setIsEditingInstallments] = useState(false);

    // Estados Temporários
    const [tempAmount, setTempAmount] = useState(amount);
    const [tempType, setTempType] = useState(type);
    const [tempDate, setTempDate] = useState(date || new Date().toISOString().split('T')[0]);
    const [searchCategory, setSearchCategory] = useState('');
    const [tempInstallments, setTempInstallments] = useState(installments);

    // Refs
    const amountInputRef = useRef<HTMLInputElement>(null);
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
            installmentsInputRef.current.select();
        }
    }, [isEditingInstallments]);

    // Sincronizar estados temporários com props
    useEffect(() => {
        setTempAmount(amount);
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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative overflow-visible"
        >
            {/* Card Principal */}
            {/* Card Principal */}
            {/* Card Principal */}
            <div className={`
                relative bg-gradient-to-br rounded-2xl p-3 md:p-6 shadow-2xl border-2 transition-all duration-300
                ${isIncome
                    ? 'from-green-500/10 to-green-600/5 border-green-500/30 hover:border-green-500/50'
                    : 'from-red-500/10 to-red-600/5 border-red-500/30 hover:border-red-500/50'
                }
            `}>
                {/* Seção 1: Valor (Grande e Destacado) */}
                <div className="mb-3 md:mb-6">
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
                            className="group w-full text-left transition-all hover:scale-105 active:scale-95"
                        >
                            <div className="flex items-center justify-between mb-1 md:mb-2">
                                <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Valor
                                </span>
                                {isIncome ? (
                                    <TrendingUp className="w-3 h-3 md:w-5 md:h-5 text-green-500" />
                                ) : (
                                    <TrendingDown className="w-3 h-3 md:w-5 md:h-5 text-red-500" />
                                )}
                            </div>

                            <div className={`
                                text-3xl md:text-5xl font-black tracking-tight transition-all
                                ${isIncome ? 'text-green-500 group-hover:text-green-400' : 'text-red-500 group-hover:text-red-400'}
                            `}>
                                {isIncome ? '+' : '-'} R$ {numericAmount.toFixed(2)}
                            </div>

                            <div className="mt-1 text-[10px] md:text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                Clique para editar
                            </div>
                        </button>
                    ) : (
                        <div className="animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                    Editando Valor
                                </span>
                                <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
                                    <button
                                        onClick={() => setTempType('income')}
                                        className={`p-1 rounded ${tempType === 'income' ? 'bg-green-500 text-white' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                    <button
                                        onClick={() => setTempType('expense')}
                                        className={`p-1 rounded ${tempType === 'expense' ? 'bg-red-500 text-white' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`text-xl md:text-3xl font-bold ${tempType === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                    R$
                                </span>
                                <input
                                    ref={amountInputRef}
                                    type="number"
                                    value={tempAmount}
                                    onChange={(e) => setTempAmount(e.target.value)}
                                    onKeyDown={handleKeyDownAmount}
                                    className={`
                                        w-full bg-transparent text-2xl md:text-4xl font-black outline-none border-b-2 transition-all
                                        ${tempType === 'income'
                                            ? 'text-green-500 border-green-500/30 focus:border-green-500'
                                            : 'text-red-500 border-red-500/30 focus:border-red-500'
                                        }
                                    `}
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => setIsEditingAmount(false)}
                                    className="p-1.5 md:p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                                <button
                                    onClick={handleSaveAmount}
                                    className="p-1.5 md:p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                >
                                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Divisor */}
                <div className="h-px bg-border/50 mb-3 md:mb-6" />

                {/* Seção 2: Descrição com Ícone */}
                <div className="mb-3 md:mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`
                            w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0
                            ${isIncome ? 'bg-green-500/20' : 'bg-red-500/20'}
                        `}>
                            <CategoryIcon className={`w-4 h-4 md:w-6 md:h-6 ${isIncome ? 'text-green-500' : 'text-red-500'}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm md:text-lg font-bold text-foreground truncate">
                                {description || 'Sem descrição'}
                            </h3>
                            <p className="text-[10px] md:text-sm text-muted-foreground">
                                {isIncome ? 'Entrada de dinheiro' : 'Saída de dinheiro'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Seção 3: Metadados (Data + Categoria + Parcelas) - Chips Clicáveis */}
                <div className="flex gap-2 flex-wrap relative">
                    {/* Chip de Data */}
                    {!isEditingDate ? (
                        <button
                            onClick={() => {
                                setTempDate(date || new Date().toISOString().split('T')[0]);
                                setIsEditingDate(true);
                                setIsEditingAmount(false);
                                setIsEditingCategory(false);
                                setIsEditingInstallments(false);
                            }}
                            className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-all hover:scale-105 active:scale-95 border border-border/50"
                        >
                            <Calendar className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <span className="text-sm font-medium text-foreground">
                                {formattedDate}
                            </span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                            <input
                                ref={dateInputRef}
                                type="date"
                                value={tempDate}
                                onChange={(e) => setTempDate(e.target.value)}
                                className="px-2 py-1.5 rounded-lg bg-background border border-primary/50 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                                onClick={() => handleSaveDate(new Date().toISOString().split('T')[0])}
                                className="px-2 py-1.5 rounded-lg bg-secondary text-xs font-medium hover:bg-secondary/80 transition-colors"
                                title="Hoje"
                            >
                                Hoje
                            </button>
                            <button
                                onClick={() => handleSaveDate(tempDate)}
                                className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Chip de Parcelas (Novo) */}
                    {type === 'expense' && (
                        !isEditingInstallments ? (
                            <button
                                onClick={() => {
                                    setTempInstallments(installments);
                                    setIsEditingInstallments(true);
                                    setIsEditingDate(false);
                                    setIsEditingAmount(false);
                                    setIsEditingCategory(false);
                                }}
                                className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-all hover:scale-105 active:scale-95 border border-border/50"
                                title="Parcelas"
                            >
                                <Layers className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                                    {installments}x
                                </span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                                <input
                                    ref={installmentsInputRef}
                                    type="number"
                                    min="1"
                                    max="48"
                                    value={tempInstallments}
                                    onChange={(e) => setTempInstallments(parseInt(e.target.value) || 1)}
                                    className="w-12 px-2 py-1.5 rounded-lg bg-background border border-primary/50 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-center"
                                />
                                <button
                                    onClick={handleSaveInstallments}
                                    className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    )}

                    {/* Chip de Categoria */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setIsEditingCategory(!isEditingCategory);
                                setIsEditingAmount(false);
                                setIsEditingDate(false);
                                setIsEditingInstallments(false);
                            }}
                            className={`
                                group flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105 active:scale-95 border
                                ${isIncome
                                    ? 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30'
                                    : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30'
                                }
                            `}
                        >
                            <Tag className={`w-4 h-4 ${isIncome ? 'text-green-500' : 'text-red-500'}`} />
                            <span className={`text-sm font-medium ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                                {category || 'Sem categoria'}
                            </span>
                        </button>

                        {/* Dropdown de Categorias */}
                        <AnimatePresence>
                            {isEditingCategory && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 mt-2 w-64 bg-card border rounded-xl shadow-xl z-50 overflow-hidden"
                                >
                                    <div className="p-2 border-b">
                                        <input
                                            ref={categoryInputRef}
                                            type="text"
                                            placeholder="Buscar categoria..."
                                            value={searchCategory}
                                            onChange={(e) => setSearchCategory(e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm bg-secondary/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="max-h-48 overflow-y-auto p-1">
                                        {filteredCategories.map((cat) => {
                                            const Icon = categoryIcons[cat];
                                            return (
                                                <button
                                                    key={cat}
                                                    onClick={() => handleSaveCategory(cat)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors text-left"
                                                >
                                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                                    <span>{cat}</span>
                                                </button>
                                            );
                                        })}

                                        {searchCategory && !filteredCategories.includes(searchCategory) && (
                                            <button
                                                onClick={() => handleSaveCategory(searchCategory)}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-primary/10 text-primary transition-colors text-left font-medium"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>Criar &quot;{searchCategory}&quot;</span>
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Efeito de Brilho no Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />

                {/* INJECTED CHILDREN (METHOD SELECTOR) */}
                {children && (
                    <div className="mt-6 pt-4 border-t border-white/10">
                        {children}
                    </div>
                )}
            </div>

            {/* Dica de Interatividade */}
            {!isEditingAmount && !isEditingDate && !isEditingCategory && !isEditingInstallments && !children && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-3 text-xs text-center text-muted-foreground"
                >
                    💡 Clique nos valores para editar
                </motion.p>
            )}
        </motion.div>
    );
}
