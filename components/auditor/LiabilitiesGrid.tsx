import React from 'react';
import { LiabilityCard } from './LiabilityCard';

interface LiabilitiesGridProps {
    creditCards?: any[];
    fixedExpenses?: any[];
    fixedIncomes?: any[];
    transactions?: any[];
}

export const LiabilitiesGrid = ({ creditCards = [], fixedExpenses = [], fixedIncomes = [], transactions = [] }: LiabilitiesGridProps) => {
    return (
        <div className="grid grid-cols-1 gap-8 font-mono">

            {/* COLUNA 1: DRENAGEM (PASSIVOS) */}
            <div>
                <h4 className="flex items-center gap-2 text-red-500 text-[10px] font-bold tracking-[0.2em] mb-4 border-b border-red-900/30 pb-2 uppercase">
                    <div className="w-1.5 h-1.5 bg-red-500 rotate-45" />
                    DRENAGEM [PASSIVOS]
                </h4>

                {/* SUBHEADER: CREDIT CARDS */}
                {creditCards.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3 pl-1">
                            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">
                                // CARTÕES DE CRÉDITO
                            </span>
                            <div className="h-px bg-zinc-800 flex-1" />
                        </div>

                        <div className="space-y-4">
                            {creditCards.map((card) => {
                                const debt = card.balance < 0 ? Math.abs(card.balance) : 0;
                                const limit = card.limit || 0.00;

                                // Filter transactions for this card
                                const cardTxs = transactions.filter(t => t.account_id === card.id);

                                return (
                                    <LiabilityCard
                                        key={card.id}
                                        type="credit"
                                        name={card.name}
                                        value={debt}
                                        total={limit}
                                        info={card.closing_day ? `FECHA DIA ${card.closing_day}` : 'CARTÃO DE CRÉDITO'}
                                        status={debt > 0 ? "ABERTA" : "ZERADO"}
                                        transactions={cardTxs}
                                        closingDay={card.closing_day}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* SUBHEADER: FIXED EXPENSES */}
                {fixedExpenses.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3 pl-1">
                            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">
                                // DESPESAS FIXAS
                            </span>
                            <div className="h-px bg-zinc-800 flex-1" />
                        </div>

                        <div className="space-y-4">
                            {fixedExpenses.map((expense) => (
                                <LiabilityCard
                                    key={expense.id}
                                    type="fixed"
                                    name={expense.name}
                                    value={expense.amount}
                                    info={expense.due_day ? `VENCE DIA ${expense.due_day}` : 'MENSAL'}
                                    status="FIXO"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* COLUNA 2: SUPRIMENTO (ATIVOS) */}
            <div>
                <h4 className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold tracking-[0.2em] mb-4 border-b border-emerald-900/30 pb-2 uppercase">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rotate-45" />
                    SUPRIMENTO [ATIVOS]
                </h4>

                <div className="space-y-4">
                    {fixedIncomes.length > 0 ? (
                        fixedIncomes.map((income) => (
                            <LiabilityCard
                                key={income.id}
                                type="fixed" // Reusing fixed style (green)
                                name={income.name}
                                value={income.amount}
                                info={income.type === 'profile' ? 'DEFINIDO NO PERFIL' : (income.due_day ? `DIA ${income.due_day}` : 'VARIÁVEL')}
                                status="ENTRADA"
                            />
                        ))
                    ) : (
                        <div className="p-4 border border-emerald-900/20 bg-emerald-900/5 text-center">
                            <span className="text-[10px] text-emerald-700 tracking-widest uppercase">Nenhum suprimento detectado</span>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
