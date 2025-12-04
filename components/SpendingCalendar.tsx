'use client';

import { useState } from 'react';
import { Transaction } from '@/lib/supabase';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SpendingCalendarProps {
    transactions: Transaction[];
}

export default function SpendingCalendar({ transactions }: SpendingCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);

    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getDayStatus = (day: number) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];

        const dayExpenses = transactions
            .filter(t => t.type === 'expense' && t.date.startsWith(dateStr))
            .reduce((acc, t) => acc + t.amount, 0);

        if (dayExpenses === 0) return 'bg-green-500/20 text-green-500 border-green-500/30';
        if (dayExpenses > 200) return 'bg-red-500/20 text-red-500 border-red-500/30';
        return 'bg-secondary text-muted-foreground border-border';
    };

    const handleDayClick = (day: number) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
        setSelectedDate(dateStr);
    };

    const getDayTransactions = (dateStr: string) => {
        return transactions.filter(t => t.date.startsWith(dateStr));
    };

    const selectedDayTransactions = selectedDate ? getDayTransactions(selectedDate) : [];

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return (
        <>
            <div className="bg-card border rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={prevMonth} className="p-1 hover:bg-secondary rounded">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={nextMonth} className="p-1 hover:bg-secondary rounded">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                        <span key={d} className="text-xs text-muted-foreground font-medium">{d}</span>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {blanks.map((_, i) => (
                        <div key={`blank-${i}`} className="aspect-square" />
                    ))}

                    {days.map(day => (
                        <button
                            key={day}
                            onClick={() => handleDayClick(day)}
                            className={`aspect-square flex items-center justify-center rounded-lg border text-sm font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer ${getDayStatus(day)}`}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4 mt-4 text-xs text-muted-foreground justify-center">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30"></div>
                        <span>Sem Gastos</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30"></div>
                        <span>Alto Gasto</span>
                    </div>
                </div>
            </div>

            {/* Modal de Transações do Dia */}
            {selectedDate && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
                    onClick={() => setSelectedDate(null)}
                >
                    <div
                        className="bg-card border rounded-xl p-4 w-full max-w-md max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold">
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </h3>
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="p-1 hover:bg-secondary rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {selectedDayTransactions.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">Nenhuma transação neste dia</p>
                        ) : (
                            <div className="space-y-2">
                                {selectedDayTransactions.map((tx) => (
                                    <div key={tx.id} className="bg-secondary/50 rounded-lg p-3">
                                        <div className="flex items-start justify-between mb-1">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{tx.description}</p>
                                                <p className="text-xs text-muted-foreground">{tx.category}</p>
                                            </div>
                                            <p className={`font-bold text-sm ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                                {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div className="border-t pt-3 mt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Total do dia:</span>
                                        <span className={`font-bold ${selectedDayTransactions.reduce((sum, tx) =>
                                            sum + (tx.type === 'income' ? tx.amount : -tx.amount), 0
                                        ) >= 0 ? 'text-green-500' : 'text-red-500'
                                            }`}>
                                            R$ {selectedDayTransactions.reduce((sum, tx) =>
                                                sum + (tx.type === 'income' ? tx.amount : -tx.amount), 0
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
