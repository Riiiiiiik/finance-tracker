-- 1. Create Recurrences Table (The Rules)
CREATE TABLE IF NOT EXISTS recurrences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    due_day INTEGER, -- 1-31 for monthly
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE, -- Nullable for infinite
    last_generated DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for recurrences
ALTER TABLE recurrences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recurrences"
    ON recurrences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurrences"
    ON recurrences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurrences"
    ON recurrences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurrences"
    ON recurrences FOR DELETE
    USING (auth.uid() = user_id);

-- 2. Update Transactions Table (The Facts)
-- Add link to recurrence
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS recurrence_id UUID REFERENCES recurrences(id) ON DELETE SET NULL;

-- Ensure status column exists (if not already)
-- Note: User mentioned 'status' (pago/pendente), let's ensure it exists or add it.
-- Based on previous context, 'status' might already be there or implicitly handled?
-- Let's add it safely.
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'completed', 'paid', 'cancelled')) DEFAULT 'completed';

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_recurrences_user_id ON recurrences(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_recurrence_id ON transactions(recurrence_id);
