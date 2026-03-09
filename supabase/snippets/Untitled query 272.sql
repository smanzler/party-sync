-- 1. Wipe everything clean
drop policy if exists "select_conversation" on public.conversation;
drop policy if exists "select_member" on public.conversation_member;
drop policy if exists "view_own_conversations" on public.conversation;
drop policy if exists "view_members" on public.conversation_member;

-- 2. DUMB CONVERSATION POLICY
-- You can see a conversation if you are the creator.
-- (We will handle the recipient's visibility in the next step)
create policy "select_conversation"
on public.conversation for select
to authenticated
using (auth.uid() = created_by_user_id);

-- 3. DUMB MEMBER POLICY
-- You can ONLY see membership rows that belong to YOU.
create policy "select_member"
on public.conversation_member for select
to authenticated
using (auth.uid() = user_id);