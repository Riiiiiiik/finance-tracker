import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

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
    status?: 'pending' | 'completed' | 'paid' | 'cancelled';
    recurrence_id?: string;
    invoice_month?: string;
    installments_count?: number;
    installment_number?: number;
    group_id?: string;
    pocket_id?: string; // Link to a budget pocket
};

export type Recurrence = {
    id: string;
    user_id: string;
    name: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    due_day?: number;
    start_date: string;
    end_date?: string;
    last_generated?: string;
    active: boolean;
    created_at: string;
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
    limit?: number;
    closing_day?: number;
    due_day?: number;
};

export type Pocket = {
    id: string;
    user_id: string;
    name: string;
    goal_amount: number;
    current_balance: number;
    target_date?: string;
    color: string;
    icon: string;
    created_at: string;
    renewal_cycle?: 'monthly' | 'weekly' | 'one-off';
};

export type Category = {
    id: string;
    user_id: string;
    name: string;
    created_at?: string;
};
