import Link from 'next/link';
import MonkIcon, { monkColors } from './MonkIcon';
import { usePrivacy } from '@/lib/privacy-context';

interface MonkGridProps {
    dailyAllowance?: number;
    riskCount?: number;
    wishlistMainItem?: { name: string; percent: number };
    nextInvoiceDate?: string;
}

export default function MonkGrid({
    dailyAllowance = 0,
    riskCount = 0,
    wishlistMainItem = { name: 'Meta Principal', percent: 0 },
    nextInvoiceDate = '--/--'
}: MonkGridProps) {
    const { isPrivacyMode } = usePrivacy();

    return (
        <div className="mt-8 px-1">
            <h3 className="text-[10px] text-muted-foreground/60 font-medium mb-3 uppercase tracking-[0.2em] px-1">
                Módulos da Ordem
            </h3>

            {/* O Grid Principal */}
            <div className="grid grid-cols-2 gap-3">

                {/* Card SENTRY (Risco) */}
                <div className="bg-[#161616] p-4 rounded-xl border border-red-900/20 hover:border-red-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-2 mb-2 relative z-10">
                        <MonkIcon type="sentry" className="w-4 h-4" />
                        <span className={`font-bold text-xs ${monkColors.sentry}`}>Monk.Sentry</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-1 relative z-10">Vigilância Ativa</p>
                    <p className="text-foreground font-semibold text-sm relative z-10">
                        {riskCount === 0 ? 'Tudo Seguro' : `${riskCount} Riscos`}
                    </p>
                </div>

                {/* Card WISH (Meta) */}
                <Link href="/wishlist">
                    <div className="bg-[#161616] p-4 rounded-xl border border-blue-900/20 hover:border-blue-400/30 transition-all group relative overflow-hidden cursor-pointer h-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <MonkIcon type="wish" className="w-4 h-4" />
                            <span className={`font-bold text-xs ${monkColors.wish}`}>Monk.Wish</span>
                        </div>
                        <div className="flex justify-between items-end relative z-10 mb-1">
                            <p className="text-foreground font-semibold text-xs truncate max-w-[80%]">{wishlistMainItem.name}</p>
                            <span className={`${monkColors.wish} text-[10px]`}>{wishlistMainItem.percent}%</span>
                        </div>
                        {/* Barrinha de progresso */}
                        <div className="w-full h-1 bg-gray-800 rounded-full relative z-10">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                style={{ width: `${wishlistMainItem.percent}%` }}
                            ></div>
                        </div>
                    </div>
                </Link>

                {/* Card POCKETS (Diário) */}
                <Link href="/pockets">
                    <div className="bg-[#161616] p-4 rounded-xl border border-yellow-900/20 hover:border-yellow-400/30 transition-all group relative overflow-hidden cursor-pointer h-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <MonkIcon type="pockets" className="w-4 h-4" />
                            <span className="text-[#FFD659] font-bold text-xs">Monk.Pockets</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-1 relative z-10">Disponível Hoje</p>
                        <p className={`text-foreground font-semibold text-sm relative z-10 ${isPrivacyMode ? 'blur-sm' : ''}`}>
                            R$ {dailyAllowance.toFixed(2)}
                        </p>
                    </div>
                </Link>

                {/* Card AUDITOR (Relatório) */}
                <div className="bg-[#161616] p-4 rounded-xl border border-indigo-900/20 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-2 mb-2 relative z-10">
                        <MonkIcon type="auditor" className="w-4 h-4" />
                        <span className={`font-bold text-xs ${monkColors.auditor}`}>Monk.Auditor</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-1 relative z-10">Próx. Fechamento</p>
                    <p className="text-foreground font-semibold text-sm relative z-10">{nextInvoiceDate}</p>
                </div>

            </div>
        </div>
    );
}
