'use client';

import { Tv, TrendingUp, AlertCircle } from 'lucide-react';

interface Subscription {
    id: string;
    name: string;
    amount: number;
    lastAmount: number | null;
    category: string;
}

interface SubscriptionAuditorProps {
    subscriptions: Subscription[];
}

export default function SubscriptionAuditor({ subscriptions }: SubscriptionAuditorProps) {
    if (subscriptions.length === 0) return null;

    const totalMonthly = subscriptions.reduce((sum, s) => sum + s.amount, 0);
    const hasAlerts = subscriptions.some(s => s.lastAmount && s.amount > s.lastAmount);

    return (
        <div className="bg-card border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Tv className="w-5 h-5 text-purple-500" />
                    <h3 className="font-bold">Assinaturas</h3>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total/mês</p>
                    <p className="font-bold text-purple-500">R$ {totalMonthly.toFixed(2)}</p>
                </div>
            </div>

            <div className="space-y-2">
                {subscriptions.slice(0, 5).map((sub) => {
                    const increased = sub.lastAmount && sub.amount > sub.lastAmount;
                    const diff = increased ? sub.amount - sub.lastAmount! : 0;

                    return (
                        <div
                            key={sub.id}
                            className={`flex items-center justify-between p-2 rounded-lg transition-colors ${increased ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-secondary/50'
                                }`}
                        >
                            <div className="flex-1">
                                <p className="font-medium text-sm">{sub.name}</p>
                                <p className="text-xs text-muted-foreground">{sub.category}</p>
                            </div>
                            <div className="text-right flex items-center gap-2">
                                <div>
                                    <p className="font-bold text-sm">R$ {sub.amount.toFixed(2)}</p>
                                    {increased && (
                                        <p className="text-xs text-orange-500 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            +R$ {diff.toFixed(2)}
                                        </p>
                                    )}
                                </div>
                                {increased ? (
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                ) : (
                                    <span className="text-green-500 text-lg">✓</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {hasAlerts && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                    <p className="text-xs text-orange-500 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {subscriptions.filter(s => s.lastAmount && s.amount > s.lastAmount).length} assinatura(s) com aumento de preço detectado
                    </p>
                </div>
            )}
        </div>
    );
}
