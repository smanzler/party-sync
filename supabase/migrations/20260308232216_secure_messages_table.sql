-- 1. Clean up existing policies to avoid "already exists" errors
drop policy if exists "Users can view messages in their conversations" on public.message;
drop policy if exists "Users can insert messages into their conversations" on public.message;

-- 2. Create the View Policy
create policy "Users can view messages in their conversations"
on public.message
for select
using (
  exists (
    select 1 from public.conversation_member
    where conversation_id = message.conversation_id
    and user_id = auth.uid()
  )
);

-- 3. Create the Insert Policy
create policy "Users can insert messages into their conversations"
on public.message
for insert
with check (
  auth.uid() = sender_user_id AND
  exists (
    select 1 from public.conversation_member
    where conversation_id = message.conversation_id
    and user_id = auth.uid()
  )
);

-- 4. Ensure the realtime publication exists
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- 5. Add the message table to the publication
-- We use a check to avoid errors if the table is already in the publication
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and tablename = 'message'
  ) then
    alter publication supabase_realtime add table message;
  end if;
end $$;