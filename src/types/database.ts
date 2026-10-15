export type UserRole = 'student' | 'content_admin' | 'platform_admin' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  target_subject_code: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExaminationRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SubjectRow {
  id: string;
  examination_id: string | null;
  category_id?: string | null;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  exam_name?: string;
  total_domain_questions: number;
  duration_minutes: number;
  marking_correct: number;
  marking_incorrect: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ChapterRow {
  id: string;
  subject_id: string;
  title: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestCategoryRow {
  id: string;
  examination_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  default_duration_seconds: number;
  default_test_count: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionRow {
  id: string;
  subject_id: string;
  chapter_id: string | null;
  question_type?: 'single_choice' | 'multiple_choice' | 'numerical' | 'assertion_reason';
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option?: 'A' | 'B' | 'C' | 'D' | null;
  explanation?: string | null;
  positive_marks: number;
  negative_marks: number;
  question_image_url: string | null;
  difficulty: 'easy' | 'moderate' | 'hard' | null;
  source_type: string | null;
  source_reference: string | null;
  topic?: string | null;
  status: 'draft' | 'published' | 'archived';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImportHistoryRow {
  id: string;
  imported_by: string | null;
  filename: string;
  file_type: 'csv' | 'xlsx' | 'xls' | 'json';
  total_rows: number;
  successful_count: number;
  error_count: number;
  status: 'completed' | 'failed' | 'partial';
  errors: Array<{ row: number; error: string; data?: any }>;
  subject_id: string | null;
  chapter_id: string | null;
  created_at: string;
  importer_name?: string;
  subject_name?: string;
  chapter_title?: string;
}

export interface StudentQuestionRow {
  id: string;
  subject_id: string;
  chapter_id: string | null;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  positive_marks: number;
  negative_marks: number;
  question_image_url: string | null;
  difficulty: 'easy' | 'moderate' | 'hard' | null;
  status: 'published';
}

export interface TestRow {
  id: string;
  subject_id?: string;
  chapter_id: string | null;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  instructions: string | null;
  duration_seconds: number;
  positive_marks_default: number;
  negative_marks_default: number;
  passing_marks?: number;
  total_questions?: number;
  total_marks?: number;
  access_type: 'free' | 'paid';
  status: 'draft' | 'published' | 'archived';
  display_order: number;
  version: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface TestQuestionRow {
  id: string;
  test_id: string;
  question_id: string;
  display_order: number;
  positive_marks: number;
  negative_marks: number;
  created_at: string;
  question?: QuestionRow;
}

export interface TestAttemptRow {
  id: string;
  test_id: string;
  student_id: string;
  test_version: number;
  status: 'in_progress' | 'submitted' | 'abandoned' | 'expired';
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  score: number | null;
  created_at: string;
  updated_at: string;
}

export interface AttemptResponseRow {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option: 'A' | 'B' | 'C' | 'D' | null;
  marked_for_review: boolean;
  visited: boolean;
  updated_at: string;
}

export interface TestProductRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price_paise: number;
  access_duration_days: number | null;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ProductTestRow {
  product_id: string;
  test_id: string;
  created_at: string;
}

export interface TestEntitlementRow {
  id: string;
  student_id: string;
  product_id: string | null;
  test_id: string | null;
  source: string;
  starts_at: string;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Hierarchical composite types for student navigation and display
export interface SubjectWithChapters extends SubjectRow {
  chapters: ChapterWithCategories[];
  subject_level_tests: TestWithCategory[];
}

export interface ChapterWithCategories extends ChapterRow {
  categories: CategoryWithTests[];
}

export interface CategoryWithTests extends TestCategoryRow {
  tests: TestRow[];
}

export interface TestWithCategory extends TestRow {
  category?: TestCategoryRow | null;
  chapter?: ChapterRow | null;
}
