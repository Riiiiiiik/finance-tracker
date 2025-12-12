import React from 'react';
import { ChevronUp, ChevronDown, Plus, Minus } from 'lucide-react';

interface CreditTimelineProps {
    creditCards?: any[];
    fixedExpenses?: any[];
}

export const CreditTimeline = ({ creditCards = [], fixedExpenses = [] }: CreditTimelineProps) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    const events: any[] = [];

    creditCards.forEach(card => {
        if (card.closing_day) {
            events.push({
                day: card.closing_day,
                date: `${card.closing_day}/${currentMonth + 1}`,
                label: `FECH. ${card.name}`,
                type: 'closed',
                active: false
            });
        }
    });

    fixedExpenses.forEach(exp => {
        if (exp.due_day) {
            events.push({
                day: exp.due_day,
                date: `${exp.due_day}/${currentMonth + 1}`,
                label: exp.name,
                type: 'warning',
                active: false
            });
        }
    });

    events.sort((a, b) => a.day - b.day);

    // Mark Past/Future
    events.forEach(e => {
        if (e.day < currentDay) e.status = 'past';
        else if (e.day === currentDay) e.status = 'current';
        else e.status = 'future';
    });

    return (
        <div className="mb-10 font-mono relative">
            <h4 className="text-[10px] text-neutral-600 uppercase tracking-[0.2em] mb-4 pl-1">Horizonte de Eventos</h4>

            <div className="overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex items-center min-w-max px-4 relative">
                    {/* The Horizon Line */}
                    <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -z-10" />

                    {events.length === 0 ? (
                        <span className="text-neutral-600 text-[10px] w-full text-center">SEM EVENTOS DETECTADOS</span>
                    ) : (
                        events.map((event, index) => {
                            const isPast = event.status === 'past';
                            const isCurrent = event.status === 'current';

                            return (
                                <div
                                    key={index}
                                    className={`flex flex-col items-center min-w-[80px] group ${isPast ? 'opacity-30 blur-[0.5px]' : 'opacity-100'}`}
                                >
                                    {/* Symbol */}
                                    <div className={`
                                    w-8 h-8 flex items-center justify-center border bg-black z-10 transition-all duration-300
                                    ${isCurrent
                                            ? 'border-white bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)] scale-110'
                                            : 'border-neutral-800 text-neutral-500'
                                        }
                                    ${event.type === 'closed' && !isCurrent ? 'border-red-900/50 text-red-700' : ''}
                                    chamfered-sm
                                `}>
                                        {event.type === 'closed' && <Minus size={12} strokeWidth={4} />}
                                        {event.type === 'warning' && <ChevronDown size={14} strokeWidth={3} />}
                                        {event.type === 'income' && <Plus size={14} strokeWidth={3} />}
                                    </div>

                                    {/* Date */}
                                    <span className={`text-[10px] font-bold mt-3 mb-1 ${isCurrent ? 'text-white' : 'text-neutral-500'}`}>
                                        {event.date}
                                    </span>

                                    {/* Label */}
                                    <span className="text-[8px] uppercase tracking-wider text-neutral-600 font-bold whitespace-nowrap">
                                        {event.label}
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
