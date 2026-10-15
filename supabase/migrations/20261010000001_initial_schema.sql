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
