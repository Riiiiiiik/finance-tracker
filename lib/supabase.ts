import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Transaction = {
    id: string;
    user_id: string;
    amount: number;
    description: string;
    type: 'income' | 'expense';
    category: string;
    tags?: string[];
    date: string;
    happiness_score?: number;
    account_id?: string;
};

export type Category = {
    id: string;
    user_id: string;
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    created_at?: string;
};

export type WishlistItem = {
    id: string;
    user_id: string;
    name: string;
    price: number;
    link?: string;
    image_url?: string;
    priority: 'high' | 'medium' | 'low';
    category?: string;
    notes?: string;
    created_at: string;
    purchased_at?: string;
    transaction_id?: string;
    cooling_off_until?: string;
};

export type Account = {
    id: string;
    user_id: string;
    name: string;
    type: 'checking' | 'savings' | 'investment' | 'cash' | 'credit';
    balance: number;
    color: string;
    is_default: boolean;
    created_at?: string;
};
