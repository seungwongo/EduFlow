-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. profiles (extends Supabase Auth users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique,
  avatar_url text,
  role text check (role in ('admin', 'instructor', 'student')) default 'student',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. seminars
create table seminars (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  category text,
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  format text check (format in ('online', 'offline', 'hybrid')),
  cover_image text,
  start_date date,
  end_date date,
  location text,
  online_link text,
  max_participants int,
  curriculum jsonb,
  status text check (status in ('draft', 'published', 'ongoing', 'completed')) default 'draft',
  created_by uuid references profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. curriculum
create table curriculum (
  id uuid primary key default uuid_generate_v4(),
  seminar_id uuid references seminars(id) on delete cascade,
  week int not null,
  title text not null,
  content text,
  gpt_suggestion text,
  materials jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(seminar_id, week)
);

-- 4. participants
create table participants (
  id uuid primary key default uuid_generate_v4(),
  seminar_id uuid references seminars(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  status text check (status in ('pending', 'approved', 'rejected', 'withdrawn')) default 'pending',
  application_text text,
  applied_at timestamp with time zone default now(),
  approved_at timestamp with time zone,
  approved_by uuid references profiles(id),
  unique(seminar_id, user_id)
);

-- 5. attendance
create table attendance (
  id uuid primary key default uuid_generate_v4(),
  participant_id uuid references participants(id) on delete cascade,
  seminar_id uuid references seminars(id) on delete cascade,
  week int not null,
  is_present boolean default false,
  checked_at timestamp with time zone default now(),
  unique(participant_id, week)
);

-- 6. assignments
create table assignments (
  id uuid primary key default uuid_generate_v4(),
  curriculum_id uuid references curriculum(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- 7. assignment_submissions
create table assignment_submissions (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid references assignments(id) on delete cascade,
  participant_id uuid references participants(id) on delete cascade,
  submission_text text,
  submission_file text,
  grade text,
  ai_feedback text,
  submitted_at timestamp with time zone default now(),
  graded_at timestamp with time zone,
  unique(assignment_id, participant_id)
);

-- 8. notices
create table notices (
  id uuid primary key default uuid_generate_v4(),
  seminar_id uuid references seminars(id) on delete cascade,
  title text not null,
  content text,
  is_pinned boolean default false,
  created_by uuid references profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- 9. feedback
create table feedback (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  seminar_id uuid references seminars(id) on delete cascade,
  rating int check (rating >= 1 and rating <= 5),
  content text,
  created_at timestamp with time zone default now()
);

-- 10. faq
create table faq (
  id uuid primary key default uuid_generate_v4(),
  question text not null,
  answer text not null,
  category text,
  sort_order int default 0,
  created_at timestamp with time zone default now()
);

-- 11. email_logs
create table email_logs (
  id uuid primary key default uuid_generate_v4(),
  recipient_id uuid references profiles(id) on delete set null,
  seminar_id uuid references seminars(id) on delete set null,
  email_type text not null,
  subject text,
  status text check (status in ('pending', 'sent', 'failed')) default 'pending',
  error_message text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Row Level Security (RLS) Policies
alter table profiles enable row level security;
alter table seminars enable row level security;
alter table curriculum enable row level security;
alter table participants enable row level security;
alter table attendance enable row level security;
alter table assignments enable row level security;
alter table assignment_submissions enable row level security;
alter table notices enable row level security;
alter table feedback enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Seminars policies
create policy "Published seminars are viewable by everyone" on seminars
  for select using (status in ('published', 'ongoing', 'completed'));

create policy "Users can create seminars" on seminars
  for insert with check (auth.uid() = created_by);

create policy "Users can update own seminars" on seminars
  for update using (auth.uid() = created_by);

create policy "Users can delete own seminars" on seminars
  for delete using (auth.uid() = created_by);

-- Participants policies
create policy "Participants can view own applications" on participants
  for select using (auth.uid() = user_id);

create policy "Seminar creators can view all participants" on participants
  for select using (
    exists (
      select 1 from seminars 
      where seminars.id = participants.seminar_id 
      and seminars.created_by = auth.uid()
    )
  );

create policy "Users can apply to seminars" on participants
  for insert with check (auth.uid() = user_id);

-- Curriculum policies
create policy "Public curriculum for published seminars" on curriculum
  for select using (
    exists (
      select 1 from seminars 
      where seminars.id = curriculum.seminar_id 
      and seminars.status in ('published', 'ongoing', 'completed')
    )
  );

create policy "Seminar creators can manage curriculum" on curriculum
  for all using (
    exists (
      select 1 from seminars 
      where seminars.id = curriculum.seminar_id 
      and seminars.created_by = auth.uid()
    )
  );

-- Create indexes for performance
create index idx_seminars_created_by on seminars(created_by);
create index idx_seminars_status on seminars(status);
create index idx_participants_seminar_id on participants(seminar_id);
create index idx_participants_user_id on participants(user_id);
create index idx_curriculum_seminar_id on curriculum(seminar_id);
create index idx_attendance_participant_id on attendance(participant_id);
create index idx_notices_seminar_id on notices(seminar_id);

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to tables
create trigger update_profiles_updated_at before update on profiles
  for each row execute function update_updated_at_column();

create trigger update_seminars_updated_at before update on seminars
  for each row execute function update_updated_at_column();

create trigger update_curriculum_updated_at before update on curriculum
  for each row execute function update_updated_at_column();