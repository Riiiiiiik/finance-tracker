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
        <div className="px-1">

            {/* O Grid Principal - ASSYMETRIC LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                {/* Left Column: SENTRY (Primary Monitor) */}
                <div className="md:col-span-1 h-full min-h-[160px]">
                    <div className="bg-white/[0.03] backdrop-blur-sm p-5 rounded-2xl border border-white/5 hover:border-red-500/20 transition-all group relative overflow-hidden h-full flex flex-col justify-between">
                        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 rounded-md bg-red-500/10 text-red-500">
                                    <MonkIcon type="sentry" className="w-4 h-4" />
                                </div>
                                <span className={`font-mono text-xs font-bold tracking-wider text-red-500`}>SENTRY</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Status do Sistema</p>
                        </div>

                        <div className="relative z-10 mt-4">
                            <p className="text-foreground font-bold text-lg">
                                {riskCount === 0 ? 'Seguro' : `${riskCount} Riscos`}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <div className={`w-2 h-2 rounded-full ${riskCount === 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></div>
                                <span className="text-[10px] text-muted-foreground">Monitoramento ativo</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: MODULES STACK */}
                <div className="md:col-span-2 grid grid-cols-2 gap-3">

                    {/* WISH */}
                    <Link href="/wishlist" className="col-span-2 sm:col-span-1">
                        <div className="bg-white/[0.03] backdrop-blur-sm p-4 rounded-2xl border border-white/5 hover:border-blue-400/20 transition-all group relative overflow-hidden h-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
                                        <MonkIcon type="wish" className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-mono text-[10px] font-bold tracking-wider text-blue-400">WISH</span>
                                </div>
                                <span className="text-[10px] font-mono text-blue-400">{wishlistMainItem.percent}%</span>
                            </div>
                            <p className="text-sm font-medium text-foreground truncate">{wishlistMainItem.name}</p>

                            {/* Micro Progress Bar */}
                            <div className="w-full h-0.5 bg-white/10 rounded-full mt-3 relative overflow-hidden">
                                <div className="absolute left-0 top-0 h-full bg-blue-500 rounded-full" style={{ width: `${wishlistMainItem.percent}%` }}></div>
                            </div>
                        </div>
                    </Link>

                    {/* POCKETS */}
                    <Link href="/pockets" className="col-span-1">
                        <div className="bg-white/[0.03] backdrop-blur-sm p-4 rounded-2xl border border-white/5 hover:border-yellow-400/20 transition-all group relative overflow-hidden h-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                <div className="p-1.5 rounded-md bg-yellow-500/10 text-yellow-400">
                                    <MonkIcon type="pockets" className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-mono text-[10px] font-bold tracking-wider text-yellow-400">POCKETS</span>
                            </div>
                            <p className={`text-sm font-bold text-white/90 font-mono ${isPrivacyMode ? 'blur-sm' : ''}`}>
                                R$ {dailyAllowance.toFixed(0)}
                            </p>
                            <p className="text-[9px] text-muted-foreground mt-1">Disponível hoje</p>
                        </div>
                    </Link>

                    {/* AUDITOR */}
                    <div className="col-span-1">
                        <div className="bg-white/[0.03] backdrop-blur-sm p-4 rounded-2xl border border-white/5 hover:border-indigo-400/20 transition-all group relative overflow-hidden h-full">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-2 mb-3 relative z-10">
                                <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
                                    <MonkIcon type="auditor" className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-mono text-[10px] font-bold tracking-wider text-indigo-400">AUDITOR</span>
                            </div>
                            <p className="text-sm font-bold text-white/90 font-mono">
                                {nextInvoiceDate}
                            </p>
                            <p className="text-[9px] text-muted-foreground mt-1">Fechamento</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
