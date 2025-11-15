
CREATE OR REPLACE FUNCTION public.update_profile(
  p_avatar_url text DEFAULT NULL,
  p_username text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_dob timestamp with time zone DEFAULT NULL,
  p_favorite_games text[] DEFAULT NULL,
  p_platforms text[] DEFAULT NULL,
  p_playstyle text DEFAULT NULL,
  p_availability text[] DEFAULT NULL,
  p_voice_chat text DEFAULT NULL,
  p_bio text DEFAULT NULL
)
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

  -- Check username uniqueness if username is being updated
  if p_username is not null then
    if exists (
      select 1 from profiles
      where username = p_username
        and id <> v_user_id
    ) then
      raise exception 'Username already taken';
    end if;
  end if;

  -- Update profile with only non-null values
  update profiles
  set
    avatar_url = p_avatar_url,
    username = coalesce(p_username, username),
    first_name = coalesce(p_first_name, first_name),
    last_name = coalesce(p_last_name, last_name),
    dob = coalesce(p_dob, dob),
    favorite_games = coalesce(p_favorite_games, favorite_games),
    platforms = coalesce(p_platforms, platforms),
    playstyle = coalesce(p_playstyle, playstyle),
    availability = coalesce(p_availability, availability),
    voice_chat = coalesce(p_voice_chat, voice_chat),
    bio = coalesce(p_bio, bio)
  where id = v_user_id
  returning * into updated_row;

  if updated_row is null then
    raise exception 'Profile does not exist';
  end if;

  return updated_row;
end;
$function$;

