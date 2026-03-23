alter table "public"."follows" enable row level security;

create policy "Anyone can view follow relationships"
on "public"."follows"
for select
to authenticated
using (true);