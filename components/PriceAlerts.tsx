'use client';

import { AlertTriangle, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';

interface PriceAlert {
    id: string;
    transactionName: string;
    amount: number;
    category: string;
    averageAmount: number;
    percentageAbove: number;
    timestamp: string;
}

interface PriceAlertsProps {
    alerts: PriceAlert[];
    onDismiss?: (id: string) => void;
}

export default function PriceAlerts({ alerts, onDismiss }: PriceAlertsProps) {
    const [dismissed, setDismissed] = useState<string[]>([]);

    if (alerts.length === 0) return null;

    const visibleAlerts = alerts.filter(a => !dismissed.includes(a.id));
    if (visibleAlerts.length === 0) return null;

    const handleDismiss = (id: string) => {
        setDismissed([...dismissed, id]);
        onDismiss?.(id);
    };

    return (
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-red-500">Alertas de Preço Alto</h3>
            </div>

            <div className="space-y-2">
                {visibleAlerts.slice(0, 3).map((alert) => (
                    <div
                        key={alert.id}
                        className="bg-background/50 backdrop-blur-sm border border-red-500/20 rounded-lg p-3 relative"
                    >
                        <button
                            onClick={() => handleDismiss(alert.id)}
                            className="absolute top-2 right-2 p-1 hover:bg-red-500/20 rounded-full transition-colors"
                        >
                            <X className="w-3 h-3 text-muted-foreground" />
                        </button>

                        <div className="pr-6">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-medium text-sm">{alert.transactionName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(alert.timestamp).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <p className="font-bold text-red-500">R$ {alert.amount.toFixed(2)}</p>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                                <div className="flex items-center gap-1 bg-red-500/20 text-red-500 px-2 py-1 rounded-full">
                                    <TrendingUp className="w-3 h-3" />
                                    <span className="font-bold">{alert.percentageAbove.toFixed(0)}%</span>
                                </div>
                                <span className="text-muted-foreground">
                                    acima da média em {alert.category}
                                </span>
                            </div>

                            <p className="text-xs text-muted-foreground mt-1">
                                Sua média: R$ {alert.averageAmount.toFixed(2)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {visibleAlerts.length > 3 && (
                <p className="text-xs text-center text-muted-foreground">
                    +{visibleAlerts.length - 3} alerta(s) a mais
                </p>
            )}
        </div>
    );
}
