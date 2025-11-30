'use client';

import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BalanceCardProps {
    balance: number;
    income: number;
    expenses: number;
}

export function BalanceCard({ balance, income, expenses }: BalanceCardProps) {
    return (
        <div className="space-y-4">
            {/* Main Balance Card */}
            <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 shadow-2xl shadow-primary/20">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white/90 font-medium">Saldo Atual</span>
                    </div>
                    <div className="text-4xl font-bold text-white mb-1">
                        {formatCurrency(balance)}
                    </div>
                    <p className="text-white/70 text-sm">
                        Atualizado agora
                    </p>
                </CardContent>
            </Card>

            {/* Income & Expenses Cards */}
            <div className="grid grid-cols-2 gap-4">
                {/* Income Card */}
                <Card className="border-primary/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                                Receitas
                            </span>
                        </div>
                        <div className="text-xl font-bold text-primary">
                            {formatCurrency(income)}
                        </div>
                    </CardContent>
                </Card>

                {/* Expenses Card */}
                <Card className="border-destructive/20">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                                <TrendingDown className="w-4 h-4 text-destructive" />
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                                Despesas
                            </span>
                        </div>
                        <div className="text-xl font-bold text-destructive">
                            {formatCurrency(expenses)}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
