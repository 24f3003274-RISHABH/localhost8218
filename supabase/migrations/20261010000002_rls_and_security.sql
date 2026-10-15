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
