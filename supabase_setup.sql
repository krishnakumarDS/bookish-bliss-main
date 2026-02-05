-- Enable Row Level Security (RLS) for all tables
alter table "public"."books" enable row level security;
alter table "public"."orders" enable row level security;

-- Create BOOKS table
create table if not exists "public"."books" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "author" text not null,
    "description" text,
    "price" numeric not null,
    "cover_image" text,
    "category" text,
    "isbn" text,
    "pages" integer,
    "published_date" date,
    "stock" integer default 0,
    "is_featured" boolean default false,
    "is_available" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);

alter table "public"."books" add constraint "books_pkey" primary key ("id");

-- Create PROFILES table (managed by Supabase Auth triggers usually, but explicit here)
create table if not exists "public"."profiles" (
    "id" uuid not null references auth.users(id) on delete cascade,
    "full_name" text,
    "email" text,
    "phone" text,
    "address" text,
    "city" text,
    "country" text,
    "postal_code" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    primary key ("id")
);

-- Create ORDERS table
create table if not exists "public"."orders" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null references auth.users(id),
    "total_amount" numeric not null,
    "status" text not null default 'pending', -- pending, paid, shipped, delivered, cancelled
    "shipping_address" text,
    "shipping_city" text,
    "shipping_country" text,
    "shipping_postal_code" text,
    "tracking_number" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    primary key ("id")
);

-- RLS POLICIES

-- BOOKS: Public read access
create policy "Books are viewable by everyone"
on "public"."books"
for select using (true);

-- PROFILES: Users can view and edit their own profile
create policy "Users can view own profile"
on "public"."profiles"
for select using (auth.uid() = id);

create policy "Users can update own profile"
on "public"."profiles"
for update using (auth.uid() = id);

create policy "Users can insert own profile"
on "public"."profiles"
for insert with check (auth.uid() = id);

-- ORDERS: Users can view their own orders
create policy "Users can view own orders"
on "public"."orders"
for select using (auth.uid() = user_id);

create policy "Users can create orders"
on "public"."orders"
for insert with check (auth.uid() = user_id);

-- SEED DATA (Optional - run only if table is empty)
insert into "public"."books" ("title", "author", "price", "category", "description", "stock", "is_featured", "cover_image")
values
('The Silent Patient', 'Alex Michaelides', 14.99, 'Mystery', 'A shocking psychological thriller.', 12, true, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80'),
('Dune', 'Frank Herbert', 19.99, 'Sci-Fi', 'The story of the boy Paul Atreides.', 5, true, 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&q=80'),
('Atomic Habits', 'James Clear', 16.99, 'Non-Fiction', 'A proven framework for improving every day.', 20, true, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80');

-- PROFILE TRIGGER (Auto-create profile on signup)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
