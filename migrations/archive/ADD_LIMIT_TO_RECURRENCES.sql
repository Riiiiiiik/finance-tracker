-- Add total_occurrences column to recurrences table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recurrences' AND column_name = 'total_occurrences') THEN
        ALTER TABLE recurrences ADD COLUMN total_occurrences INTEGER;
    END IF;
END $$;
