'use client';

import { useEffect, useState } from 'react';
import { supabase, Pocket } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import PocketCard from '@/components/pockets/PocketCard';
import CreatePocketModal from '@/components/pockets/CreatePocketModal';
import { useSentry } from '@/lib/sentry-context';

export default function PocketsPage() {
    const { user } = useAuth();
    const { notifyError, confirmAction } = useSentry();
    const [pockets, setPockets] = useState<Pocket[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPocket, setEditingPocket] = useState<Pocket | null>(null);

    const fetchPockets = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('pockets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPockets(data || []);
        } catch (error) {
            console.error('Error fetching pockets:', error);
            notifyError('Erro ao carregar pockets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPockets();
    }, [user]); // eslint-disable-line react-hooks/exhaustive-deps


    const handleAddMoney = (amount: number) => {
        // Implement logic to add money to a pocket
        console.log('Adding money:', amount);
    };

    const handleDeletePocket = async (pocket: Pocket) => {
        const confirmed = await confirmAction({
            title: 'Protocolo de Exclusão',
            message: `Tem certeza que deseja dissolver o pocket "${pocket.name}"? Esta ação é irreversível e os fundos alocados precisarão ser redistribuídos.`,
            confirmText: 'Confirmar Dissolução',
            cancelText: 'Abortar',
            variant: 'danger'
        });

        if (!confirmed) return;

        try {
            const { error } = await supabase
                .from('pockets')
                .delete()
                .eq('id', pocket.id);

            if (error) throw error;
            fetchPockets();
        } catch (error) {
            console.error('Error deleting pocket:', error);
            notifyError(`Falha na dissolução do pocket: ${(error as any).message}`);
        }
    };

    const handleEditPocket = (pocket: Pocket) => {
        setEditingPocket(pocket);
        setIsCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setEditingPocket(null);
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24">
            <div className="p-4">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold">Monk.Pockets</h1>
                </header>

                <div className="grid gap-4">
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Carregando...
                        </div>
                    ) : pockets.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                            <p className="text-muted-foreground mb-4">Nenhum pocket criado ainda</p>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="text-yellow-500 font-semibold hover:underline"
                            >
                                Criar meu primeiro pocket
                            </button>
                        </div>
                    ) : (
                        pockets.map((pocket) => (
                            <PocketCard
                                key={pocket.id}
                                pocket={pocket}
                                onAddMoney={handleAddMoney}
                                onEdit={handleEditPocket}
                                onDelete={handleDeletePocket}
                            />
                        ))
                    )}
                </div>
            </div>

            <button
                onClick={() => setIsCreateModalOpen(true)}
                className="fixed bottom-24 right-4 w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-400 transition-colors z-40"
            >
                <Plus className="w-8 h-8 text-black" />
            </button>

            <CreatePocketModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseModal}
                onCreated={fetchPockets}
                initialData={editingPocket}
            />


        </div>
    );
}
