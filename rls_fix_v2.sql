-- FIX RLS FOR RECURRENCES (COMPREHENSIVE)

-- 1. Enable RLS on the table (ensure it is on)
alter table "public"."recurrences" enable row level security;

-- 2. Drop potential existing policies to avoid conflicts
drop policy if exists "Enable insert for users based on user_id" on "public"."recurrences";
drop policy if exists "Enable update for users based on user_id" on "public"."recurrences";
drop policy if exists "Enable select for users based on user_id" on "public"."recurrences";
drop policy if exists "Enable delete for users based on user_id" on "public"."recurrences";
drop policy if exists "Owners can manage recurrences" on "public"."recurrences";

-- 3. Create a SINGLE powerful policy for ALL operations (Select, Insert, Update, Delete)
create policy "Owners can manage recurrences"
on "public"."recurrences"
for all
to public
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 4. Verify grants (sometimes needed for new tables)
grant all on table "public"."recurrences" to authenticated;
grant all on table "public"."recurrences" to service_role;
