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
