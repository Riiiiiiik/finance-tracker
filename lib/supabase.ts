import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        '⚠️ ERRO: Variáveis de ambiente não configuradas!\n\n' +
        'Crie um arquivo .env.local na raiz do projeto com:\n' +
        'NEXT_PUBLIC_SUPABASE_URL=https://jeebwxqnonbnvykpoo.supabase.co\n' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplZWJ3eHFub25ibnZ5a3BvbyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzMyNDg5OTg5LCJleHAiOjIwNDgwNjU5ODl9.GFBjJIQV3G28dcLDElzvyw_-iyeYhDL\n\n' +
        'Depois reinicie o servidor com: npm run dev'
    );
}

// Criar cliente Supabase com retry automático
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    global: {
        headers: {
            'x-application-name': 'finance-tracker',
        },
    },
    // Configurações de retry
    db: {
        schema: 'public',
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});

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
// HELPER: RETRY COM BACKOFF EXPONENCIAL
// =====================================================

async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
): Promise<T> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Não fazer retry em erros de autenticação
            if (error.message?.includes('Invalid login credentials') ||
                error.message?.includes('Email not confirmed') ||
                error.message?.includes('User not found')) {
                throw error;
            }

            // Se for o último retry, lançar o erro
            if (i === maxRetries - 1) {
                throw error;
            }

            // Esperar com backoff exponencial
            const delay = baseDelay * Math.pow(2, i);
            console.log(`Tentativa ${i + 1} falhou. Tentando novamente em ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

// =====================================================
// AUTENTICAÇÃO COM RETRY
// =====================================================

export async function signUp(email: string, password: string) {
    return retryWithBackoff(async () => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            // Mensagens de erro amigáveis
            if (error.message.includes('User already registered')) {
                throw new Error('Este email já está cadastrado. Tente fazer login.');
            }
            throw error;
        }

        return { data, error };
    });
}

export async function signIn(email: string, password: string) {
    return retryWithBackoff(async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            // Mensagens de erro amigáveis
            if (error.message.includes('Invalid login credentials')) {
                throw new Error('Email ou senha incorretos.');
            }
            if (error.message.includes('Email not confirmed')) {
                throw new Error('Você precisa confirmar seu email antes de fazer login.');
            }
            throw error;
        }

        return { data, error };
    });
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
// TRANSAÇÕES COM RETRY
// =====================================================

export async function getTransactions(userId: string) {
    return retryWithBackoff(async () => {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        return { data, error };
    });
}

export async function addTransaction(transaction: {
    user_id: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: string;
}) {
    return retryWithBackoff(async () => {
        const { data, error } = await supabase
            .from('transactions')
            .insert([transaction])
            .select()
            .single();

        return { data, error };
    });
}

export async function updateTransaction(id: string, updates: Partial<{
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: string;
}>) {
    return retryWithBackoff(async () => {
        const { data, error } = await supabase
            .from('transactions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        return { data, error };
    });
}

export async function deleteTransaction(id: string) {
    return retryWithBackoff(async () => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        return { error };
    });
}

// =====================================================
// HEALTH CHECK
// =====================================================

export async function checkSupabaseConnection(): Promise<boolean> {
    try {
        const { error } = await supabase.from('transactions').select('count').limit(1);
        return !error;
    } catch {
        return false;
    }
}
