set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_profile(p_avatar_url text, p_username text, p_first_name text, p_last_name text, p_dob timestamp with time zone)
 RETURNS public.profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_user_id uuid := auth.uid();
  updated_row profiles;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if p_username is not null then
    if exists (
      select 1 from profiles
      where username = p_username
        and id <> v_user_id
    ) then
      raise exception 'Username already taken';
    end if;
  end if;

  update profiles
  set
    avatar_url = p_avatar_url,
    username = coalesce(p_username, username),
    first_name = coalesce(p_first_name, first_name),
    last_name = coalesce(p_last_name, last_name),
    dob = coalesce(p_dob, dob)
  where id = v_user_id
  returning * into updated_row;

  if updated_row is null then
    raise exception 'Profile does not exist';
  end if;

  return updated_row;
end;
$function$
;


