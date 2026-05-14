-- =============================================================================
-- NORVA — Migration 0004: Organization auto-creation trigger
-- Runs: after a new user signs up via Supabase Auth
-- Effect: Creates a corresponding organization record automatically
-- =============================================================================

-- Function: called by trigger after new auth.users row is inserted
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer           -- runs with owner privileges to INSERT into public schema
set search_path = public   -- prevents search_path injection
as $$
begin
  insert into public.organizations (
    owner_id,
    name,
    notification_email,
    plan,
    timezone
  )
  values (
    new.id,
    -- Use organization_name from signup metadata, fallback to email prefix
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'organization_name'), ''),
      split_part(new.email, '@', 1)
    ),
    new.email,
    'starter',
    'America/New_York'
  );
  return new;
exception
  when others then
    -- Log but don't block auth flow
    raise warning 'handle_new_user: failed to create org for user %: %', new.id, sqlerrm;
    return new;
end;
$$;

-- Trigger: fires after every new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Grant execute on the function to authenticated and anon roles
-- (not strictly required since security definer, but good hygiene)
grant execute on function public.handle_new_user() to authenticated, anon;
