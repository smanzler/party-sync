set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_friend_recommendations(p_max_results integer DEFAULT 10)
 RETURNS TABLE(recommended_id uuid, username text, avatar_url text, bio text, match_score integer)
 LANGUAGE plpgsql
AS $function$declare
  v_user_id uuid := auth.uid();
begin
    return query
    select
        p.id AS recommended_id,
        p.username,
        p.avatar_url,
        p.bio,
        (
            (
                select count(*)
                from unnest(p.favorite_games) g
                where g = any(cp.favorite_games)
            ) * 3
            +
            (
                select count(*)
                from unnest(p.platforms) pl
                where pl = any(cp.platforms)
            ) * 2
            +
            case
                when p.playstyle is not null
                and p.playstyle = cp.playstyle then 2
                else 0
            end
            +
            (
                select count(*)
                from unnest(p.availability) a
                where a = ANY(cp.availability)
            )
        )::int as match_score
    from
        public.profiles p
        cross join lateral (
            select * from public.profiles where id = v_user_id
        ) cp
    where
        p.id <> v_user_id
    order by
        match_score desc,
        p.created_at desc
    limit p_max_results;
end;$function$
;


