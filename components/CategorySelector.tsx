'use client';

import { useState, useEffect } from 'react';
import { supabase, Category } from '@/lib/supabase';
import { Plus, X, Trash2 } from 'lucide-react';

interface CategorySelectorProps {
    selectedCategory: string;
    onSelect: (category: string) => void;
}

const DEFAULT_CATEGORIES = [
    'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Delivery', 'Streaming', 'Salário', 'Investimentos'
];

export default function CategorySelector({ selectedCategory, onSelect }: CategorySelectorProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', session.user.id);

            if (data) setCategories(data);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            alert('Digite um nome para a categoria');
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert('Você precisa estar logado');
            return;
        }

        const { data, error } = await supabase
            .from('categories')
            .insert([{ name: newCategoryName.trim(), user_id: session.user.id }])
            .select()
            .single();

        if (error) {
            console.error('Erro ao adicionar categoria:', error);
            alert(`Erro: ${error.message}\n\nVerifique se você executou o SQL no Supabase!`);
            return;
        }

        if (data) {
            setCategories([...categories, data]);
            onSelect(data.name);
            setNewCategoryName('');
            setShowAddModal(false);
        }
    };

    const handleDeleteCategory = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (deletingId === id) {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (!error) {
                setCategories(categories.filter(c => c.id !== id));
                if (selectedCategory === categories.find(c => c.id === id)?.name) {
                    onSelect('');
                }
            }
            setDeletingId(null);
        } else {
            setDeletingId(id);
            setTimeout(() => setDeletingId(null), 3000);
        }
    };

    return (
        <>
            <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Categoria</label>

                <div className="flex flex-wrap gap-2">
                    {/* Categorias Padrão */}
                    {DEFAULT_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => onSelect(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 border ${selectedCategory === cat
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}

                    {/* Categorias Personalizadas */}
                    {categories.map(cat => (
                        <div key={cat.id} className="relative">
                            <button
                                type="button"
                                onClick={() => onSelect(cat.name)}
                                className={`px-3 py-1.5 pr-8 rounded-full text-xs font-medium transition-all active:scale-95 border ${selectedCategory === cat.name
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80'
                                    }`}
                            >
                                {cat.name}
                            </button>
                            <button
                                type="button"
                                onClick={(e) => handleDeleteCategory(cat.id, e)}
                                className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all ${deletingId === cat.id
                                    ? 'bg-red-500 text-white'
                                    : 'hover:bg-red-500/20 text-red-500'
                                    }`}
                                title={deletingId === cat.id ? 'Clique novamente para confirmar' : 'Excluir categoria'}
                            >
                                {deletingId === cat.id ? <X className="w-3 h-3" /> : <Trash2 className="w-3 h-3" />}
                            </button>
                        </div>
                    ))}

                    {/* Botão Adicionar */}
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-muted-foreground/50 text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center gap-1 active:scale-95"
                    >
                        <Plus className="w-3 h-3" />
                        Nova
                    </button>
                </div>

                {deletingId && (
                    <p className="text-xs text-red-500 animate-pulse">
                        Clique novamente no ícone de lixeira para confirmar a exclusão
                    </p>
                )}
            </div>

            {/* Modal de Adicionar Categoria */}
            {showAddModal && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        className="bg-card border rounded-xl p-6 w-full max-w-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">Nova Categoria</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-1 hover:bg-secondary rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Nome da Categoria</label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Ex: Streaming, Academia..."
                                    className="w-full p-3 rounded-md bg-secondary border border-input"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 p-3 rounded-md border border-border hover:bg-secondary transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    className="flex-1 p-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                                >
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
