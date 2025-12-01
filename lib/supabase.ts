import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        '⚠️ ERRO: Variáveis de ambiente não configuradas!\n\n' +
        'Crie um arquivo .env.local na raiz do projeto com:\n' +
        'NEXT_PUBLIC_SUPABASE_URL=https://jeebwxqnonbnvykpoo.supabase.co\n' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_GFBjJIQV3G28dcLDElzvyw_-iyeYhDL\n\n' +
        'Depois reinicie o servidor com: npm run dev'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper para criar cliente Supabase (usado em componentes)
export function createSupabaseClient() {
    return supabase;
}

// =====================================================
// TIPOS
// =====================================================

export interface Database {
    public: {
        Tables: {
            transactions: {
                Row: {
                    id: string;
                    user_id: string;
                    type: 'income' | 'expense';
                    amount: number;
                    category: string;
                    description: string;
                    date: string;
                    created_at: string;
                };
            };
        };
    };
}

export const defaultCategories = [
    'Alimentação',
    'Transporte',
    'Saúde',
    'Educação',
    'Lazer',
    'Moradia',
    'Outros'
];

// =====================================================
// AUTENTICAÇÃO
// =====================================================

export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    return { data, error };
}

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
}

// =====================================================
// TRANSAÇÕES
// =====================================================

export async function getTransactions(userId: string) {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

    return { data, error };
}

export async function addTransaction(transaction: {
    user_id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: string;
}) {
    const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();

    return { data, error };
}

export async function updateTransaction(id: string, updates: Partial<{
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: string;
}>) {
    const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    return { data, error };
}

export async function deleteTransaction(id: string) {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    return { error };
}
