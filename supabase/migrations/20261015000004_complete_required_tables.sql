-- ==============================================================================
-- PrimePrep Migration 004: Complete Required Tables & Core Infrastructure
-- Defines all required tables with IF NOT EXISTS, correct foreign keys,
-- constraints, indexes, triggers, and Row Level Security (RLS) policies:
--
--  1. profiles
--  2. examinations
--  3. subjects
--  4. chapters
--  5. test_categories (and categories view)
--  6. questions
--  7. tests
--  8. test_questions
--  9. test_attempts (and attempts view)
-- 10. attempt_responses (and responses view)
-- 11. test_products
-- 12. product_tests
-- 13. test_entitlements
-- 14. audit_logs
-- 15. import_history
-- ==============================================================================

-- Ensure cryptographic and UUID extensions are available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'content_admin', 'platform_admin', 'admin')),
  target_subject_code TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure correct columns if table already existed with older schema
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS target_subject_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Update constraint if older role constraint was present
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('student', 'content_admin', 'platform_admin', 'admin'));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

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
-- 3. SUBJECTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  examination_id UUID REFERENCES public.examinations(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  exam_name TEXT NOT NULL DEFAULT 'CUET PG',
  total_domain_questions INTEGER NOT NULL DEFAULT 75 CHECK (total_domain_questions > 0),
  duration_minutes INTEGER NOT NULL DEFAULT 105 CHECK (duration_minutes > 0),
  marking_correct INTEGER NOT NULL DEFAULT 4 CHECK (marking_correct > 0),
  marking_incorrect INTEGER NOT NULL DEFAULT -1 CHECK (marking_incorrect <= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure examination_id, slug, and display_order exist if table was created in an older step
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS examination_id UUID REFERENCES public.examinations(id) ON DELETE CASCADE;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_subjects_exam_order ON public.subjects(examination_id, display_order);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON public.subjects(code);

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
-- 5. TEST CATEGORIES TABLE (AND CATEGORIES ALIAS VIEW)
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

-- Provide public.categories view so queries targeting 'categories' succeed seamlessly
CREATE OR REPLACE VIEW public.categories AS
SELECT * FROM public.test_categories;

-- ==============================================================================
-- 6. QUESTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  question_type TEXT NOT NULL DEFAULT 'single_choice' CHECK (question_type IN ('single_choice', 'multiple_choice', 'numerical', 'assertion_reason')),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL DEFAULT '',
  option_b TEXT NOT NULL DEFAULT '',
  option_c TEXT NOT NULL DEFAULT '',
  option_d TEXT NOT NULL DEFAULT '',
  correct_option TEXT CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  positive_marks NUMERIC NOT NULL DEFAULT 4 CHECK (positive_marks > 0),
  negative_marks NUMERIC NOT NULL DEFAULT 1 CHECK (negative_marks >= 0),
  question_image_url TEXT,
  difficulty TEXT NOT NULL DEFAULT 'moderate' CHECK (lower(difficulty) IN ('easy', 'moderate', 'hard')),
  source_type TEXT,
  source_reference TEXT,
  topic TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all columns exist if table was created earlier
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question_type TEXT NOT NULL DEFAULT 'single_choice';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_a TEXT NOT NULL DEFAULT '';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_b TEXT NOT NULL DEFAULT '';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_c TEXT NOT NULL DEFAULT '';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS option_d TEXT NOT NULL DEFAULT '';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS correct_option TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS positive_marks NUMERIC NOT NULL DEFAULT 4;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS negative_marks NUMERIC NOT NULL DEFAULT 1;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS question_image_url TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS source_type TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS source_reference TEXT;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON public.questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter_id ON public.questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);

-- ==============================================================================
-- 7. TESTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE RESTRICT,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.test_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  instructions TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 5400 CHECK (duration_seconds > 0),
  positive_marks_default NUMERIC NOT NULL DEFAULT 4,
  negative_marks_default NUMERIC NOT NULL DEFAULT 1,
  passing_marks NUMERIC DEFAULT 120,
  access_type TEXT NOT NULL DEFAULT 'free' CHECK (access_type IN ('free', 'paid')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure all columns exist if table was created in an older migration
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES public.chapters(id) ON DELETE SET NULL;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.test_categories(id) ON DELETE SET NULL;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS duration_seconds INTEGER NOT NULL DEFAULT 5400;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS positive_marks_default NUMERIC NOT NULL DEFAULT 4;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS negative_marks_default NUMERIC NOT NULL DEFAULT 1;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS passing_marks NUMERIC DEFAULT 120;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS access_type TEXT NOT NULL DEFAULT 'free';
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_tests_subject_id ON public.tests(subject_id);
CREATE INDEX IF NOT EXISTS idx_tests_chapter_id ON public.tests(chapter_id);
CREATE INDEX IF NOT EXISTS idx_tests_category_id ON public.tests(category_id);
CREATE INDEX IF NOT EXISTS idx_tests_status ON public.tests(status);
CREATE INDEX IF NOT EXISTS idx_tests_order ON public.tests(display_order);

-- ==============================================================================
-- 8. TEST QUESTIONS JUNCTION TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
  display_order INTEGER NOT NULL DEFAULT 1 CHECK (display_order > 0),
  question_order INTEGER DEFAULT 1,
  positive_marks NUMERIC DEFAULT 4,
  negative_marks NUMERIC DEFAULT 1,
  section_name TEXT NOT NULL DEFAULT 'Domain Specific',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_test_question UNIQUE (test_id, question_id)
);

ALTER TABLE public.test_questions ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 1;
ALTER TABLE public.test_questions ADD COLUMN IF NOT EXISTS positive_marks NUMERIC DEFAULT 4;
ALTER TABLE public.test_questions ADD COLUMN IF NOT EXISTS negative_marks NUMERIC DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_test_questions_test ON public.test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_question ON public.test_questions(question_id);

-- ==============================================================================
-- 9. TEST ATTEMPTS TABLE (AND ATTEMPTS ALIAS VIEW)
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

-- Provide public.attempts view so queries targeting 'attempts' work seamlessly
CREATE OR REPLACE VIEW public.attempts AS
SELECT * FROM public.test_attempts;

-- ==============================================================================
-- 10. ATTEMPT RESPONSES TABLE (AND RESPONSES ALIAS VIEW)
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

-- Provide public.responses view so queries targeting 'responses' work seamlessly
CREATE OR REPLACE VIEW public.responses AS
SELECT * FROM public.attempt_responses;

-- ==============================================================================
-- 11. TEST PRODUCTS TABLE
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
-- 12. PRODUCT TESTS JUNCTION TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_tests (
  product_id UUID NOT NULL REFERENCES public.test_products(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, test_id)
);

-- ==============================================================================
-- 13. TEST ENTITLEMENTS TABLE
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
-- 14. AUDIT LOGS TABLE
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
-- 15. IMPORT HISTORY TABLE
-- ==============================================================================
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

-- ==============================================================================
-- 16. RBAC SECURITY HELPER FUNCTIONS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('platform_admin', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_content_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'content_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('platform_admin', 'content_admin', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger function to prevent students from escalating their own role
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role <> OLD.role THEN
    IF auth.uid() IS NOT NULL AND NOT public.is_platform_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Only platform administrators can modify user roles.';
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

-- Trigger function to automatically create profile on auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'PrimePrep Student'),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing auth.users who registered before this migration
INSERT INTO public.profiles (id, full_name, role)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', email, 'PrimePrep Student'),
  'student'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 17. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempt_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_platform_admin())
  WITH CHECK (id = auth.uid() OR public.is_platform_admin());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- 2. Examinations Policies
