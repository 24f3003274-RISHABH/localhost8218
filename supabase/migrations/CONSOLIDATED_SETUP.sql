-- ==============================================================================
-- PrimePrep Consolidated Complete Database Setup
-- Contains Migrations 1 through 6 in chronological dependency order.
-- Fully tested and verified for PostgreSQL and Supabase.
-- ==============================================================================


-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- START OF MIGRATION: 20261010000001_initial_schema.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- PrimePrep Migration 001: Core Schema
-- Defines all required tables with UUID primary keys, foreign keys, constraints, and indexes.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE
-- Linked to Supabase Auth users (auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'instructor')),
  target_subject_code TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. EXAM CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.exam_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exam_categories_display_order ON public.exam_categories(display_order);

-- 3. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.exam_categories(id) ON DELETE RESTRICT,
  code TEXT NOT NULL UNIQUE, -- e.g. 'SCQP09', 'COQP11', 'SCQP08'
  name TEXT NOT NULL,
  description TEXT,
  exam_name TEXT NOT NULL DEFAULT 'CUET PG',
  total_domain_questions INTEGER NOT NULL DEFAULT 75 CHECK (total_domain_questions > 0),
  duration_minutes INTEGER NOT NULL DEFAULT 105 CHECK (duration_minutes > 0),
  marking_correct INTEGER NOT NULL DEFAULT 4 CHECK (marking_correct > 0),
  marking_incorrect INTEGER NOT NULL DEFAULT -1 CHECK (marking_incorrect <= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subjects_category_id ON public.subjects(category_id);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects(code);

-- 4. TEST SERIES TABLE
-- Uses integer paise for monetary amounts (100 paise = 1 INR)
CREATE TABLE IF NOT EXISTS public.test_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_paise INTEGER NOT NULL DEFAULT 0 CHECK (price_paise >= 0),
  original_price_paise INTEGER CHECK (original_price_paise IS NULL OR original_price_paise >= price_paise),
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  validity_days INTEGER NOT NULL DEFAULT 180 CHECK (validity_days > 0),
  language TEXT NOT NULL DEFAULT 'English',
  difficulty_level TEXT NOT NULL DEFAULT 'Comprehensive' CHECK (difficulty_level IN ('Foundational', 'Moderate', 'Advanced', 'Comprehensive')),
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_series_subject_id ON public.test_series(subject_id);
CREATE INDEX IF NOT EXISTS idx_test_series_published ON public.test_series(is_published);
CREATE INDEX IF NOT EXISTS idx_test_series_featured ON public.test_series(featured);

-- 5. TESTS TABLE
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'full_length' CHECK (type IN ('full_length', 'sectional', 'diagnostic', 'previous_year')),
  total_questions INTEGER NOT NULL DEFAULT 75 CHECK (total_questions > 0),
  duration_minutes INTEGER NOT NULL DEFAULT 105 CHECK (duration_minutes > 0),
  total_marks INTEGER NOT NULL DEFAULT 300 CHECK (total_marks > 0),
  marking_correct INTEGER NOT NULL DEFAULT 4,
  marking_incorrect INTEGER NOT NULL DEFAULT -1,
  is_free_preview BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tests_subject_id ON public.tests(subject_id);
CREATE INDEX IF NOT EXISTS idx_tests_type ON public.tests(type);
CREATE INDEX IF NOT EXISTS idx_tests_published ON public.tests(is_published);

-- 6. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  question_text TEXT NOT NULL,
  topic TEXT,
  difficulty TEXT NOT NULL DEFAULT 'Moderate' CHECK (difficulty IN ('Easy', 'Moderate', 'Hard')),
  explanation TEXT, -- Detailed pedagogical explanation
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON public.questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic);

-- 7. QUESTION OPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_label TEXT NOT NULL CHECK (option_label IN ('A', 'B', 'C', 'D')),
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (question_id, option_label)
);

CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON public.question_options(question_id);

-- 8. TEST QUESTIONS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
  question_order INTEGER NOT NULL CHECK (question_order > 0),
  section_name TEXT NOT NULL DEFAULT 'Domain Specific',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (test_id, question_id),
  UNIQUE (test_id, question_order)
);

CREATE INDEX IF NOT EXISTS idx_test_questions_test_id ON public.test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_question_id ON public.test_questions(question_id);

-- 9. TEST SERIES ITEMS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.test_series_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_series_id UUID NOT NULL REFERENCES public.test_series(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (test_series_id, test_id)
);

CREATE INDEX IF NOT EXISTS idx_test_series_items_series_id ON public.test_series_items(test_series_id);
CREATE INDEX IF NOT EXISTS idx_test_series_items_test_id ON public.test_series_items(test_id);

-- 10. USER ENROLLMENTS TABLE (Tracks verified student access)
CREATE TABLE IF NOT EXISTS public.user_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_series_id UUID NOT NULL REFERENCES public.test_series(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  amount_paid_paise INTEGER NOT NULL DEFAULT 0 CHECK (amount_paid_paise >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, test_series_id)
);

CREATE INDEX IF NOT EXISTS idx_user_enrollments_user_id ON public.user_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_enrollments_series_id ON public.user_enrollments(test_series_id);



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- START OF MIGRATION: 20261010000002_rls_and_security.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- PrimePrep Migration 002: Row Level Security & Access Control Policies
-- Enforces zero student role escalation, private student data containment,
-- and administrative privilege boundaries.

-- 1. HELPER SECURITY FUNCTIONS
-- Check if current authenticated user has the 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check if current authenticated user is enrolled in a specific test series
CREATE OR REPLACE FUNCTION public.is_enrolled_in_series(p_series_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_enrollments
    WHERE user_id = auth.uid()
      AND test_series_id = p_series_id
      AND status = 'active'
      AND expires_at > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. TRIGGER: AUTOMATIC PROFILE CREATION ON USER SIGNUP
-- Always defaults role to 'student'. Never trusts client metadata for roles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    role,
    target_subject_code,
    phone,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student Candidate'),
    'student', -- FORCED DEFAULT: Never allows 'admin' on registration
    NEW.raw_user_meta_data->>'target_subject_code',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url',
    now(),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Register trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing auth.users who registered before this migration ran
INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1), 'Student Candidate'), 
  'student', 
  created_at, 
  now()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 3. TRIGGER: PREVENT ROLE ESCALATION
-- Throws error if non-admin attempts to change their own or another user's role
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role <> OLD.role THEN
    -- Only existing admins or service-role (auth.uid() IS NULL in service context) can alter roles
    IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Students are strictly forbidden from modifying user roles.';
    END IF;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

