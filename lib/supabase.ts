import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Types
export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    description: string;
    category: string;
    type: 'income' | 'expense';
    date: string;
    created_at: string;
}

export interface Database {
    public: {
        Tables: {
            transactions: {
                Row: Transaction;
                Insert: Omit<Transaction, 'id' | 'created_at'>;
                Update: Partial<Omit<Transaction, 'id' | 'created_at'>>;
            };
        };
    };
}

// Default categories for transactions
export const defaultCategories = [
    'Alimentação',
    'Transporte',
    'Saúde',
    'Educação',
    'Lazer',
    'Salário',
    'Investimentos',
    'Contas',
    'Outros'
];


// Client for client components
export const createSupabaseClient = () => {
    return createClientComponentClient<Database>();
};

// Server client (for server components/actions)
export const createSupabaseServerClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Auth helpers
export const signIn = async (email: string, password: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
};

export const signUp = async (email: string, password: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) throw error;
    return data;
};

export const signOut = async () => {
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
};

export const getCurrentUser = async () => {
    const supabase = createSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) throw error;
    return user;
};

// Transaction helpers
export const getTransactions = async () => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

    if (error) throw error;
    return data as Transaction[];
};

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    const supabase = createSupabaseClient();
    const user = await getCurrentUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user.id }])
        .select()
        .single();

    if (error) throw error;
    return data as Transaction;
};

export const deleteTransaction = async (id: string) => {
    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Transaction;
};