DROP POLICY IF EXISTS "examinations_read_all" ON public.examinations;
CREATE POLICY "examinations_read_all"
  ON public.examinations FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "examinations_admin_write" ON public.examinations;
CREATE POLICY "examinations_admin_write"
  ON public.examinations FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Subjects Policies
DROP POLICY IF EXISTS "subjects_read_all" ON public.subjects;
CREATE POLICY "subjects_read_all"
  ON public.subjects FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "subjects_admin_write" ON public.subjects;
CREATE POLICY "subjects_admin_write"
  ON public.subjects FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Chapters Policies
DROP POLICY IF EXISTS "chapters_read_all" ON public.chapters;
CREATE POLICY "chapters_read_all"
  ON public.chapters FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "chapters_admin_write" ON public.chapters;
CREATE POLICY "chapters_admin_write"
  ON public.chapters FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Test Categories Policies
DROP POLICY IF EXISTS "test_categories_read_all" ON public.test_categories;
CREATE POLICY "test_categories_read_all"
  ON public.test_categories FOR SELECT
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "test_categories_admin_write" ON public.test_categories;
CREATE POLICY "test_categories_admin_write"
  ON public.test_categories FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. Questions Policies
DROP POLICY IF EXISTS "questions_admin_all" ON public.questions;
CREATE POLICY "questions_admin_all"
  ON public.questions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "questions_student_select" ON public.questions;
