-- Create a function to automatically insert users into public.users table
-- when they are created in auth.users
create or replace function public.handle_new_user()
returns trigger
security definer set search_path = public
language plpgsql
as $$
begin
  insert into public.users (
    id,
    email,
    full_name,
    role,
    phone,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    'maklare', -- Default role, can be changed later
    new.raw_user_meta_data->>'phone',
    now(),
    now()
  );
  return new;
end;
$$;

-- Create trigger to run the function when a new user is inserted into auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant select, insert, update on public.users to authenticated;