import { Pocket } from '@/lib/supabase';
import { Target, Shield, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PocketCardProps {
    pocket: Pocket;
    onAddMoney: (amount: number) => void;
    onEdit: (pocket: Pocket) => void;
    onDelete: (pocket: Pocket) => void;
}

export default function PocketCard({ pocket, onAddMoney, onEdit, onDelete }: PocketCardProps) {
    const percent = Math.min(100, (pocket.current_balance / pocket.goal_amount) * 100);
    const needed = pocket.goal_amount - pocket.current_balance;

    return (
        <div className="bg-[#161616] border border-white/5 rounded-2xl p-5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className={`absolute inset-0 bg-gradient-to-br from-${pocket.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

            {/* Actions for the Tactician */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(pocket); }}
                    className="p-2 bg-black/50 hover:bg-[#FFD659] hover:text-black rounded-full text-white/50 transition-colors"
                >
                    <Pencil size={14} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(pocket); }}
                    className="p-2 bg-black/50 hover:bg-red-500 hover:text-white rounded-full text-white/50 transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-${pocket.color}-500/10 flex items-center justify-center`}>
                            <Shield className={`w-5 h-5 text-${pocket.color}-500`} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg leading-tight">{pocket.name}</h3>
                            <p className="text-xs text-muted-foreground">Meta: R$ {pocket.goal_amount.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="text-right absolute top-5 right-5 group-hover:opacity-0 transition-opacity">
                    <p className="text-2xl font-bold">R$ {pocket.current_balance.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{percent.toFixed(1)}%</p>
                </div>
                {/* Balance shows on left when actions appear? No, let's keep it simple. 
                    Actually, the actions overlay the balance if I'm not careful.
                    Let's adjust the layout slightly.
                */}
                <div className="flex justify-between items-end mb-2 mt-4">
                    <p className="text-2xl font-bold">R$ {pocket.current_balance.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{percent.toFixed(1)}%</p>
                </div>


                <div className="w-full h-2 bg-gray-800 rounded-full mb-4 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className={`h-full bg-${pocket.color}-500 rounded-full`}
                    />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span>Falta R$ {needed.toFixed(2)}</span>
                    </div>
                    {pocket.target_date && (
                        <div className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{new Date(pocket.target_date).toLocaleDateString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