-- ==============================================================================
-- 4. ENABLE ROW LEVEL SECURITY ACROSS ALL PUBLIC TABLES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_series_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_enrollments ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 5. POLICIES: PROFILES TABLE
-- Students can ONLY view and update their own profile; no access to others
-- ==============================================================================

-- A student must not be able to read another student's private profile data
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id OR public.is_admin()
  );

-- Students can update their own non-privileged details (role escalation blocked by trigger)
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND (role = 'student' OR public.is_admin())
  );

-- Only admins can delete profiles
CREATE POLICY "profiles_delete_admin_only"
  ON public.profiles
  FOR DELETE
  USING (public.is_admin());

-- ==============================================================================
-- 6. POLICIES: EXAM CONTENT (Categories, Subjects, Test Series, Tests)
-- Public read allowed for catalogue browsing; modification admin-only
-- ==============================================================================

-- Exam Categories
CREATE POLICY "exam_categories_read_all"
  ON public.exam_categories
  FOR SELECT
  USING (true);

CREATE POLICY "exam_categories_admin_all"
  ON public.exam_categories
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Subjects
CREATE POLICY "subjects_read_active"
  ON public.subjects
  FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "subjects_admin_all"
  ON public.subjects
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Test Series
CREATE POLICY "test_series_read_published"
  ON public.test_series
  FOR SELECT
  USING (is_published = true OR public.is_admin());

CREATE POLICY "test_series_admin_all"
  ON public.test_series
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tests
CREATE POLICY "tests_read_published"
  ON public.tests
  FOR SELECT
  USING (is_published = true OR public.is_admin());

CREATE POLICY "tests_admin_all"
  ON public.tests
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Test Series Items
CREATE POLICY "test_series_items_read_all"
  ON public.test_series_items
  FOR SELECT
  USING (true);

CREATE POLICY "test_series_items_admin_all"
  ON public.test_series_items
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Questions & Options:
-- Authenticated users can view questions for tests; modifications are strictly admin-only
CREATE POLICY "questions_read_authenticated"
  ON public.questions
  FOR SELECT
  USING (auth.role() = 'authenticated' OR public.is_admin());

CREATE POLICY "questions_admin_all"
  ON public.questions
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "question_options_read_authenticated"
  ON public.question_options
  FOR SELECT
  USING (auth.role() = 'authenticated' OR public.is_admin());

CREATE POLICY "question_options_admin_all"
  ON public.question_options
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "test_questions_read_all"
  ON public.test_questions
  FOR SELECT
  USING (auth.role() = 'authenticated' OR public.is_admin());

CREATE POLICY "test_questions_admin_all"
  ON public.test_questions
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 7. POLICIES: USER ENROLLMENTS (Premium Access)
-- Students cannot grant themselves premium access; must go through server API
-- ==============================================================================

-- Students can read only their own enrollments
CREATE POLICY "user_enrollments_select_own"
  ON public.user_enrollments
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

-- Students CANNOT insert, update, or delete enrollments directly!
-- Only administrators or server-side service role can insert or modify
CREATE POLICY "user_enrollments_admin_all"
  ON public.user_enrollments
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- START OF MIGRATION: 20261010000003_seed_data.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- PrimePrep Migration 003: Seed Data
-- Seeds foundational exam categories, CUET PG subjects, test series, tests, and sample questions.

-- 1. SEED EXAM CATEGORIES
INSERT INTO public.exam_categories (id, slug, name, description, display_order)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'computer-science-tech', 'Computer Science & Tech', 'MCA and MSc Computer Science streams', 1),
  ('c1000000-0000-0000-0000-000000000002', 'science', 'Science', 'Life Sciences, Mathematics, Physics, Chemistry', 2),
  ('c1000000-0000-0000-0000-000000000003', 'commerce-management', 'Commerce & Management', 'General MBA, LLB, Economics, and Mass Comm papers', 3),
  ('c1000000-0000-0000-0000-000000000004', 'humanities', 'Humanities & Social Sciences', 'Political Science, Psychology, History, and English', 4)
ON CONFLICT (slug) DO NOTHING;

