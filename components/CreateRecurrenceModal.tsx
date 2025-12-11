'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Calendar, DollarSign, Repeat } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { checkAndGenerateRecurrences } from '@/lib/recurrence';

interface CreateRecurrenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onComplete: () => void;
}

export default function CreateRecurrenceModal({ isOpen, onClose, userId, onComplete }: CreateRecurrenceModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        type: 'expense',
        category: 'Outros',
        frequency: 'monthly',
        due_day: '5',
        start_date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create Recurrence Rule
            const { error } = await supabase.from('recurrences').insert({
                user_id: userId,
                name: formData.name,
                amount: parseFloat(formData.amount),
                type: formData.type,
                category: formData.category,
                frequency: formData.frequency,
                due_day: parseInt(formData.due_day),
                start_date: formData.start_date,
                active: true
            });

            if (error) throw error;

            // 2. Force Generation Check Immediately
            await checkAndGenerateRecurrences(userId);

            onComplete();
            onClose();
        } catch (error) {
            console.error('Error creating recurrence:', error);
            alert('Erro ao criar recorrência');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-[10%] bottom-auto max-w-md mx-auto bg-[#09090B] border border-white/10 rounded-2xl z-50 p-6 shadow-2xl overflow-y-auto max-h-[85vh]"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Repeat className="w-5 h-5 text-emerald-500" />
                                Nova Recorrência
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Nome</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Netflix, Aluguel..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-emerald-500 transition-colors"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Valor</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-9 outline-none focus:border-emerald-500 transition-colors"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Tipo</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-emerald-500 appearance-none"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="expense">Despesa</option>
                                        <option value="income">Receita</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Frequência</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-emerald-500 appearance-none"
                                        value={formData.frequency}
                                        onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                                    >
                                        <option value="monthly">Mensal</option>
                                        <option value="weekly">Semanal</option>
                                        <option value="yearly">Anual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Dia Venc.</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-emerald-500 transition-colors"
                                        value={formData.due_day}
                                        onChange={e => setFormData({ ...formData, due_day: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">Categoria</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-emerald-500 appearance-none"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Moradia">Moradia</option>
                                    <option value="Assinaturas">Assinaturas</option>
                                    <option value="Alimentação">Alimentação</option>
                                    <option value="Transporte">Transporte</option>
                                    <option value="Saúde">Saúde</option>
                                    <option value="Lazer">Lazer</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold p-4 rounded-xl flex items-center justify-center gap-2 mt-4 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                Criar Regra
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
