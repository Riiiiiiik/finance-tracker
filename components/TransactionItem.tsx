'use client';

import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Trash2, Tag } from 'lucide-react';
import { Transaction } from '@/lib/supabase';
import { usePrivacy } from '@/lib/privacy-context';

interface TransactionItemProps {
    transaction: Transaction;
    onDelete: (id: string) => void;
}

export default function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
    const controls = useAnimation();
    const { isPrivacyMode } = usePrivacy();

    const handleDragEnd = async (event: any, info: PanInfo) => {
        const offset = info.offset.x;

        // Se arrastar mais de 100px para a esquerda, confirma a exclusão
        if (offset < -100) {
            await controls.start({ x: -500, transition: { duration: 0.2 } });
            onDelete(transaction.id);
        } else {
            // Se soltar antes, volta para o lugar
            controls.start({ x: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } });
        }
    };

    return (
        <div className="relative mb-3 group">
            {/* Fundo Vermelho com Lixeira (Fica atrás) */}
            <div className="absolute inset-0 bg-red-500 rounded-xl flex items-center justify-end pr-6">
                <Trash2 className="text-white w-6 h-6" />
            </div>

            {/* Card da Transação (Fica na frente e arrasta) */}
            <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                animate={controls}
                whileTap={{ cursor: 'grabbing' }}
                className="relative bg-card border p-4 rounded-xl flex justify-between items-center z-10"
                style={{ touchAction: 'none' }}
            >
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold bg-secondary px-2 py-0.5 rounded text-muted-foreground uppercase tracking-wider">
                            {transaction.category || 'Geral'}
                        </span>
                        <p className="font-medium">{transaction.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                        {transaction.tags && transaction.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Tag className="w-3 h-3" /> {tag}
                            </span>
                        ))}
                        <p className="text-xs text-muted-foreground ml-1">
                            {new Date(transaction.date).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <span className={`font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'} ${isPrivacyMode ? 'blur-md select-none' : ''}`}>
                    {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                </span>
            </motion.div>
        </div>
    );
}
