
  create table "public"."follows" (
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "target_user_id" uuid not null
      );


alter table "public"."follows" enable row level security;

CREATE UNIQUE INDEX follows_pkey ON public.follows USING btree (user_id, target_user_id);

alter table "public"."follows" add constraint "follows_pkey" PRIMARY KEY using index "follows_pkey";

alter table "public"."follows" add constraint "follows_target_user_id_fkey" FOREIGN KEY (target_user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."follows" validate constraint "follows_target_user_id_fkey";

alter table "public"."follows" add constraint "follows_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."follows" validate constraint "follows_user_id_fkey";

grant delete on table "public"."follows" to "anon";

grant insert on table "public"."follows" to "anon";

grant references on table "public"."follows" to "anon";

grant select on table "public"."follows" to "anon";

grant trigger on table "public"."follows" to "anon";

grant truncate on table "public"."follows" to "anon";

grant update on table "public"."follows" to "anon";

grant delete on table "public"."follows" to "authenticated";

grant insert on table "public"."follows" to "authenticated";

grant references on table "public"."follows" to "authenticated";

grant select on table "public"."follows" to "authenticated";

grant trigger on table "public"."follows" to "authenticated";

grant truncate on table "public"."follows" to "authenticated";

grant update on table "public"."follows" to "authenticated";

grant delete on table "public"."follows" to "postgres";

grant insert on table "public"."follows" to "postgres";

grant references on table "public"."follows" to "postgres";

grant select on table "public"."follows" to "postgres";

grant trigger on table "public"."follows" to "postgres";

grant truncate on table "public"."follows" to "postgres";

grant update on table "public"."follows" to "postgres";

grant delete on table "public"."follows" to "service_role";

grant insert on table "public"."follows" to "service_role";

grant references on table "public"."follows" to "service_role";

grant select on table "public"."follows" to "service_role";

grant trigger on table "public"."follows" to "service_role";

grant truncate on table "public"."follows" to "service_role";

grant update on table "public"."follows" to "service_role";


  create policy "Enable delete for users based on user_id"
  on "public"."follows"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable insert for users based on user_id"
  on "public"."follows"
  as permissive
  for insert
  to authenticated
with check (((( SELECT auth.uid() AS uid) = user_id) AND (target_user_id <> user_id)));



  create policy "Enable select for users based on user_id"
  on "public"."follows"
  as permissive
  for select
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



