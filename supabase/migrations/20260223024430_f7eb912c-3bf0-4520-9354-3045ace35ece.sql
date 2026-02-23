
-- Drop existing permissive-style policies and recreate scoped to authenticated role
-- profiles
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by owner" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- projects
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- project_files
DROP POLICY IF EXISTS "Users can view own files" ON public.project_files;
DROP POLICY IF EXISTS "Users can create own files" ON public.project_files;
DROP POLICY IF EXISTS "Users can update own files" ON public.project_files;
DROP POLICY IF EXISTS "Users can delete own files" ON public.project_files;

CREATE POLICY "Users can view own files" ON public.project_files FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own files" ON public.project_files FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own files" ON public.project_files FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own files" ON public.project_files FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- user_notes
DROP POLICY IF EXISTS "Users can view own notes" ON public.user_notes;
DROP POLICY IF EXISTS "Users can create own notes" ON public.user_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.user_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.user_notes;

CREATE POLICY "Users can view own notes" ON public.user_notes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own notes" ON public.user_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.user_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.user_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- user_snippets
DROP POLICY IF EXISTS "Users can view own snippets" ON public.user_snippets;
DROP POLICY IF EXISTS "Users can create own snippets" ON public.user_snippets;
DROP POLICY IF EXISTS "Users can update own snippets" ON public.user_snippets;
DROP POLICY IF EXISTS "Users can delete own snippets" ON public.user_snippets;

CREATE POLICY "Users can view own snippets" ON public.user_snippets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own snippets" ON public.user_snippets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own snippets" ON public.user_snippets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own snippets" ON public.user_snippets FOR DELETE TO authenticated USING (auth.uid() = user_id);
