-- SECURITY HARDENING SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Enable RLS on all sensitive tables
ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."pockets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."recurrences" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "public"."wishlist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."news_articles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing potentially weak policies (Cleanup)
-- Drop policies for transactions
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON "public"."transactions";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."transactions";
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON "public"."transactions";
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON "public"."transactions";

-- Drop policies for accounts
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."accounts";
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON "public"."accounts";
-- ... (add others if known, but RLS default is deny all so we are safe if we enable RLS and add new policies)

-- 3. Create STRICT Owner-Only Policies

-- Helper macro logic: checking auth.uid() = user_id

-- TRANSACTIONS
CREATE POLICY "Users can manage their own transactions"
ON "public"."transactions"
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ACCOUNTS
CREATE POLICY "Users can manage their own accounts"
ON "public"."accounts"
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- POCKETS
CREATE POLICY "Users can manage their own pockets"
ON "public"."pockets"
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RECURRENCES
CREATE POLICY "Users can manage their own recurrences"
ON "public"."recurrences"
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- WISHLIST (Commented out as table might not exist)
-- CREATE POLICY "Users can manage their own wishlist"
-- ON "public"."wishlist"
-- FOR ALL
-- TO authenticated
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id);

-- PROFILES
CREATE POLICY "Users can view and update their own profile"
ON "public"."profiles"
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON "public"."profiles"
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- NEWS ARTICLES (Special Case)
-- Public can READ
-- Service Role can ALL (INSERT/UPDATE)
-- Users cannot write

CREATE POLICY "Anyone can read pending news"
ON "public"."news_articles"
FOR SELECT
TO public
USING (is_published = true);

-- Note: Service Role bypasses RLS automatically, so we don't need a specific policy for it usually,
-- but explicit allow for service_role is good practice if `force_rls_in_policy` is on (rare).
-- We just ensure no one else can write.

-- 4. Grants (Ensure permissions are correct)
GRANT ALL ON TABLE "public"."transactions" TO authenticated;
GRANT ALL ON TABLE "public"."accounts" TO authenticated;
GRANT ALL ON TABLE "public"."pockets" TO authenticated;
GRANT ALL ON TABLE "public"."recurrences" TO authenticated;
-- GRANT ALL ON TABLE "public"."wishlist" TO authenticated;
GRANT SELECT ON TABLE "public"."news_articles" TO authenticated;
GRANT SELECT ON TABLE "public"."news_articles" TO anon;
