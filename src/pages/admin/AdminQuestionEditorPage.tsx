import React, { useEffect, useState } from 'react';
import { useRouter } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/api/adminApi';
import { QuestionRow, SubjectRow, ChapterRow } from '../../types/database';
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  HelpCircle, 
  Eye, 
  Code, 
  BookOpen, 
  FolderTree,
  Sparkles
} from 'lucide-react';

interface QuestionEditorProps {
  questionId?: string;
}

export function AdminQuestionEditorPage({ questionId: propId }: QuestionEditorProps) {
  const { pathname, navigate } = useRouter();
  const { session } = useAuth();

  // Extract ID from pathname if not provided as prop: /admin/questions/:id/edit
  const routeIdMatch = pathname.match(/\/admin\/questions\/([^/]+)\/edit/);
  const questionId = propId || (routeIdMatch ? routeIdMatch[1] : undefined);
  const isEditing = Boolean(questionId);

  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    subject_id: '',
    chapter_id: '',
    question_type: 'single_choice' as 'single_choice' | 'multiple_choice' | 'numerical' | 'assertion_reason',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A' as 'A' | 'B' | 'C' | 'D',
    explanation: '',
    difficulty: 'moderate' as 'easy' | 'moderate' | 'hard',
    positive_marks: 4,
    negative_marks: 1,
    topic: '',
    status: 'published' as 'draft' | 'published'
  });

  // Initial Load: Subjects and Chapter options + existing question if editing
  useEffect(() => {
    async function loadInitial() {
      setIsLoading(true);
      setError(null);
      try {
        const subs = await adminApi.getSubjects(session?.access_token);
        setSubjects(subs);

        if (isEditing && questionId) {
          const q = await adminApi.getQuestion(questionId, session?.access_token);
          if (q) {
            setFormData({
              subject_id: q.subject_id,
              chapter_id: q.chapter_id || '',
              question_type: q.question_type || 'single_choice',
              question_text: q.question_text,
              option_a: q.option_a,
              option_b: q.option_b,
              option_c: q.option_c || '',
              option_d: q.option_d || '',
              correct_option: q.correct_option || 'A',
              explanation: q.explanation || '',
              difficulty: q.difficulty || 'moderate',
              positive_marks: q.positive_marks || 4,
              negative_marks: q.negative_marks ?? 1,
              topic: q.topic || '',
              status: q.status === 'draft' ? 'draft' : 'published'
            });

            // Load chapters for this subject
            if (q.subject_id) {
              const chaps = await adminApi.getChapters(q.subject_id, session?.access_token);
              setChapters(chaps);
            }
          }
        } else if (subs.length > 0) {
          // Default first subject
          const firstSubId = subs[0].id;
          setFormData(prev => ({ ...prev, subject_id: firstSubId }));
          const chaps = await adminApi.getChapters(firstSubId, session?.access_token);
          setChapters(chaps);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize editor');
      } finally {
        setIsLoading(false);
      }
    }

    loadInitial();
  }, [questionId, isEditing, session]);

  const handleSubjectChange = async (subId: string) => {
    setFormData(prev => ({ ...prev, subject_id: subId, chapter_id: '' }));
    if (subId) {
      try {
        const chaps = await adminApi.getChapters(subId, session?.access_token);
        setChapters(chaps);
      } catch {
        setChapters([]);
      }
    } else {
      setChapters([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject_id) {
      setError('Please select a parent subject.');
      return;
    }
    if (!formData.question_text.trim()) {
      setError('Question statement cannot be empty.');
      return;
    }
    if (!formData.option_a.trim() || !formData.option_b.trim()) {
      setError('Options A and B are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isEditing && questionId) {
        await adminApi.updateQuestion(questionId, formData, session?.access_token);
        setSuccessMsg('Question updated successfully.');
      } else {
        await adminApi.createQuestion(formData, session?.access_token);
        setSuccessMsg('Question created and registered into question bank.');
      }
      setTimeout(() => {
        navigate('/admin/questions');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save question.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title={isEditing ? 'Edit Examination Question' : 'Create Examination Question'}
      breadcrumbs={[
        { label: 'Questions', href: '/admin/questions' },
        { label: isEditing ? 'Edit Question' : 'New Question' }
      ]}
      actions={
        <button
          onClick={() => navigate('/admin/questions')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Bank</span>
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
        <div className="p-12 text-center text-xs text-slate-400">Loading question form...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SYLLABUS HIERARCHY CARD */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs">
            <h2 className="text-sm font-bold text-[#0F172A] mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>Syllabus Taxonomy & Metadata</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Subject */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Subject *
                </label>
                <select
                  required
                  value={formData.subject_id}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white font-medium"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              {/* Chapter */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Syllabus Chapter / Module
                </label>
                <select
                  value={formData.chapter_id}
                  disabled={!formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, chapter_id: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white disabled:bg-slate-50 disabled:text-slate-400 font-medium"
                >
                  <option value="">General / Across Chapters</option>
                  {chapters.map(c => (
                    <option key={c.id} value={c.id}>Unit #{c.display_order}: {c.title}</option>
                  ))}
                </select>
              </div>

              {/* Question Type */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Question Format
                </label>
                <select
                  value={formData.question_type}
                  onChange={(e) => setFormData({ ...formData, question_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white font-medium"
                >
                  <option value="single_choice">Single Choice (MCQ)</option>
                  <option value="multiple_choice">Multiple Correct</option>
                  <option value="assertion_reason">Assertion - Reason</option>
                  <option value="numerical">Numerical Value</option>
                </select>
              </div>

              {/* Topic / Tag */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Topic / Sub-theme
                </label>
                <input
                  type="text"
                  placeholder="e.g. Western Political Thought: Plato"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* QUESTION TEXT & STATEMENT */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                <span>Question Statement</span>
              </h2>
              <div className="flex items-center gap-1 border border-[#E2E8F0] rounded-lg p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    !previewMode ? 'bg-white shadow-2xs text-[#0F172A]' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode(true)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                    previewMode ? 'bg-white shadow-2xs text-teal-700' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {previewMode ? (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 min-h-[140px] text-sm text-[#0F172A] whitespace-pre-wrap leading-relaxed">
                {formData.question_text || <span className="text-slate-400 italic">No question statement entered yet...</span>}
              </div>
            ) : (
              <div>
                <textarea
                  required
                  rows={5}
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  placeholder="Enter the complete question prompt. You can include formatting, quotes, or mathematical expressions..."
                  className="w-full p-3.5 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:border-teal-500 font-sans leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports plain text, quotes, and standard NTA CBT question formats.
                </p>
              </div>
            )}
          </div>

          {/* OPTIONS AND ANSWER KEY */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs">
            <h2 className="text-sm font-bold text-[#0F172A] mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Options & Official Answer Key</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Enter option texts and select the radio button next to the correct answer.
            </p>

            <div className="space-y-3">
              {/* Option A */}
              <div className={`p-3.5 rounded-xl border transition-colors flex items-center gap-3 ${
                formData.correct_option === 'A' ? 'border-emerald-300 bg-emerald-50/40' : 'border-[#E2E8F0] bg-white'
              }`}>
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <input
                    type="radio"
                    name="correct_option"
                    checked={formData.correct_option === 'A'}
                    onChange={() => setFormData({ ...formData, correct_option: 'A' })}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    formData.correct_option === 'A' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    A
                  </span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Option A text statement *"
                  value={formData.option_a}
                  onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                  className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-teal-500 bg-white"
                />
              </div>

              {/* Option B */}
              <div className={`p-3.5 rounded-xl border transition-colors flex items-center gap-3 ${
                formData.correct_option === 'B' ? 'border-emerald-300 bg-emerald-50/40' : 'border-[#E2E8F0] bg-white'
              }`}>
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <input
                    type="radio"
                    name="correct_option"
                    checked={formData.correct_option === 'B'}
                    onChange={() => setFormData({ ...formData, correct_option: 'B' })}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    formData.correct_option === 'B' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    B
                  </span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Option B text statement *"
                  value={formData.option_b}
                  onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                  className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-teal-500 bg-white"
                />
              </div>

              {/* Option C */}
              <div className={`p-3.5 rounded-xl border transition-colors flex items-center gap-3 ${
                formData.correct_option === 'C' ? 'border-emerald-300 bg-emerald-50/40' : 'border-[#E2E8F0] bg-white'
              }`}>
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <input
                    type="radio"
                    name="correct_option"
                    checked={formData.correct_option === 'C'}
                    onChange={() => setFormData({ ...formData, correct_option: 'C' })}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    formData.correct_option === 'C' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    C
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Option C text statement"
                  value={formData.option_c}
                  onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                  className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-teal-500 bg-white"
                />
              </div>

              {/* Option D */}
              <div className={`p-3.5 rounded-xl border transition-colors flex items-center gap-3 ${
                formData.correct_option === 'D' ? 'border-emerald-300 bg-emerald-50/40' : 'border-[#E2E8F0] bg-white'
              }`}>
                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                  <input
                    type="radio"
                    name="correct_option"
                    checked={formData.correct_option === 'D'}
                    onChange={() => setFormData({ ...formData, correct_option: 'D' })}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    formData.correct_option === 'D' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    D
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Option D text statement"
                  value={formData.option_d}
                  onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                  className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-teal-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* PEDAGOGICAL EXPLANATION & MARKING SCHEME */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-2xs">
            <h2 className="text-sm font-bold text-[#0F172A] mb-4">
              Pedagogical Solution & Marking Scheme
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Detailed Solution / Explanation
                </label>
                <textarea
                  rows={4}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Provide rigorous scholarly reasoning, reference citations, or historical context displayed to candidates during post-test analysis..."
                  className="w-full p-3 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-teal-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Positive Marks *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.positive_marks}
                    onChange={(e) => setFormData({ ...formData, positive_marks: Number(e.target.value) || 4 })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg font-mono focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Official CUET PG: +4</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Negative Penalty *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.negative_marks}
                    onChange={(e) => setFormData({ ...formData, negative_marks: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg font-mono focus:outline-none focus:border-teal-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Official CUET PG: 1</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Difficulty Tier
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white"
                  >
                    <option value="easy">Easy (Foundational)</option>
                    <option value="moderate">Moderate (Standard CBT)</option>
                    <option value="hard">Hard (Advanced Analytical)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Publishing Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white font-semibold"
                  >
                    <option value="published">Published (Live in Mocks)</option>
                    <option value="draft">Draft (Review Stage)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ACTIONS BAR */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/admin/questions')}
              className="px-5 py-2.5 border border-[#E2E8F0] rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#0D9488] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving Question...' : isEditing ? 'Save Changes' : 'Publish Question to Bank'}</span>
            </button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