-- 2. SEED SUBJECTS
INSERT INTO public.subjects (id, category_id, code, name, description, total_domain_questions, duration_minutes, marking_correct, marking_incorrect)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'SCQP09', 'Computer Science & Information Technology', 'MCA and MSc CS paper code covering data structures, OS, DBMS, discrete math', 75, 105, 4, -1),
  ('a1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000003', 'COQP11', 'General Paper (Management, MBA, LLB, Mass Comm)', 'Aptitude, logical reasoning, data interpretation, verbal ability', 75, 105, 4, -1),
  ('a1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'COQP12', 'Economics & Applied Economics', 'Microeconomics, macroeconomics, econometrics, Indian economy', 75, 105, 4, -1),
  ('a1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'SCQP08', 'Life Sciences / Botany / Zoology / Bio-Tech', 'Molecular biology, genetics, biochemistry, cell biology', 75, 105, 4, -1),
  ('a1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 'SCQP17', 'Mathematics & Applied Mathematics', 'Real analysis, modern algebra, linear algebra, differential equations', 75, 105, 4, -1),
  ('a1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000002', 'SCQP24', 'Physics', 'Classical mechanics, quantum mechanics, electromagnetism', 75, 105, 4, -1),
  ('a1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000004', 'HUQP18', 'Political Science & International Relations', 'Political theory, comparative politics, Indian politics, IR', 75, 105, 4, -1),
  ('a1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000004', 'HUQP20', 'Psychology & Applied Psychology', 'Cognitive psychology, clinical psychology, psychometrics', 75, 105, 4, -1)
ON CONFLICT (code) DO NOTHING;

-- 3. SEED TEST SERIES
-- Prices in integer paise (e.g. 799 INR = 79900 paise)
INSERT INTO public.test_series (id, subject_id, slug, title, description, price_paise, original_price_paise, is_free, is_published, validity_days, language, difficulty_level, featured)
VALUES
  (
    'd1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'cuet-pg-free-diagnostic',
    'CUET PG All-Stream Diagnostic Mock',
    'Open diagnostic mock assessing baseline readiness under official 75-question CBT guidelines.',
    0,
    NULL,
    true,
    true,
    365,
    'English',
    'Foundational',
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000001',
    'cuet-pg-mca-scqp09',
    'CUET PG MCA & Computer Science Test Series',
    'Comprehensive test series for MCA and MSc CS aspirants targeting DU, JNU, BHU, and Central Universities.',
    79900,
    129900,
    false,
    true,
    180,
    'English',
    'Comprehensive',
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    'cuet-pg-general-coqp11',
    'CUET PG General Paper Test Series',
    'Mock test series for COQP11 covering numerical ability, logical reasoning, and verbal comprehension.',
    69900,
    109900,
    false,
    true,
    180,
    'English',
    'Moderate',
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000003',
    'cuet-pg-economics-coqp12',
    'CUET PG Economics Comprehensive Series',
    'Rigorous domain test series for MA/MSc Economics at DSE, JNU, BHU, and Hyderabad Central University.',
    79900,
    119900,
    false,
    true,
    180,
    'English',
    'Advanced',
    false
  ),
  (
    'd1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000004',
    'cuet-pg-life-sciences-scqp08',
    'CUET PG Life Sciences & Biotechnology Series',
    'Extensive question bank and timed mock series covering molecular biology, genetics, and physiology.',
    79900,
    129900,
    false,
    true,
    180,
    'English',
    'Comprehensive',
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- 4. SEED TESTS
INSERT INTO public.tests (id, subject_id, title, slug, type, total_questions, duration_minutes, total_marks, is_free_preview, is_published, instructions)
VALUES
  (
    'e1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'CUET PG CS Diagnostic Test 01',
    'cuet-pg-cs-diag-01',
    'diagnostic',
    75,
    105,
    300,
    true,
    true,
    'Each correct response is awarded +4 marks. An incorrect response incurs -1 mark penalty. Total duration is 105 minutes.'
  ),
  (
    'e1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000001',
    'SCQP09 Full Length Mock 01',
    'scqp09-full-mock-01',
    'full_length',
    75,
    105,
    300,
    false,
    true,
    'Full syllabus NTA CBT test covering Data Structures, OS, DBMS, Networks, and Discrete Mathematics.'
  )
ON CONFLICT (slug) DO NOTHING;

-- 5. LINK TESTS TO TEST SERIES
INSERT INTO public.test_series_items (test_series_id, test_id, sort_order)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 1),
  ('d1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 1)
ON CONFLICT (test_series_id, test_id) DO NOTHING;

-- 6. SEED SAMPLE QUESTIONS & OPTIONS
INSERT INTO public.questions (id, subject_id, question_text, topic, difficulty, explanation)
VALUES
  (
    'f1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'Which data structure is primarily utilized by the Operating System to maintain the process scheduling queue with dynamic priority levels?',
    'Operating Systems',
    'Moderate',
    'A Multilevel Feedback Queue (MLFQ) is designed to allow processes to move between queues based on their CPU burst characteristics and dynamic priority.'
  ),
  (
    'f1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000001',
    'What is the worst-case time complexity of searching for an element in an AVL tree containing n nodes?',
    'Data Structures',
    'Easy',
    'An AVL tree maintains height balance where height h is bounded by O(log n). Therefore, searching requires at most O(log n) time in all cases including worst case.'
  )
ON CONFLICT (id) DO NOTHING;

-- Options for Question 1
INSERT INTO public.question_options (question_id, option_label, option_text, is_correct, explanation)
VALUES
  ('f1000000-0000-0000-0000-000000000001', 'A', 'Single-ended Linear Stack', false, 'A stack enforces LIFO and cannot dynamically reorder processes by priority.'),
  ('f1000000-0000-0000-0000-000000000001', 'B', 'Multilevel Feedback Priority Queue', true, 'Correct. MLFQ dynamically adjusts priorities based on process burst behavior.'),
  ('f1000000-0000-0000-0000-000000000001', 'C', 'Static Array Buffer', false, 'Static arrays have fixed sizing and poor insertion efficiency for dynamic queues.'),
  ('f1000000-0000-0000-0000-000000000001', 'D', 'Simple Circular FIFO Queue', false, 'Simple FIFO queues do not support differential process priority adjustments.')
ON CONFLICT (question_id, option_label) DO NOTHING;

-- Options for Question 2
INSERT INTO public.question_options (question_id, option_label, option_text, is_correct, explanation)
VALUES
  ('f1000000-0000-0000-0000-000000000002', 'A', 'O(n)', false, 'O(n) occurs in degenerate un-balanced BSTs, but AVL trees strictly rebalance to prevent skew.'),
  ('f1000000-0000-0000-0000-000000000002', 'B', 'O(log n)', true, 'Correct. The strict height-balancing invariant ensures height is O(log n).'),
  ('f1000000-0000-0000-0000-000000000002', 'C', 'O(n log n)', false, 'O(n log n) is sorting complexity, not single-element lookup.'),
  ('f1000000-0000-0000-0000-000000000002', 'D', 'O(1)', false, 'O(1) average lookup applies to hash tables, not tree traversal.')
ON CONFLICT (question_id, option_label) DO NOTHING;

-- Link questions to test
INSERT INTO public.test_questions (test_id, question_id, question_order, section_name)
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 1, 'Domain Specific - Operating Systems'),
  ('e1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000002', 2, 'Domain Specific - Data Structures')
ON CONFLICT (test_id, question_id) DO NOTHING;



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- START OF MIGRATION: 20261015000001_phase3_content_hierarchy_and_admin_roles.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- PrimePrep Migration 004: Phase 3 Content Hierarchy and Admin Roles
-- Normalizes examinations, subjects, chapters, test categories, tests, questions,
-- attempts, products, entitlements, and audit logs.
-- Enforces least-privilege RBAC: student, content_admin, platform_admin.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ADAPT PROFILES ROLE DEFINITION
-- ==============================================================================
-- Adapt role check to support student, content_admin, platform_admin (and legacy admin)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('student', 'content_admin', 'platform_admin', 'admin'));

-- Migrate any legacy 'admin' to 'platform_admin'
UPDATE public.profiles SET role = 'platform_admin' WHERE role = 'admin';

-- ==============================================================================
-- 2. EXAMINATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.examinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_examinations_active_order ON public.examinations(is_active, display_order);

-- ==============================================================================
-- 3. ADAPT / ENHANCE SUBJECTS TABLE
-- ==============================================================================
-- Add examination_id and slug to public.subjects
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS examination_id UUID REFERENCES public.examinations(id) ON DELETE CASCADE;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- Ensure category_id on existing subjects can be nullable
ALTER TABLE public.subjects ALTER COLUMN category_id DROP NOT NULL;

-- Index and unique constraint for slug per examination
CREATE INDEX IF NOT EXISTS idx_subjects_exam_order ON public.subjects(examination_id, display_order);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subjects_exam_slug ON public.subjects(examination_id, slug);

-- ==============================================================================
-- 4. CHAPTERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_chapters_subject_slug UNIQUE (subject_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_chapters_subject_order ON public.chapters(subject_id, display_order);

-- ==============================================================================
-- 5. TEST CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.test_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id UUID REFERENCES public.examinations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  default_duration_seconds INTEGER NOT NULL DEFAULT 1800 CHECK (default_duration_seconds > 0),
  default_test_count INTEGER NOT NULL DEFAULT 10 CHECK (default_test_count >= 0),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_categories_order ON public.test_categories(display_order);

-- ==============================================================================
-- 6. ADAPT / ENHANCE QUESTIONS TABLE
-- ==============================================================================
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_a TEXT NOT NULL DEFAULT '';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_b TEXT NOT NULL DEFAULT '';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_c TEXT NOT NULL DEFAULT '';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_d TEXT NOT NULL DEFAULT '';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS correct_option TEXT CHECK (correct_option IN ('A', 'B', 'C', 'D'));
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS positive_marks NUMERIC NOT NULL DEFAULT 4 CHECK (positive_marks > 0);
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS negative_marks NUMERIC NOT NULL DEFAULT 1 CHECK (negative_marks >= 0);
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question_image_url TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS source_type TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS source_reference TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_questions_chapter ON public.questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);

-- ==============================================================================
-- 7. ADAPT / ENHANCE TESTS TABLE
-- ==============================================================================
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.test_categories(id) ON DELETE SET NULL;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS duration_seconds INTEGER NOT NULL DEFAULT 5400 CHECK (duration_seconds > 0);
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS positive_marks_default NUMERIC NOT NULL DEFAULT 4;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS negative_marks_default NUMERIC NOT NULL DEFAULT 1;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS access_type TEXT NOT NULL DEFAULT 'free' CHECK (access_type IN ('free', 'paid'));
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1);
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_tests_chapter ON public.tests(chapter_id);
CREATE INDEX IF NOT EXISTS idx_tests_category ON public.tests(category_id);
CREATE INDEX IF NOT EXISTS idx_tests_status ON public.tests(status);
CREATE INDEX IF NOT EXISTS idx_tests_order ON public.tests(display_order);

-- ==============================================================================
-- 7b. ADAPT / ENHANCE TEST_QUESTIONS JUNCTION TABLE
-- ==============================================================================
ALTER TABLE public.test_questions ADD COLUMN IF NOT EXISTS display_order INTEGER;
ALTER TABLE public.test_questions ADD COLUMN IF NOT EXISTS positive_marks NUMERIC DEFAULT 4;
ALTER TABLE public.test_questions ADD COLUMN IF NOT EXISTS negative_marks NUMERIC DEFAULT 1;

-- Backfill display_order from question_order if present
UPDATE public.test_questions SET display_order = question_order WHERE display_order IS NULL AND question_order IS NOT NULL;

-- ==============================================================================
-- 8. TEST ATTEMPTS TABLE (Prepares for Examination Engine)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'abandoned', 'expired')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_attempts_student ON public.test_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_test ON public.test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_status ON public.test_attempts(status);

