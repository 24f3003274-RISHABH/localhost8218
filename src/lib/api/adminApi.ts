import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { 
  ExaminationRow, 
  SubjectRow, 
  ChapterRow, 
  TestCategoryRow, 
  QuestionRow, 
  TestRow, 
  TestQuestionRow,
  ImportHistoryRow,
  AuditLogRow
} from '../../types/database';

export interface AdminSummaryStats {
  examinations: number;
  subjects: number;
  chapters: number;
  questions: {
    total: number;
    published: number;
    draft: number;
  };
  tests: {
    total: number;
    published: number;
    draft: number;
  };
  recent_activity: AuditLogRow[];
}

export interface QuestionFilters {
  subject_id?: string;
  chapter_id?: string;
  difficulty?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BulkImportPayload {
  filename: string;
  file_type: 'csv' | 'xlsx' | 'xls' | 'json';
  subject_id?: string;
  chapter_id?: string;
  questions: Array<{
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: 'A' | 'B' | 'C' | 'D';
    explanation?: string;
    difficulty?: 'easy' | 'moderate' | 'hard';
    positive_marks?: number;
    negative_marks?: number;
    question_type?: 'single_choice' | 'multiple_choice' | 'numerical' | 'assertion_reason';
    topic?: string;
  }>;
}

export interface BulkImportResult {
  success: boolean;
  total_rows: number;
  successful_count: number;
  error_count: number;
  errors: Array<{ row: number; error: string; data?: any }>;
  import_id?: string;
  message?: string;
}

// Helper to get auth header from active session or fallback
function getAuthHeaders(authToken?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

export const adminApi = {
  // 1. Dashboard Overview Stats
  async getSummary(authToken?: string): Promise<AdminSummaryStats> {
    try {
      const res = await fetch('/api/admin/summary', {
        headers: getAuthHeaders(authToken)
      });
      if (res.ok) {
        const data = await res.json();
        return {
          examinations: data.examinations || 1,
          subjects: data.subjects || 7,
          chapters: data.chapters || 49,
          questions: {
            total: data.questions?.total ?? (typeof data.questions === 'number' ? data.questions : 3),
            published: data.questions?.published ?? 3,
            draft: data.questions?.draft ?? 0
          },
          tests: {
            total: data.tests?.total ?? (typeof data.tests === 'number' ? data.tests : 4),
            published: data.tests?.published ?? 4,
            draft: data.tests?.draft ?? 0
          },
          recent_activity: data.recent_activity || []
        };
      }
    } catch {
      // Fallback below
    }

    // Direct Supabase fallback if configured
    if (isSupabaseConfigured) {
      const [
        { count: examCount },
        { count: subCount },
        { count: chapCount },
        { count: qTotal },
        { count: qPub },
        { count: tTotal },
        { count: tPub }
      ] = await Promise.all([
        supabase.from('examinations').select('*', { count: 'exact', head: true }),
        supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('chapters').select('*', { count: 'exact', head: true }),
        supabase.from('questions').select('*', { count: 'exact', head: true }),
        supabase.from('questions').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('tests').select('*', { count: 'exact', head: true }),
        supabase.from('tests').select('*', { count: 'exact', head: true }).eq('status', 'published')
      ]);

      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const totalQ = qTotal || 0;
      const pubQ = qPub || 0;
      const totalT = tTotal || 0;
      const pubT = tPub || 0;

      return {
        examinations: examCount || 1,
        subjects: subCount || 7,
        chapters: chapCount || 49,
        questions: {
          total: totalQ,
          published: pubQ,
          draft: Math.max(0, totalQ - pubQ)
        },
        tests: {
          total: totalT,
          published: pubT,
          draft: Math.max(0, totalT - pubT)
        },
        recent_activity: logs || []
      };
    }

    return {
      examinations: 1,
      subjects: 7,
      chapters: 49,
      questions: { total: 3, published: 3, draft: 0 },
      tests: { total: 4, published: 4, draft: 0 },
      recent_activity: []
    };
  },

  // 2. Examinations
  async getExaminations(authToken?: string): Promise<ExaminationRow[]> {
    try {
      const res = await fetch('/api/admin/examinations', { headers: getAuthHeaders(authToken) });
      if (res.ok) {
        const data = await res.json();
        return data.examinations || [];
      }
    } catch {}

    const { data } = await supabase
      .from('examinations')
      .select('*')
      .order('display_order', { ascending: true });
    return data || [];
  },

  async createExamination(payload: Partial<ExaminationRow>, authToken?: string): Promise<ExaminationRow> {
    const res = await fetch('/api/admin/examinations', {
      method: 'POST',
      headers: getAuthHeaders(authToken),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create examination');
    }
    const data = await res.json();
    return data.examination;
  },

  async updateExamination(id: string, payload: Partial<ExaminationRow>, authToken?: string): Promise<ExaminationRow> {
    const res = await fetch(`/api/admin/examinations/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(authToken),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update examination');
    }
    const data = await res.json();
    return data.examination;
  },

  // 3. Subjects
  async getSubjects(authToken?: string): Promise<SubjectRow[]> {
    try {
      const res = await fetch('/api/admin/subjects', { headers: getAuthHeaders(authToken) });
      if (res.ok) {
        const data = await res.json();
        return data.subjects || [];
      }
    } catch {}

    const { data } = await supabase
      .from('subjects')
      .select('*')
      .order('display_order', { ascending: true });
    return data || [];
  },

  async createSubject(payload: Partial<SubjectRow>, authToken?: string): Promise<SubjectRow> {
    const res = await fetch('/api/admin/subjects', {
      method: 'POST',
      headers: getAuthHeaders(authToken),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create subject');
    }
    const data = await res.json();
    return data.subject;
  },

  async updateSubject(id: string, payload: Partial<SubjectRow>, authToken?: string): Promise<SubjectRow> {
    const res = await fetch(`/api/admin/subjects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(authToken),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update subject');
    }
    const data = await res.json();
    return data.subject;
  },

  // 4. Chapters
  async getChapters(subjectId?: string, authToken?: string): Promise<ChapterRow[]> {
    const url = subjectId ? `/api/admin/chapters?subject_id=${subjectId}` : '/api/admin/chapters';
    try {
      const res = await fetch(url, { headers: getAuthHeaders(authToken) });
      if (res.ok) {
        const data = await res.json();
        return data.chapters || [];
      }
    } catch {}

    let query = supabase.from('chapters').select('*').order('display_order', { ascending: true });
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    const { data } = await query;
    return data || [];
  },

  async createChapter(payload: Partial<ChapterRow>, authToken?: string): Promise<ChapterRow> {
    const res = await fetch('/api/admin/chapters', {
      method: 'POST',
      headers: getAuthHeaders(authToken),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create chapter');
    }
    const data = await res.json();
    return data.chapter;
  },

  async updateChapter(id: string, payload: Partial<ChapterRow>, authToken?: string): Promise<ChapterRow> {
    const res = await fetch(`/api/admin/chapters/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(authToken),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update chapter');
    }
    const data = await res.json();
    return data.chapter;
  },

  // 5. Categories
  async getCategories(authToken?: string): Promise<TestCategoryRow[]> {
    try {
      const res = await fetch('/api/admin/categories', { headers: getAuthHeaders(authToken) });
      if (res.ok) {
        const data = await res.json();
        return data.categories || [];
      }
    } catch {}

    const { data } = await supabase
      .from('test_categories')
      .select('*')
      .order('display_order', { ascending: true });
    return data || [];
  },

  async createCategory(payload: Partial<TestCategoryRow>, authToken?: string): Promise<TestCategoryRow> {
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: getAuthHeaders(authToken),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create category');
    }
    const data = await res.json();
    return data.category;
  },

  async updateCategory(id: string, payload: Partial<TestCategoryRow>, authToken?: string): Promise<TestCategoryRow> {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(authToken),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update category');
    }
    const data = await res.json();
    return data.category;
  },

  // 6. Questions
  async getQuestions(filters?: QuestionFilters, authToken?: string): Promise<{ questions: QuestionRow[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.subject_id) params.set('subject_id', filters.subject_id);
    if (filters?.chapter_id) params.set('chapter_id', filters.chapter_id);
    if (filters?.difficulty) params.set('difficulty', filters.difficulty);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    try {
      const res = await fetch(`/api/admin/questions?${params.toString()}`, { headers: getAuthHeaders(authToken) });
      if (res.ok) {
        const data = await res.json();
        return {
          questions: data.questions || [],
          total: data.total ?? (data.questions?.length || 0)
        };
      }
    } catch {}

    let query = supabase.from('questions').select('*', { count: 'exact' });
    if (filters?.subject_id) query = query.eq('subject_id', filters.subject_id);
    if (filters?.chapter_id) query = query.eq('chapter_id', filters.chapter_id);
    if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.search) query = query.ilike('question_text', `%${filters.search}%`);

    const { data, count } = await query.order('created_at', { ascending: false });
    return {
      questions: data || [],
      total: count || (data?.length || 0)
    };
  },

  async getQuestion(id: string, authToken?: string): Promise<QuestionRow | null> {
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { headers: getAuthHeaders(authToken) });
      if (res.ok) {
        const data = await res.json();
        return data.question;
      }
    } catch {}

    const { data } = await supabase.from('questions').select('*').eq('id', id).single();
    return data;
  },

  async createQuestion(payload: Partial<QuestionRow>, authToken?: string): Promise<QuestionRow> {
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: getAuthHeaders(authToken),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create question');
    }
    const data = await res.json();
    return data.question;
  },

  async updateQuestion(id: string, payload: Partial<QuestionRow>, authToken?: string): Promise<QuestionRow> {
    const res = await fetch(`/api/admin/questions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(authToken),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update question');
    }
    const data = await res.json();
    return data.question;
  },

  async deleteQuestion(id: string, authToken?: string): Promise<void> {
    const res = await fetch(`/api/admin/questions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(authToken)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete question');
    }
  },

  // 7. Bulk Question Import
  async bulkImportQuestions(payload: BulkImportPayload, authToken?: string): Promise<BulkImportResult> {
    const res = await fetch('/api/admin/questions/bulk-import', {
      method: 'POST',
      headers: getAuthHeaders(authToken),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Bulk import request failed');
    }

    return await res.json();
  },

  // 8. Import History
  async getImportHistory(authToken?: string): Promise<ImportHistoryRow[]> {
    try {
      const res = await fetch('/api/admin/import-history', { headers: getAuthHeaders(authToken) });
      if (res.ok) {
        const data = await res.json();
        return data.history || [];
      }
    } catch {}

    const { data } = await supabase
      .from('import_history')
      .select('*')
      .order('created_at', { ascending: false });
    return (data as ImportHistoryRow[]) || [];
  },

  // 9. Tests & Test Questions
  async getTests(filters?: { subject_id?: string; chapter_id?: string; status?: string }, authToken?: string): Promise<TestRow[]> {
    const params = new URLSearchParams();
    if (filters?.subject_id) params.set('subject_id', filters.subject_id);
    if (filters?.chapter_id) params.set('chapter_id', filters.chapter_id);
    if (filters?.status) params.set('status', filters.status);

    try {
      const res = await fetch(`/api/admin/tests?${params.toString()}`, { headers: getAuthHeaders(authToken) });
      if (res.ok) {
        const data = await res.json();
        return data.tests || [];
      }
    } catch {}

    let query = supabase.from('tests').select('*').order('created_at', { ascending: false });
    if (filters?.subject_id) query = query.eq('subject_id', filters.subject_id);
    if (filters?.chapter_id) query = query.eq('chapter_id', filters.chapter_id);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data } = await query;
    return data || [];
  },

  async getTestWithQuestions(id: string, authToken?: string): Promise<{ test: TestRow; questions: TestQuestionRow[] }> {
    const res = await fetch(`/api/admin/tests/${id}`, { headers: getAuthHeaders(authToken) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch test details');
    }
    return await res.json();
  },

  async createTest(payload: Partial<TestRow> & { question_ids?: string[] }, authToken?: string): Promise<TestRow> {
    const res = await fetch('/api/admin/tests', {
      method: 'POST',
      headers: getAuthHeaders(authToken),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create test');
    }
    const data = await res.json();
    return data.test;
  },

  async updateTest(id: string, payload: Partial<TestRow> & { question_ids?: string[] }, authToken?: string): Promise<TestRow> {
    const res = await fetch(`/api/admin/tests/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(authToken),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update test');
    }
    const data = await res.json();
    return data.test;
  },

  async deleteTest(id: string, authToken?: string): Promise<void> {
    const res = await fetch(`/api/admin/tests/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(authToken)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete test');
    }
  }
};
