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
