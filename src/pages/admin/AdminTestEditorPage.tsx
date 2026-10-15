import React, { useEffect, useState } from 'react';
import { useRouter } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/api/adminApi';
import { TestRow, SubjectRow, ChapterRow, TestCategoryRow, QuestionRow } from '../../types/database';
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  FileCheck2, 
  Plus, 
  Trash2, 
  Search, 
  Clock, 
  Award,
  Layers,
  ArrowUp,
  ArrowDown,
  BookOpen,
  FolderTree
} from 'lucide-react';

interface TestEditorProps {
  testId?: string;
}

export function AdminTestEditorPage({ testId: propId }: TestEditorProps) {
  const { pathname, navigate } = useRouter();
  const { session } = useAuth();

  // Extract ID from pathname: /admin/tests/:id/edit
  const routeIdMatch = pathname.match(/\/admin\/tests\/([^/]+)\/edit/);
  const testId = propId || (routeIdMatch ? routeIdMatch[1] : undefined);
  const isEditing = Boolean(testId);

  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [categories, setCategories] = useState<TestCategoryRow[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<QuestionRow[]>([]);

  // Selected Question IDs in current test
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [questionSearch, setQuestionSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subject_id: '',
    chapter_id: '',
    category_id: '',
    duration_minutes: 90,
    positive_marks_default: 4,
    negative_marks_default: 1,
    passing_marks: 120,
    access_type: 'free' as 'free' | 'paid',
    status: 'published' as 'draft' | 'published',
    instructions: '1. Each question carries 4 marks.\n2. For each wrong answer, 1 mark will be deducted.\n3. Calculators and electronic gadgets are strictly prohibited.'
  });

  // Load initial dropdowns and existing test if editing
  useEffect(() => {
    async function loadInitial() {
      setIsLoading(true);
      setError(null);
      try {
        const [subs, cats] = await Promise.all([
          adminApi.getSubjects(session?.access_token),
          adminApi.getCategories(session?.access_token)
        ]);
        setSubjects(subs);
        setCategories(cats);

        if (isEditing && testId) {
          const { test, questions } = await adminApi.getTestWithQuestions(testId, session?.access_token);
          if (test) {
            setFormData({
              title: test.title,
              slug: test.slug,
              subject_id: test.subject_id || '',
              chapter_id: test.chapter_id || '',
              category_id: test.category_id || (cats[0]?.id || ''),
              duration_minutes: Math.round((test.duration_seconds || 5400) / 60),
              positive_marks_default: test.positive_marks_default || 4,
              negative_marks_default: test.negative_marks_default ?? 1,
              passing_marks: test.passing_marks || 120,
              access_type: test.access_type || 'free',
              status: test.status === 'draft' ? 'draft' : 'published',
              instructions: test.instructions || ''
            });

            const qIds = questions.map((tq: any) => tq.question_id || tq.question?.id).filter(Boolean);
            setSelectedQuestionIds(qIds);

            if (test.subject_id) {
              const chaps = await adminApi.getChapters(test.subject_id, session?.access_token);
              setChapters(chaps);
              // Also load bank questions for this subject
              loadBankQuestions(test.subject_id, test.chapter_id || undefined);
            }
          }
        } else if (subs.length > 0) {
          const firstSub = subs[0];
          setFormData(prev => ({
            ...prev,
            subject_id: firstSub.id,
            category_id: cats[0]?.id || ''
          }));
          const chaps = await adminApi.getChapters(firstSub.id, session?.access_token);
          setChapters(chaps);
          loadBankQuestions(firstSub.id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize test editor');
      } finally {
        setIsLoading(false);
      }
    }

    loadInitial();
  }, [testId, isEditing, session]);

  const loadBankQuestions = async (subId: string, chapId?: string) => {
    try {
      const res = await adminApi.getQuestions({
        subject_id: subId,
        chapter_id: chapId || undefined,
        limit: 100
      }, session?.access_token);
      setAvailableQuestions(res.questions);
    } catch {
      setAvailableQuestions([]);
    }
  };

  const handleSubjectChange = async (subId: string) => {
    setFormData(prev => ({ ...prev, subject_id: subId, chapter_id: '' }));
    if (subId) {
      const chaps = await adminApi.getChapters(subId, session?.access_token);
      setChapters(chaps);
      loadBankQuestions(subId);
    } else {
      setChapters([]);
      setAvailableQuestions([]);
    }
  };

  const handleChapterChange = (chapId: string) => {
    setFormData(prev => ({ ...prev, chapter_id: chapId }));
    if (formData.subject_id) {
      loadBankQuestions(formData.subject_id, chapId || undefined);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (!isEditing) {
      const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, title, slug: autoSlug }));
    } else {
      setFormData(prev => ({ ...prev, title }));
    }
  };

  // Toggle question selection
  const toggleQuestionSelection = (qid: string) => {
    setSelectedQuestionIds(prev => {
      if (prev.includes(qid)) {
        return prev.filter(id => id !== qid);
      } else {
        return [...prev, qid];
      }
    });
  };

  // Move question up in assembly order
  const moveQuestion = (idx: number, direction: 'up' | 'down') => {
    setSelectedQuestionIds(prev => {
      const next = [...prev];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject_id) {
      setError('Test title and subject are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      subject_id: formData.subject_id,
      chapter_id: formData.chapter_id || null,
      category_id: formData.category_id || null,
      duration_seconds: (formData.duration_minutes || 90) * 60,
      positive_marks_default: formData.positive_marks_default || 4,
      negative_marks_default: formData.negative_marks_default ?? 1,
      passing_marks: formData.passing_marks || 120,
      access_type: formData.access_type,
      status: formData.status,
      instructions: formData.instructions,
      question_ids: selectedQuestionIds
    };

    try {
      if (isEditing && testId) {
        await adminApi.updateTest(testId, payload, session?.access_token);
        setSuccessMsg('Test details and question bank mappings updated.');
      } else {
        await adminApi.createTest(payload, session?.access_token);
        setSuccessMsg('Test created successfully with selected questions.');
      }
      setTimeout(() => {
        navigate('/admin/tests');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save test');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedTotalMarks = selectedQuestionIds.length * (formData.positive_marks_default || 4);

  return (
    <AdminLayout
      title={isEditing ? 'Edit Mock Test & Question Bank' : 'Create & Assemble Mock Test'}
      breadcrumbs={[
        { label: 'Tests & Mocks', href: '/admin/tests' },
        { label: isEditing ? 'Edit Test' : 'New Test' }
      ]}
      actions={
        <button
          onClick={() => navigate('/admin/tests')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tests</span>
        </button>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading test editor...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* GENERAL CONFIGURATION CARD */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs">
            <h2 className="text-sm font-bold text-[#0F172A] mb-4 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-teal-600" />
              <span>General Test Configuration</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Test Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="e.g. Political Theory: Sectional Mock 01"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-teal-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Slug (URL identifier) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. pol-sci-sec-01"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Subject *
                  </label>
                  <select
                    required
                    value={formData.subject_id}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Chapter / Unit
                  </label>
                  <select
                    value={formData.chapter_id}
                    disabled={!formData.subject_id}
                    onChange={(e) => handleChapterChange(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white disabled:bg-slate-50"
                  >
                    <option value="">Full Syllabus / Comprehensive</option>
                    {chapters.map(c => (
                      <option key={c.id} value={c.id}>Unit #{c.display_order}: {c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Test Category *
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Timing, Marking, Status */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: Number(e.target.value) || 90 })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Marks / Question
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.positive_marks_default}
                    onChange={(e) => setFormData({ ...formData, positive_marks_default: Number(e.target.value) || 4 })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Penalty / Wrong
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.negative_marks_default}
                    onChange={(e) => setFormData({ ...formData, negative_marks_default: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Access Type
                  </label>
                  <select
                    value={formData.access_type}
                    onChange={(e) => setFormData({ ...formData, access_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white"
                  >
                    <option value="free">Free Preview</option>
                    <option value="paid">Enrolled Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Publish Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white font-semibold"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Candidate Exam Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* QUESTION BANK SELECTOR & TEST ASSEMBLY */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  <span>Question Bank Assembly</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pick questions from the repository to map into this test paper.
                </p>
              </div>

              {/* Dynamic Counters */}
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold flex items-center gap-2">
                  <span>{selectedQuestionIds.length} Questions Selected</span>
                  <span className="text-teal-400">•</span>
                  <span>{calculatedTotalMarks} Total Marks</span>
                </div>
              </div>
            </div>

            {/* Questions Bank Picker Area */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-700">
                Available Questions in Repository ({availableQuestions.length}):
              </div>

              {availableQuestions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  No questions available for this subject yet. Use "Bulk Import" or "New Question" to populate the question bank.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                  {availableQuestions.map((q) => {
                    const isSelected = selectedQuestionIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => toggleQuestionSelection(q.id)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isSelected 
                            ? 'bg-teal-50/80 border-teal-300 shadow-2xs' 
                            : 'bg-white border-[#E2E8F0] hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by div click
                            className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 h-4 w-4 shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-[#0F172A] leading-snug">
                              {q.question_text}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-mono">
                              <span>Key: <strong className="text-emerald-700 font-bold">{q.correct_option}</strong></span>
                              <span>+ {q.positive_marks} / -{q.negative_marks}</span>
                              <span className="capitalize">{q.difficulty}</span>
                            </div>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isSelected ? 'Included' : 'Add to Test'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/admin/tests')}
              className="px-5 py-2.5 border border-[#E2E8F0] rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#0D9488] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Test...' : isEditing ? 'Save Changes' : 'Publish Mock Test'}</span>
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
