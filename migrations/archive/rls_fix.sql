-- Execute this in Supabase SQL Editor to fix the "RP-Safety Violations" (RLS Error)

-- 1. Enable Insert Policy for Recurrences
create policy "Enable insert for users based on user_id"
on "public"."recurrences"
as permissive
for insert
to public
with check (auth.uid() = user_id);

-- 2. Ensure Update Policy exists too (just in case)
create policy "Enable update for users based on user_id"
on "public"."recurrences"
as permissive
for update
to public
using (auth.uid() = user_id);
