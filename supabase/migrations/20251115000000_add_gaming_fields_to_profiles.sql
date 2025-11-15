-- Add gaming-specific fields to profiles table
ALTER TABLE "public"."profiles"
ADD COLUMN "favorite_games" text[] DEFAULT '{}',
ADD COLUMN "platforms" text[] DEFAULT '{}',
ADD COLUMN "playstyle" text CHECK (playstyle IN ('casual', 'competitive', 'both')),
ADD COLUMN "availability" text[] DEFAULT '{}',
ADD COLUMN "voice_chat" text CHECK (voice_chat IN ('yes', 'no', 'sometimes')),
ADD COLUMN "bio" text;

CREATE OR REPLACE FUNCTION public.create_profile(
  p_avatar_url text,
  p_username text,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_dob timestamp with time zone DEFAULT NULL,
  p_favorite_games text[] DEFAULT '{}',
  p_platforms text[] DEFAULT '{}',
  p_playstyle text DEFAULT NULL,
  p_availability text[] DEFAULT '{}',
  p_voice_chat text DEFAULT NULL,
  p_bio text DEFAULT NULL
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
declare
  v_user_id uuid := auth.uid();
  new_row profiles;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if p_username is null or length(trim(p_username)) < 3 then
    raise exception 'Username must be at least 3 characters';
  end if;

  if p_dob is null then
    raise exception 'Date of birth is required';
  end if;

  -- Check if profile already exists
  if exists (
    select 1
    from profiles
    where id = v_user_id
  ) then
    raise exception 'Profile already exists';
  end if;

  -- Check if username is taken
  if exists (
    select 1
    from profiles
    where username = p_username
  ) then
    raise exception 'Username already taken';
  end if;

  insert into profiles (
    id,
    avatar_url,
    username,
    first_name,
    last_name,
    dob,
    favorite_games,
    platforms,
    playstyle,
    availability,
    voice_chat,
    bio
  )
  values (
    v_user_id,
    p_avatar_url,
    p_username,
    p_first_name,
    p_last_name,
    p_dob,
    p_favorite_games,
    p_platforms,
    p_playstyle,
    p_availability,
    p_voice_chat,
    p_bio
  )
  returning * into new_row;

  return new_row;
end;
$function$;

