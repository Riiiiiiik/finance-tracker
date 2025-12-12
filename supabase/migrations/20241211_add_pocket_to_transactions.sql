-- Add pocket_id to transactions table to link expenses to budgets
ALTER TABLE transactions 
ADD COLUMN pocket_id UUID REFERENCES pockets(id) ON DELETE SET NULL;

-- Optional: Create an index for faster lookups
CREATE INDEX idx_transactions_pocket_id ON transactions(pocket_id);
