export type UserRole = 'student' | 'admin' | 'instructor';

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

export interface ExamCategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface SubjectRow {
  id: string;
  category_id: string;
  code: string;
  name: string;
  description: string | null;
  exam_name: string;
  total_domain_questions: number;
  duration_minutes: number;
  marking_correct: number;
  marking_incorrect: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestSeriesRow {
  id: string;
  subject_id: string | null;
  slug: string;
  title: string;
  description: string;
  price_paise: number;
  original_price_paise: number | null;
  is_free: boolean;
  is_published: boolean;
  validity_days: number;
  language: string;
  difficulty_level: 'Foundational' | 'Moderate' | 'Advanced' | 'Comprehensive';
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestRow {
  id: string;
  subject_id: string;
  title: string;
  slug: string;
  type: 'full_length' | 'sectional' | 'diagnostic' | 'previous_year';
  total_questions: number;
  duration_minutes: number;
  total_marks: number;
  marking_correct: number;
  marking_incorrect: number;
  is_free_preview: boolean;
  is_published: boolean;
  instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionRow {
  id: string;
  subject_id: string;
  question_text: string;
  topic: string | null;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  explanation: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuestionOptionRow {
  id: string;
  question_id: string;
  option_label: 'A' | 'B' | 'C' | 'D';
  option_text: string;
  is_correct: boolean;
  explanation: string | null;
  created_at: string;
}

export interface UserEnrollmentRow {
  id: string;
  user_id: string;
  test_series_id: string;
  enrolled_at: string;
  expires_at: string;
  amount_paid_paise: number;
  status: 'active' | 'expired' | 'revoked';
  created_at: string;
}
