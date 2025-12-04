import { supabase, Transaction } from './supabase';

interface Subscription {
    id: string;
    name: string;
    amount: number;
    lastAmount: number | null;
    category: string;
    detectedAt: string;
}

export async function detectSubscriptions(userId: string): Promise<Subscription[]> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .eq('category', 'Streaming') // APENAS STREAMING
        .gte('date', sixMonthsAgo.toISOString())
        .order('date', { ascending: false });

    if (!transactions) return [];

    // Agrupar por descrição similar (case-insensitive)
    const grouped = transactions.reduce((acc: any, t) => {
        const key = t.description.toLowerCase().trim();
        if (!acc[key]) acc[key] = [];
        acc[key].push(t);
        return acc;
    }, {});

    const subscriptions: Subscription[] = [];

    for (const [desc, txs] of Object.entries(grouped) as [string, Transaction[]][]) {
        // Precisa aparecer pelo menos 2x para ser considerado assinatura
        if (txs.length < 2) continue;

        // Ordenar por data (mais recente primeiro)
        const sortedTxs = txs.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        const latest = sortedTxs[0];
        const previous = sortedTxs[1];

        // Verificar se houve mudança de preço (diferença maior que R$ 0.50)
        const priceChanged = Math.abs(latest.amount - previous.amount) > 0.50;

        subscriptions.push({
            id: latest.id,
            name: latest.description,
            amount: latest.amount,
            lastAmount: priceChanged ? previous.amount : null,
            category: latest.category || 'Streaming',
            detectedAt: latest.date
        });
    }

    return subscriptions.sort((a, b) => b.amount - a.amount);
}

export async function getRecentTransactionInCategory(
    userId: string,
    category: string,
    excludeId: string
): Promise<Transaction | null> {
    const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .eq('category', category)
        .neq('id', excludeId)
        .order('date', { ascending: false })
        .limit(1)
        .single();

    return data || null;
}

export async function calculateCategoryAverage(
    userId: string,
    category: string,
    months: number = 3
): Promise<number> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .eq('category', category)
        .gte('date', startDate.toISOString());

    if (!transactions || transactions.length === 0) return 0;

    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    return total / transactions.length;
}

export function isPriceAlert(amount: number, previousAmount: number): boolean {
    if (previousAmount === 0) return false;
    // Alerta se o valor atual for 200% ou mais do valor anterior
    return amount >= previousAmount * 2;
}
