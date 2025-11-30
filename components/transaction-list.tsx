'use client';

import { Transaction } from '@/lib/supabase';
import { formatCurrency, formatRelativeDate } from '@/lib/utils';
import { defaultCategories } from '@/lib/supabase';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface TransactionListProps {
    transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
    if (transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <span className="text-4xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhuma transação ainda</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Comece adicionando sua primeira transação usando o botão abaixo
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {transactions.map((transaction) => {
                const category = defaultCategories.find(
                    cat => cat.name === transaction.category
                );

                return (
                    <div
                        key={transaction.id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                    >
                        {/* Category Icon */}
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                            style={{ backgroundColor: category?.color + '20' }}
                        >
                            {category?.icon || '📦'}
                        </div>

                        {/* Transaction Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{transaction.description}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                    {transaction.category}
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                    {formatRelativeDate(transaction.date)}
                                </span>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {transaction.type === 'income' ? (
                                <ArrowUpCircle className="w-5 h-5 text-primary" />
                            ) : (
                                <ArrowDownCircle className="w-5 h-5 text-destructive" />
                            )}
                            <span
                                className={`font-bold text-lg ${transaction.type === 'income'
                                        ? 'text-primary'
                                        : 'text-destructive'
                                    }`}
                            >
                                {transaction.type === 'income' ? '+' : '-'}
                                {formatCurrency(Math.abs(transaction.amount))}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
