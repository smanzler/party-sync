


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "username" "text",
    "avatar_url" "text",
    "first_name" "text",
    "last_name" "text",
    "dob" timestamp with time zone,
    "favorite_games" "text"[] DEFAULT '{}'::"text"[],
    "platforms" "text"[] DEFAULT '{}'::"text"[],
    "playstyle" "text",
    "availability" "text"[] DEFAULT '{}'::"text"[],
    "voice_chat" "text",
    "bio" "text",
    CONSTRAINT "profiles_playstyle_check" CHECK (("playstyle" = ANY (ARRAY['casual'::"text", 'competitive'::"text", 'both'::"text"]))),
    CONSTRAINT "profiles_voice_chat_check" CHECK (("voice_chat" = ANY (ARRAY['yes'::"text", 'no'::"text", 'sometimes'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone) RETURNS "public"."profiles"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_user_id uuid := auth.uid();
  new_row profiles;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if p_username is null or length(trim(p_username)) < 3 then
    raise exception 'Invalid username';
  end if;

  if p_first_name is null then
    raise exception 'Invalid first name';
  end if;

  if p_last_name is null then
    raise exception 'Invalid last name';
  end if;

  if p_dob is null then
    raise exception 'Invalid date of birth';
  end if;

  if exists (
    select 1
    from profiles
    where username = p_username
  ) then
    raise exception 'Username already taken';
  end if;

  insert into profiles (id, avatar_url, username, first_name, last_name, dob)
  values (v_user_id, p_avatar_url, p_username, p_first_name, p_last_name, p_dob)
  returning * into new_row;

  return new_row;
end;
$$;


ALTER FUNCTION "public"."create_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text" DEFAULT NULL::"text", "p_last_name" "text" DEFAULT NULL::"text", "p_dob" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_favorite_games" "text"[] DEFAULT '{}'::"text"[], "p_platforms" "text"[] DEFAULT '{}'::"text"[], "p_playstyle" "text" DEFAULT NULL::"text", "p_availability" "text"[] DEFAULT '{}'::"text"[], "p_voice_chat" "text" DEFAULT NULL::"text", "p_bio" "text" DEFAULT NULL::"text") RETURNS "public"."profiles"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."create_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone, "p_favorite_games" "text"[], "p_platforms" "text"[], "p_playstyle" "text", "p_availability" "text"[], "p_voice_chat" "text", "p_bio" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone) RETURNS "public"."profiles"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."update_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_profile"("p_avatar_url" "text" DEFAULT NULL::"text", "p_username" "text" DEFAULT NULL::"text", "p_first_name" "text" DEFAULT NULL::"text", "p_last_name" "text" DEFAULT NULL::"text", "p_dob" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_favorite_games" "text"[] DEFAULT NULL::"text"[], "p_platforms" "text"[] DEFAULT NULL::"text"[], "p_playstyle" "text" DEFAULT NULL::"text", "p_availability" "text"[] DEFAULT NULL::"text"[], "p_voice_chat" "text" DEFAULT NULL::"text", "p_bio" "text" DEFAULT NULL::"text") RETURNS "public"."profiles"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."update_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone, "p_favorite_games" "text"[], "p_platforms" "text"[], "p_playstyle" "text", "p_availability" "text"[], "p_voice_chat" "text", "p_bio" "text") OWNER TO "postgres";


ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone, "p_favorite_games" "text"[], "p_platforms" "text"[], "p_playstyle" "text", "p_availability" "text"[], "p_voice_chat" "text", "p_bio" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone, "p_favorite_games" "text"[], "p_platforms" "text"[], "p_playstyle" "text", "p_availability" "text"[], "p_voice_chat" "text", "p_bio" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone, "p_favorite_games" "text"[], "p_platforms" "text"[], "p_playstyle" "text", "p_availability" "text"[], "p_voice_chat" "text", "p_bio" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone, "p_favorite_games" "text"[], "p_platforms" "text"[], "p_playstyle" "text", "p_availability" "text"[], "p_voice_chat" "text", "p_bio" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone, "p_favorite_games" "text"[], "p_platforms" "text"[], "p_playstyle" "text", "p_availability" "text"[], "p_voice_chat" "text", "p_bio" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_profile"("p_avatar_url" "text", "p_username" "text", "p_first_name" "text", "p_last_name" "text", "p_dob" timestamp with time zone, "p_favorite_games" "text"[], "p_platforms" "text"[], "p_playstyle" "text", "p_availability" "text"[], "p_voice_chat" "text", "p_bio" "text") TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







