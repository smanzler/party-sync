-- First, drop the existing version to allow changing the return type
drop function if exists get_existing_conversation(uuid, uuid);

-- Now create the new table-returning version
create or replace function get_existing_conversation(p_user_id uuid, p_friend_id uuid)
returns table (conversation_id uuid)
language plpgsql
as $$
begin
  return query
  select cm1.conversation_id
  from conversation_member cm1
  join conversation_member cm2 on cm1.conversation_id = cm2.conversation_id
  join conversation c on c.id = cm1.conversation_id
  where cm1.user_id = p_user_id
    and cm2.user_id = p_friend_id
    and c.type = 'direct'
  limit 1;
end;
$$;