CREATE POLICY "questions_student_select"
  ON public.questions FOR SELECT
  USING (status = 'published');

-- 7. Tests Policies
DROP POLICY IF EXISTS "tests_student_select" ON public.tests;
CREATE POLICY "tests_student_select"
  ON public.tests FOR SELECT
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "tests_admin_write" ON public.tests;
CREATE POLICY "tests_admin_write"
  ON public.tests FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 8. Test Questions Policies
DROP POLICY IF EXISTS "test_questions_select" ON public.test_questions;
CREATE POLICY "test_questions_select"
  ON public.test_questions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "test_questions_admin_write" ON public.test_questions;
CREATE POLICY "test_questions_admin_write"
  ON public.test_questions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 9. Test Attempts Policies
DROP POLICY IF EXISTS "test_attempts_student_all" ON public.test_attempts;
CREATE POLICY "test_attempts_student_all"
  ON public.test_attempts FOR ALL
  USING (student_id = auth.uid() OR public.is_admin())
  WITH CHECK (student_id = auth.uid() OR public.is_admin());

-- 10. Attempt Responses Policies
DROP POLICY IF EXISTS "attempt_responses_student_all" ON public.attempt_responses;
CREATE POLICY "attempt_responses_student_all"
  ON public.attempt_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.test_attempts ta
      WHERE ta.id = attempt_responses.attempt_id
      AND (ta.student_id = auth.uid() OR public.is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_attempts ta
      WHERE ta.id = attempt_responses.attempt_id
      AND (ta.student_id = auth.uid() OR public.is_admin())
    )
  );

-- 11. Test Products & Product Tests Policies
DROP POLICY IF EXISTS "test_products_read_all" ON public.test_products;
CREATE POLICY "test_products_read_all"
  ON public.test_products FOR SELECT
  USING (status = 'active' OR public.is_admin());

DROP POLICY IF EXISTS "test_products_admin_write" ON public.test_products;
CREATE POLICY "test_products_admin_write"
  ON public.test_products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "product_tests_select" ON public.product_tests;
CREATE POLICY "product_tests_select"
  ON public.product_tests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "product_tests_admin_write" ON public.product_tests;
CREATE POLICY "product_tests_admin_write"
  ON public.product_tests FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 12. Test Entitlements Policies
DROP POLICY IF EXISTS "test_entitlements_student_read" ON public.test_entitlements;
CREATE POLICY "test_entitlements_student_read"
  ON public.test_entitlements FOR SELECT
  USING (student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "test_entitlements_admin_write" ON public.test_entitlements;
CREATE POLICY "test_entitlements_admin_write"
  ON public.test_entitlements FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 13. Audit Logs Policies
DROP POLICY IF EXISTS "audit_logs_admin_read" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_read"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_insert"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- 14. Import History Policies
DROP POLICY IF EXISTS "import_history_admin_all" ON public.import_history;
CREATE POLICY "import_history_admin_all"
  ON public.import_history FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
