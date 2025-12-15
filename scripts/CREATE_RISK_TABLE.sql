-- Create table for storing AI Risk Analysis Profiles
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS "public"."risk_profiles" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    "report_json" jsonb NOT NULL,
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE "public"."risk_profiles" ENABLE ROW LEVEL SECURITY;

-- 1. Users can READ their own profiles
CREATE POLICY "Users can read own risk profiles"
ON "public"."risk_profiles"
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Service Role (API) can INSERT (and do everything)
-- No policy needed for service_role as it bypasses RLS, 
-- but we ensure Authenticated Users cannot INSERT manually.
-- (Default RLS is deny-all for insert if no policy exists)

-- Indexes for performance
CREATE INDEX IF NOT EXISTS risk_profiles_user_id_idx ON "public"."risk_profiles" (user_id);
CREATE INDEX IF NOT EXISTS risk_profiles_created_at_idx ON "public"."risk_profiles" (created_at DESC);
