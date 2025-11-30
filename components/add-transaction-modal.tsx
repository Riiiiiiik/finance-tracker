'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { defaultCategories } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (transaction: {
        amount: number;
        description: string;
        category: string;
        type: 'income' | 'expense';
        date: string;
    }) => void;
}

export function AddTransactionModal({ isOpen, onClose, onAdd }: AddTransactionModalProps) {
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const categories = defaultCategories.filter(cat => cat.type === type);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || !description || !category) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        onAdd({
            amount: parseFloat(amount),
            description,
            category,
            type,
            date,
        });

        // Reset form
        setAmount('');
        setDescription('');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-card border border-border rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Nova Transação</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-accent rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type Toggle */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setType('expense');
                                setCategory('');
                            }}
                            className={cn(
                                "h-14 rounded-lg font-semibold transition-all",
                                type === 'expense'
                                    ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20"
                                    : "bg-secondary text-secondary-foreground"
                            )}
                        >
                            Despesa
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setType('income');
                                setCategory('');
                            }}
                            className={cn(
                                "h-14 rounded-lg font-semibold transition-all",
                                type === 'income'
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "bg-secondary text-secondary-foreground"
                            )}
                        >
                            Receita
                        </button>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Valor
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                R$
                            </span>
                            <Input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pl-12 text-lg"
                                placeholder="0,00"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Descrição
                        </label>
                        <Input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ex: Almoço no restaurante"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Categoria
                        </label>
                        <Select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="">Selecione uma categoria</option>
                            {categories.map((cat) => (
                                <option key={cat.name} value={cat.name}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Data
                        </label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <Button type="submit" className="w-full" size="lg">
                        <Plus className="w-5 h-5 mr-2" />
                        Adicionar Transação
                    </Button>
                </form>
            </div>
        </div>
    );
}