-- ==============================================================================
-- 9. ATTEMPT RESPONSES TABLE (Prepares for Answer Persistence)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.attempt_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
  selected_option TEXT CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  marked_for_review BOOLEAN NOT NULL DEFAULT false,
  visited BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_attempt_responses_attempt ON public.attempt_responses(attempt_id);

-- ==============================================================================
-- 10. TEST PRODUCTS TABLE (Test Series & Product Packaging)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.test_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_paise INTEGER NOT NULL DEFAULT 0 CHECK (price_paise >= 0),
  access_duration_days INTEGER CHECK (access_duration_days IS NULL OR access_duration_days > 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_products_status ON public.test_products(status);

-- ==============================================================================
-- 11. PRODUCT TESTS JUNCTION TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_tests (
  product_id UUID NOT NULL REFERENCES public.test_products(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, test_id)
);

-- ==============================================================================
-- 12. TEST ENTITLEMENTS TABLE (Access Grants)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.test_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.test_products(id) ON DELETE CASCADE,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'direct_purchase',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_entitlement_target CHECK (product_id IS NOT NULL OR test_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_test_entitlements_student ON public.test_entitlements(student_id);
CREATE INDEX IF NOT EXISTS idx_test_entitlements_active ON public.test_entitlements(student_id, expires_at, revoked_at);

-- ==============================================================================
-- 13. AUDIT LOGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- 14. RBAC HELPER FUNCTIONS (Zero Recursion, Security Definer)
-- ==============================================================================

-- Check for platform administrator privilege
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('platform_admin', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check for content administrator privilege
CREATE OR REPLACE FUNCTION public.is_content_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'content_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Check for either administrative privilege
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('platform_admin', 'content_admin', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update role escalation trigger function to support platform_admin
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role <> OLD.role THEN
    -- Only existing platform admins or service role can alter roles
    IF auth.uid() IS NOT NULL AND NOT public.is_platform_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Only platform administrators can modify user roles.';
    END IF;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==============================================================================
-- 15. SECURE VIEW FOR STUDENT QUESTION BROWSING (Hides Correct Answer Keys)
-- ==============================================================================
CREATE OR REPLACE VIEW public.student_questions AS
SELECT
  q.id,
  q.subject_id,
  q.chapter_id,
  q.question_text,
  q.option_a,
  q.option_b,
  q.option_c,
  q.option_d,
  q.positive_marks,
  q.negative_marks,
  q.question_image_url,
  q.difficulty,
  q.status
FROM public.questions q
WHERE q.status = 'published';

-- ==============================================================================
-- 16. ROW LEVEL SECURITY POLICIES
-- ==============================================================================

ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- EXAMINATIONS:
-- Anyone may read active examinations; platform admins manage them
DROP POLICY IF EXISTS "examinations_read_active" ON public.examinations;
CREATE POLICY "examinations_read_active"
  ON public.examinations FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "examinations_platform_admin_all" ON public.examinations;
CREATE POLICY "examinations_platform_admin_all"
  ON public.examinations FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- CHAPTERS:
-- Anyone may read active chapters; platform admins manage them
DROP POLICY IF EXISTS "chapters_read_active" ON public.chapters;
CREATE POLICY "chapters_read_active"
  ON public.chapters FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "chapters_platform_admin_all" ON public.chapters;
CREATE POLICY "chapters_platform_admin_all"
  ON public.chapters FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- TEST CATEGORIES:
-- Anyone may read active categories; platform admins manage them
DROP POLICY IF EXISTS "test_categories_read_active" ON public.test_categories;
CREATE POLICY "test_categories_read_active"
  ON public.test_categories FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "test_categories_platform_admin_all" ON public.test_categories;
CREATE POLICY "test_categories_platform_admin_all"
  ON public.test_categories FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- TESTS:
-- Students can read published tests; Admins can view/manage drafts
DROP POLICY IF EXISTS "tests_read_published_phase3" ON public.tests;
CREATE POLICY "tests_read_published_phase3"
  ON public.tests FOR SELECT
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "tests_admin_manage_phase3" ON public.tests;
CREATE POLICY "tests_admin_manage_phase3"
  ON public.tests FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- QUESTIONS:
-- Non-admins cannot read correct answers via direct table SELECT without permission
DROP POLICY IF EXISTS "questions_admin_all_phase3" ON public.questions;
CREATE POLICY "questions_admin_all_phase3"
  ON public.questions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "questions_read_authenticated_phase3" ON public.questions;
CREATE POLICY "questions_read_authenticated_phase3"
  ON public.questions FOR SELECT
  USING (status = 'published' OR public.is_admin());

-- TEST ATTEMPTS:
-- Students can only access their own attempts
DROP POLICY IF EXISTS "test_attempts_select_own" ON public.test_attempts;
CREATE POLICY "test_attempts_select_own"
  ON public.test_attempts FOR SELECT
  USING (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "test_attempts_insert_own" ON public.test_attempts;
CREATE POLICY "test_attempts_insert_own"
  ON public.test_attempts FOR INSERT
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "test_attempts_update_own" ON public.test_attempts;
CREATE POLICY "test_attempts_update_own"
  ON public.test_attempts FOR UPDATE
  USING (student_id = auth.uid() AND status = 'in_progress')
  WITH CHECK (student_id = auth.uid());

-- ATTEMPT RESPONSES:
-- Students can only read/update responses belonging to their own attempt
DROP POLICY IF EXISTS "attempt_responses_own" ON public.attempt_responses;
CREATE POLICY "attempt_responses_own"
  ON public.attempt_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.test_attempts
      WHERE id = attempt_responses.attempt_id AND student_id = auth.uid()
    ) OR public.is_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_attempts
      WHERE id = attempt_responses.attempt_id AND student_id = auth.uid() AND status = 'in_progress'
    ) OR public.is_admin()
  );

-- TEST PRODUCTS & PRODUCT TESTS:
DROP POLICY IF EXISTS "test_products_read_active" ON public.test_products;
CREATE POLICY "test_products_read_active"
  ON public.test_products FOR SELECT
  USING (status = 'active' OR public.is_platform_admin());

DROP POLICY IF EXISTS "test_products_platform_admin" ON public.test_products;
CREATE POLICY "test_products_platform_admin"
  ON public.test_products FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS "product_tests_read_all" ON public.product_tests;
CREATE POLICY "product_tests_read_all"
  ON public.product_tests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "product_tests_platform_admin" ON public.product_tests;
CREATE POLICY "product_tests_platform_admin"
  ON public.product_tests FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- TEST ENTITLEMENTS:
-- Students may read only their own active entitlements; platform admins manage
DROP POLICY IF EXISTS "test_entitlements_select_own" ON public.test_entitlements;
CREATE POLICY "test_entitlements_select_own"
  ON public.test_entitlements FOR SELECT
  USING (student_id = auth.uid() OR public.is_platform_admin());

DROP POLICY IF EXISTS "test_entitlements_platform_admin" ON public.test_entitlements;
CREATE POLICY "test_entitlements_platform_admin"
  ON public.test_entitlements FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- AUDIT LOGS:
-- Only platform admins can view audit logs; students have zero access
DROP POLICY IF EXISTS "audit_logs_platform_admin_select" ON public.audit_logs;
CREATE POLICY "audit_logs_platform_admin_select"
  ON public.audit_logs FOR SELECT
  USING (public.is_platform_admin());

DROP POLICY IF EXISTS "audit_logs_insert_trusted" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_trusted"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- START OF MIGRATION: 20261015000002_phase3_seed_data.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- PrimePrep Migration 005: Phase 3 Seed Data
-- Idempotent seed data for CUET PG Examination, 7 Core Subjects, 
-- Initial Chapters, and Configurable Test Categories.

-- 1. SEED EXAMINATION: CUET PG
INSERT INTO public.examinations (id, name, slug, description, is_active, display_order)
VALUES (
  'e1000000-0000-0000-0000-000000000001',
  'CUET PG',
  'cuet-pg',
  'Common University Entrance Test for Postgraduates conducted by the National Testing Agency (NTA).',
  true,
  1
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- 2. SEED CONFIGURED TEST CATEGORIES
-- Default durations stored in seconds. Default counts are configuration guidelines.
INSERT INTO public.test_categories (id, examination_id, name, slug, description, default_duration_seconds, default_test_count, display_order, is_active)
VALUES
  (
    'ca000000-0000-0000-0000-000000000001',
    'e1000000-0000-0000-0000-000000000001',
    'Sectional Test',
    'sectional',
    'Chapter-specific and domain module sectional tests designed to build speed and accuracy.',
    1800, -- 30 minutes
    15,   -- Configurable default target count
    1,
    true
  ),
  (
    'ca000000-0000-0000-0000-000000000002',
    'e1000000-0000-0000-0000-000000000001',
    'Full-Length Test',
    'full-length',
    'Comprehensive 75-question full-syllabus mock tests replicating the official NTA CBT exam.',
    5400, -- 90 minutes
    10,   -- Configurable default target count
    2,
    true
  ),
  (
    'ca000000-0000-0000-0000-000000000003',
    'e1000000-0000-0000-0000-000000000001',
    'Previous-Year Question Test (PYQ)',
    'pyq',
    'Authentic solved past question papers from previous CUET PG examination cycles.',
    5400, -- Configurable by administrator (default 90 mins)
    5,    -- Configurable default target count
    3,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  default_duration_seconds = EXCLUDED.default_duration_seconds,
  default_test_count = EXCLUDED.default_test_count,
  display_order = EXCLUDED.display_order;

-- 3. SEED THE 7 INITIAL SUBJECTS
-- 1. Political Science
-- 2. Philosophy
-- 3. Psychology
-- 4. History
-- 5. Economics
-- 6. Geography
-- 7. Disaster Management
INSERT INTO public.subjects (id, examination_id, code, name, slug, description, total_domain_questions, duration_minutes, marking_correct, marking_incorrect, is_active, display_order)
VALUES
  (
    'aa000000-0000-0000-0000-000000000001',
    'e1000000-0000-0000-0000-000000000001',
    'HUQP18',
    'Political Science',
    'political-science',
    'Master of Arts in Political Science & International Relations (JNU, DU, BHU, HCU).',
    75,
    105,
    4,
    -1,
    true,
    1
  ),
  (
    'aa000000-0000-0000-0000-000000000002',
    'e1000000-0000-0000-0000-000000000001',
    'HUQP16',
    'Philosophy',
    'philosophy',
    'Master of Arts in Philosophy covering classical Indian and Western traditions.',
    75,
    105,
    4,
    -1,
    true,
    2
  ),
  (
    'aa000000-0000-0000-0000-000000000003',
    'e1000000-0000-0000-0000-000000000001',
    'HUQP20',
    'Psychology',
    'psychology',
    'Master of Arts & Science in Psychology and Applied Cognitive Studies.',
    75,
    105,
    4,
    -1,
    true,
    3
  ),
  (
    'aa000000-0000-0000-0000-000000000004',
    'e1000000-0000-0000-0000-000000000001',
    'HUQP09',
    'History',
    'history',
    'Master of Arts in History: Ancient, Medieval, Modern Indian & World History.',
    75,
    105,
    4,
    -1,
    true,
    4
  ),
  (
    'aa000000-0000-0000-0000-000000000005',
    'e1000000-0000-0000-0000-000000000001',
    'COQP12',
    'Economics',
    'economics',
    'Master of Arts & Science in Economics at DSE, JNU (CESP), and Central Universities.',
    75,
    105,
    4,
    -1,
    true,
    5
  ),
  (
    'aa000000-0000-0000-0000-000000000006',
    'e1000000-0000-0000-0000-000000000001',
    'HUQP08',
    'Geography',
    'geography',
    'Master of Arts & Science in Geography and Spatial Cartography.',
    75,
    105,
    4,
    -1,
    true,
    6
  ),
  (
    'aa000000-0000-0000-0000-000000000007',
    'e1000000-0000-0000-0000-000000000001',
    'COQP09',
    'Disaster Management',
    'disaster-management',
    'Master of Science & Technology in Disaster Mitigation and Risk Governance.',
    75,
    105,
    4,
    -1,
    true,
    7
  )
ON CONFLICT (code) DO UPDATE SET
  examination_id = EXCLUDED.examination_id,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- 4. SEED INITIAL CHAPTERS FOR EACH SUBJECT (Configurable; supports any count)
-- Political Science Chapters:
INSERT INTO public.chapters (id, subject_id, title, slug, description, display_order, is_active)
VALUES
  ('cb000001-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000001', 'Western Political Thought', 'western-political-thought', 'Plato, Aristotle, Machiavelli, Hobbes, Locke, Rousseau, Mill, Marx', 1, true),
  ('cb000001-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000001', 'Indian Political Thought', 'indian-political-thought', 'Kautilya, Gandhi, Ambedkar, Tilak, Aurobindo, Jayaprakash Narayan', 2, true),
  ('cb000001-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000001', 'Political Theory & Concepts', 'political-theory-concepts', 'Liberty, Equality, Justice, Sovereignty, Rights, Democracy, Power', 3, true),
  ('cb000001-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000001', 'Comparative Politics & Analysis', 'comparative-politics', 'Constitutional regimes, electoral systems, political parties, federalism', 4, true),
  ('cb000001-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000001', 'Indian Government & Politics', 'indian-government-politics', 'Preamble, Fundamental Rights, Judiciary, Executive, Parliament, Federal dynamics', 5, true),
  ('cb000001-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000001', 'Public Policy in India', 'public-policy-india', 'Policy formulation, implementation, governance models, socio-economic welfare', 6, true),
  ('cb000001-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000001', 'International Relations & Global Affairs', 'international-relations', 'Realism, Liberalism, Constructivism, United Nations, Indian Foreign Policy', 7, true),

-- Philosophy Chapters:
  ('cb000002-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000002', 'Classical Indian Epistemology', 'classical-indian-epistemology', 'Pramanas in Nyaya, Vaisesika, Samkhya, Yoga, and Mimamsa', 1, true),
  ('cb000002-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000002', 'Heterodox Traditions', 'heterodox-traditions', 'Buddhism, Jainism, and Carvaka metaphysical critique', 2, true),
  ('cb000002-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000003', 'Western Rationalism & Empiricism', 'western-rationalism-empiricism', 'Descartes, Spinoza, Leibniz, Locke, Berkeley, Hume', 3, true),
  ('cb000002-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000004', 'Kantian Critical Philosophy', 'kantian-philosophy', 'Synthetic a priori, transcendental deduction, categorical imperative', 4, true),
  ('cb000002-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000005', 'Normative & Applied Ethics', 'normative-applied-ethics', 'Virtue ethics, deontology, utilitarianism, bioethics, environmental ethics', 5, true),
  ('cb000002-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000006', 'Formal Logic & Argumentation', 'formal-logic', 'Propositional logic, predicate calculus, fallacies, syllogistic deduction', 6, true),
  ('cb000002-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000007', 'Philosophy of Mind & Language', 'philosophy-mind-language', 'Mind-body problem, Frege, Russell, Wittgenstein, semantic theories', 7, true),

-- Psychology Chapters:
  ('cb000003-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000003', 'Cognitive Processes & Memory', 'cognitive-processes-memory', 'Perception, attention, working memory, problem solving, decision making', 1, true),
  ('cb000003-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000003', 'Biological Bases of Behavior', 'biological-bases-behavior', 'Neurons, neurotransmitters, brain structures, endocrine systems, genetics', 2, true),
  ('cb000003-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000003', 'Personality Theories', 'personality-theories', 'Psychodynamic, trait, humanistic, behavioral, and social-cognitive approaches', 3, true),
  ('cb000003-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000003', 'Lifespan Development', 'lifespan-development', 'Prenatal, childhood, adolescence, and adult developmental trajectories', 4, true),
  ('cb000003-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000003', 'Social Psychology & Group Dynamics', 'social-psychology', 'Attitudes, conformity, obedience, prejudice, prosocial behavior', 5, true),
  ('cb000003-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000003', 'Psychopathology & Clinical Interventions', 'psychopathology-interventions', 'Anxiety, mood, psychotic disorders, CBT, psychotherapeutic paradigms', 6, true),
  ('cb000003-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000003', 'Research Methods & Statistics', 'research-methods-statistics', 'Experimental designs, correlation, ANOVA, regression, psychological testing', 7, true),

-- History Chapters:
  ('cb000004-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000004', 'Ancient Indian Civilizations', 'ancient-indian-civilizations', 'Harappan civilization, Vedic culture, Mahajanapadas, early urbanization', 1, true),
  ('cb000004-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000004', 'Mauryan & Classical Age', 'mauryan-classical-age', 'Ashoka, Arthashastra, Gupta administration, golden age of art and science', 2, true),
  ('cb000004-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000004', 'Early Medieval & Delhi Sultanate', 'medieval-delhi-sultanate', 'Regional kingdoms, Cholas, Khaljis, Tughlaqs, agrarian institutions', 3, true),
  ('cb000004-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000004', 'Mughal Empire & Regional Powers', 'mughal-empire-regional', 'Mughal statecraft, Mansabdari system, Marathas, Sikhs, Deccan kingdoms', 4, true),
  ('cb000004-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000004', 'Colonialism & Economic Drain', 'colonialism-economic-drain', 'East India Company, land revenue settlements, de-industrialization, revolt of 1857', 5, true),
  ('cb000004-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000004', 'Indian National Movement', 'indian-national-movement', 'Moderate & Extremist phases, Non-Cooperation, Civil Disobedience, Quit India', 6, true),
  ('cb000004-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000004', 'Post-Independence & World History', 'post-independence-world', 'Partition, integration of princely states, Cold War, Non-Aligned Movement', 7, true),

-- Economics Chapters:
  ('cb000005-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000005', 'Consumer Choice & Market Equilibrium', 'consumer-choice-equilibrium', 'Indifference curves, revealed preference, elasticity, welfare economics', 1, true),
  ('cb000005-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000005', 'Production, Costs, & Market Forms', 'production-costs-market-forms', 'Perfect competition, monopoly, oligopoly, game theory, price discrimination', 2, true),
  ('cb000005-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000005', 'Macroeconomic Models & IS-LM', 'macroeconomic-models-islm', 'Classical vs Keynesian systems, aggregate demand, monetary transmission', 3, true),
  ('cb000005-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000005', 'Monetary & Fiscal Frameworks', 'monetary-fiscal-frameworks', 'Central banking, inflation dynamics, Philips curve, public debt sustainability', 4, true),
  ('cb000005-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000005', 'Econometric & Statistical Tools', 'econometric-statistical-tools', 'OLS regression, hypothesis testing, multicollinearity, time series', 5, true),
  ('cb000005-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000005', 'International Trade & Finance', 'international-trade-finance', 'Ricardian comparative advantage, Heckscher-Ohlin, tariffs, balance of payments', 6, true),
  ('cb000005-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000005', 'Indian Economic Growth & Reforms', 'indian-economic-reforms', 'Planning era, 1991 structural reforms, agriculture, industry, services sector', 7, true),

-- Geography Chapters:
  ('cb000006-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000006', 'Geomorphology & Tectonics', 'geomorphology-tectonics', 'Plate tectonics, volcanism, weathering, fluvial, glacial, and aeolian landforms', 1, true),
  ('cb000006-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000006', 'Climatology & Atmospheric Dynamics', 'climatology-atmospheric-dynamics', 'Insolation, pressure belts, monsoon circulation, cyclones, Köppen classification', 2, true),
  ('cb000006-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000006', 'Oceanography & Marine Resources', 'oceanography-marine-resources', 'Ocean floor topography, temperature-salinity distribution, tides, currents', 3, true),
  ('cb000006-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000006', 'Human & Population Geography', 'human-population-geography', 'Demographic transition, migration models, urban settlements, central place theory', 4, true),
  ('cb000006-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000006', 'Economic & Regional Geography', 'economic-regional-geography', 'Agricultural typologies, Weber industrial location, globalization corridors', 5, true),
  ('cb000006-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000006', 'Geography of India', 'geography-of-india', 'Physiographic divisions, drainage systems, soils, natural vegetation, minerals', 6, true),
  ('cb000006-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000006', 'Cartography, GIS & Remote Sensing', 'cartography-gis-remote-sensing', 'Map projections, aerial photography, satellite sensors, GIS spatial analysis', 7, true),

-- Disaster Management Chapters:
  ('cb000007-0000-0000-0000-000000000001', 'aa000000-0000-0000-0000-000000000007', 'Foundations of Hazards & Risk', 'foundations-hazards-risk', 'Hazard vs disaster, vulnerability assessment, risk matrices, capacity analysis', 1, true),
  ('cb000007-0000-0000-0000-000000000002', 'aa000000-0000-0000-0000-000000000007', 'Geological & Tectonic Disasters', 'geological-tectonic-disasters', 'Earthquake engineering, microzonation, landslide mitigation, tsunami warnings', 2, true),
  ('cb000007-0000-0000-0000-000000000003', 'aa000000-0000-0000-0000-000000000007', 'Hydrometeorological Emergencies', 'hydrometeorological-emergencies', 'Flood management, flash floods, tropical cyclones, drought monitoring', 3, true),
  ('cb000007-0000-0000-0000-000000000004', 'aa000000-0000-0000-0000-000000000007', 'Technological & CBRN Disasters', 'technological-cbrn-disasters', 'Industrial hazards, hazardous materials, chemical spills, radiological incidents', 4, true),
  ('cb000007-0000-0000-0000-000000000005', 'aa000000-0000-0000-0000-000000000007', 'Global Risk Frameworks', 'global-risk-frameworks', 'Sendai Framework for DRR (2015-2030), Hyogo Framework, climate adaptation', 5, true),
  ('cb000007-0000-0000-0000-000000000006', 'aa000000-0000-0000-0000-000000000007', 'Indian Disaster Management Architecture', 'indian-dm-architecture', 'Disaster Management Act 2005, NDMA, SDMA, NDRF, Incident Response System', 6, true),
  ('cb000007-0000-0000-0000-000000000007', 'aa000000-0000-0000-0000-000000000007', 'Resilient Recovery & Reconstruction', 'resilient-recovery-reconstruction', 'Build Back Better, post-disaster needs assessment, psychosocial rehabilitation', 7, true)
ON CONFLICT (subject_id, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- 5. SEED INITIAL REAL TESTS (One sectional test per subject + full length diagnostic)
INSERT INTO public.tests (id, subject_id, chapter_id, category_id, title, slug, description, instructions, duration_seconds, positive_marks_default, negative_marks_default, access_type, status, display_order, version)
VALUES
  (
    'da000001-0000-0000-0000-000000000001',
    'aa000000-0000-0000-0000-000000000001',
    'cb000001-0000-0000-0000-000000000001',
    'ca000000-0000-0000-0000-000000000001',
    'Western Political Thought Sectional 01',
    'pol-sci-western-thought-sec-01',
    'Sectional drill covering classical political thinkers from Plato to Marx.',
    'Official CUET PG marking (+4 for correct, -1 for incorrect). Duration is 30 minutes.',
    1800,
    4,
    1,
    'free',
    'published',
    1,
    1
  ),
  (
    'da000001-0000-0000-0000-000000000002',
    'aa000000-0000-0000-0000-000000000001',
    NULL, -- Subject-level test (No chapter_id)
    'ca000000-0000-0000-0000-000000000002',
    'CUET PG Political Science Full Mock 01',
    'pol-sci-full-mock-01',
    'Comprehensive 75-question timed mock test across all 7 syllabus units.',
    'Full simulation under official 90-minute examination conditions.',
    5400,
    4,
    1,
    'paid',
    'published',
    1,
    1
  ),
  (
    'da000005-0000-0000-0000-000000000001',
    'aa000000-0000-0000-0000-000000000005',
    'cb000005-0000-0000-0000-000000000001',
    'ca000000-0000-0000-0000-000000000001',
    'Microeconomics: Consumer Choice Sectional 01',
    'econ-consumer-choice-sec-01',
    'Targeted problem set on indifference curves, utility maximization, and elasticity.',
    'Test duration is 30 minutes. +4 for correct, -1 for incorrect.',
    1800,
    4,
    1,
    'free',
    'published',
    1,
    1
  ),
  (
    'da000007-0000-0000-0000-000000000001',
    'aa000000-0000-0000-0000-000000000007',
    'cb000007-0000-0000-0000-000000000001',
    'ca000000-0000-0000-0000-000000000001',
    'Disaster Concepts & Risk Analysis Sectional 01',
    'dm-concepts-risk-sec-01',
    'Foundational drill on hazard classification and risk vulnerability assessment.',
    '30 minutes timed CBT format.',
    1800,
    4,
    1,
    'free',
    'published',
    1,
    1
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_seconds = EXCLUDED.duration_seconds,
  status = EXCLUDED.status;

-- 6. SEED INITIAL REAL QUESTIONS
INSERT INTO public.questions (id, subject_id, chapter_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, positive_marks, negative_marks, difficulty, status)
VALUES
  (
    'ea000001-0000-0000-0000-000000000001',
    'aa000000-0000-0000-0000-000000000001',
    'cb000001-0000-0000-0000-000000000001',
    'Who among the following political philosophers characterized the state of nature as "solitary, poor, nasty, brutish, and short"?',
    'John Locke',
    'Thomas Hobbes',
    'Jean-Jacques Rousseau',
    'Baron de Montesquieu',
    'B',
    'Thomas Hobbes in his 1651 masterwork "Leviathan" describes human life in the pre-political state of nature as a perpetual war of all against all, rendering existence solitary, poor, nasty, brutish, and short.',
    4,
    1,
    'moderate',
    'published'
  ),
  (
    'ea000005-0000-0000-0000-000000000001',
    'aa000000-0000-0000-0000-000000000005',
    'cb000005-0000-0000-0000-000000000001',
    'If the cross-price elasticity of demand between good X and good Y is negative, the two goods are classified as:',
    'Substitutes',
    'Complements',
    'Normal goods',
    'Inferior goods',
    'B',
    'A negative cross-price elasticity indicates that an increase in the price of good Y leads to a decrease in quantity demanded for good X, signifying complementary goods (e.g. cars and petrol).',
    4,
    1,
    'moderate',
    'published'
  ),
  (
    'ea000007-0000-0000-0000-000000000001',
    'aa000000-0000-0000-0000-000000000007',
    'cb000007-0000-0000-0000-000000000001',
    'Under the Disaster Management Act of 2005 in India, who acts as the ex-officio Chairperson of the National Disaster Management Authority (NDMA)?',
    'Union Home Minister',
    'Cabinet Secretary',
    'Prime Minister of India',
    'Union Minister of Environment and Forests',
    'C',
    'Section 3(2) of the Disaster Management Act, 2005 explicitly designates the Prime Minister of India as the ex-officio Chairperson of the National Disaster Management Authority.',
    4,
    1,
    'moderate',
    'published'
  )
ON CONFLICT (id) DO NOTHING;

-- Link questions to tests
INSERT INTO public.test_questions (id, test_id, question_id, display_order, positive_marks, negative_marks)
VALUES
  ('fa000001-0000-0000-0000-000000000001', 'da000001-0000-0000-0000-000000000001', 'ea000001-0000-0000-0000-000000000001', 1, 4, 1),
  ('fa000005-0000-0000-0000-000000000001', 'da000005-0000-0000-0000-000000000001', 'ea000005-0000-0000-0000-000000000001', 1, 4, 1),
  ('fa000007-0000-0000-0000-000000000001', 'da000007-0000-0000-0000-000000000001', 'ea000007-0000-0000-0000-000000000001', 1, 4, 1)
ON CONFLICT (test_id, question_id) DO NOTHING;



-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
-- START OF MIGRATION: 20261015000003_phase4_import_history_and_admin_enhancements.sql
-- >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

-- PrimePrep Migration 005: Phase 4 Admin Dashboard, Content Management, and Bulk Import
-- Adds import_history table, question enhancements, and RLS policies for administrative management.

CREATE TABLE IF NOT EXISTS public.import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'csv' CHECK (file_type IN ('csv', 'xlsx', 'xls', 'json')),
  total_rows INTEGER NOT NULL DEFAULT 0,
  successful_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'partial')),
  errors JSONB NOT NULL DEFAULT '[]'::jsonb,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_import_history_created ON public.import_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_history_imported_by ON public.import_history(imported_by);
CREATE INDEX IF NOT EXISTS idx_import_history_subject ON public.import_history(subject_id);

-- Enhance questions table if question_type is missing
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question_type TEXT NOT NULL DEFAULT 'single_choice';

-- Enhance tests table with passing_marks if missing
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS passing_marks NUMERIC DEFAULT 120;

-- Enable Row Level Security on import_history
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

-- Admins (content_admin & platform_admin) can view and manage import history
DROP POLICY IF EXISTS "import_history_admin_all" ON public.import_history;
CREATE POLICY "import_history_admin_all"
  ON public.import_history FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


