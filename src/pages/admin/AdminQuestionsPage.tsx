import React, { useEffect, useState } from 'react';
import { useRouter } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi, QuestionFilters } from '../../lib/api/adminApi';
import { QuestionRow, SubjectRow, ChapterRow } from '../../types/database';
import { 
  HelpCircle, 
  Plus, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FolderTree
} from 'lucide-react';

export function AdminQuestionsPage() {
  const { navigate, searchParams } = useRouter();
  const { session } = useAuth();

  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);

  // Filter State
  const [filters, setFilters] = useState<QuestionFilters>({
    subject_id: searchParams.get('subject_id') || '',
    chapter_id: searchParams.get('chapter_id') || '',
    difficulty: searchParams.get('difficulty') || '',
    status: searchParams.get('status') || '',
    search: '',
    page: 1,
    limit: 15
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load subjects and chapters for filter dropdowns
  useEffect(() => {
    async function loadMeta() {
      try {
        const subs = await adminApi.getSubjects(session?.access_token);
        setSubjects(subs);
        if (filters.subject_id) {
          const chaps = await adminApi.getChapters(filters.subject_id, session?.access_token);
          setChapters(chaps);
        }
      } catch (err: any) {
        console.error(err);
      }
    }
    loadMeta();
  }, [filters.subject_id, session]);

  // Fetch questions whenever filters change
  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getQuestions(filters, session?.access_token);
      setQuestions(res.questions);
      setTotalCount(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load questions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filters, session]);

  const handleSubjectChange = async (subId: string) => {
    setFilters(prev => ({ ...prev, subject_id: subId, chapter_id: '', page: 1 }));
    if (subId) {
      const chaps = await adminApi.getChapters(subId, session?.access_token);
      setChapters(chaps);
    } else {
      setChapters([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    try {
      await adminApi.deleteQuestion(id, session?.access_token);
      await fetchQuestions();
    } catch (err: any) {
      setError(err.message || 'Failed to delete question.');
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / (filters.limit || 15)) || 1;

  return (
    <AdminLayout
      title="Question Bank Management"
      breadcrumbs={[{ label: 'Questions' }]}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/questions/import')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={() => navigate('/admin/questions/new')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Question</span>
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 mb-6 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Text */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by question text or topic..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={filters.subject_id}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white"
            >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          {/* Chapter Filter */}
          <div>
            <select
              value={filters.chapter_id}
              disabled={!filters.subject_id}
              onChange={(e) => setFilters(prev => ({ ...prev, chapter_id: e.target.value, page: 1 }))}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">All Chapters</option>
              {chapters.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Difficulty & Status Filter */}
          <div className="flex gap-2">
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value, page: 1 }))}
              className="w-1/2 px-2.5 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white"
            >
              <option value="">Difficulty</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="w-1/2 px-2.5 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white"
            >
              <option value="">Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Found {totalCount} matching questions in repository</span>
          {(filters.search || filters.subject_id || filters.chapter_id || filters.difficulty || filters.status) && (
            <button
              onClick={() => setFilters({ search: '', subject_id: '', chapter_id: '', difficulty: '', status: '', page: 1, limit: 15 })}
              className="text-teal-600 hover:text-teal-800 font-medium cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* QUESTIONS LIST TABLE */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading questions from bank...</div>
        ) : questions.length === 0 ? (
          <div className="p-16 text-center">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-[#0F172A] mb-1">No Questions Found</h3>
            <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
              No questions matched your current criteria. Create questions manually or import in bulk using CSV or Excel.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate('/admin/questions/import')}
                className="px-3.5 py-2 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Bulk Import Questions
              </button>
              <button
                onClick={() => navigate('/admin/questions/new')}
                className="px-3.5 py-2 bg-[#0D9488] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Create Single Question
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-6 max-w-md">Question Text & Options</th>
                  <th className="py-3 px-6">Domain / Chapter</th>
                  <th className="py-3 px-6">Key</th>
                  <th className="py-3 px-6">Difficulty</th>
                  <th className="py-3 px-6">Marking</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Question Text */}
                    <td className="py-4 px-6 max-w-md">
                      <div className="font-semibold text-[#0F172A] line-clamp-2 leading-snug mb-1.5">
                        {q.question_text}
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-500 font-mono">
                        <span className={q.correct_option === 'A' ? 'font-bold text-emerald-700' : ''}>
                          A: {q.option_a?.slice(0, 30)}{q.option_a?.length > 30 ? '...' : ''}
                        </span>
                        <span className={q.correct_option === 'B' ? 'font-bold text-emerald-700' : ''}>
                          B: {q.option_b?.slice(0, 30)}{q.option_b?.length > 30 ? '...' : ''}
                        </span>
                        {q.option_c && (
                          <span className={q.correct_option === 'C' ? 'font-bold text-emerald-700' : ''}>
                            C: {q.option_c?.slice(0, 30)}{q.option_c?.length > 30 ? '...' : ''}
                          </span>
                        )}
                        {q.option_d && (
                          <span className={q.correct_option === 'D' ? 'font-bold text-emerald-700' : ''}>
                            D: {q.option_d?.slice(0, 30)}{q.option_d?.length > 30 ? '...' : ''}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Domain & Chapter */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[#0F172A] flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-blue-600" />
                          <span>{(q as any).subjects?.name || 'Subject'}</span>
                        </span>
                        {(q as any).chapters?.title && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate max-w-[160px]">
                            <FolderTree className="w-3 h-3 text-indigo-500" />
                            <span>{(q as any).chapters.title}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Correct Option */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                        {q.correct_option || 'A'}
                      </span>
                    </td>

                    {/* Difficulty */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                        q.difficulty === 'hard'
                          ? 'bg-rose-100 text-rose-800'
                          : q.difficulty === 'easy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {q.difficulty || 'Moderate'}
                      </span>
                    </td>

                    {/* Marking */}
                    <td className="py-4 px-6 font-mono text-xs">
                      <span className="text-emerald-700 font-semibold">+{q.positive_marks}</span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="text-rose-600 font-semibold">-{q.negative_marks}</span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        q.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {q.status === 'published' ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-slate-400" />}
                        <span className="capitalize">{q.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/questions/${q.id}/edit`)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Edit Question"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          disabled={deletingId === q.id}
                          className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-[#F8F9FA] flex items-center justify-between text-xs text-slate-600">
            <div>
              Page <span className="font-semibold text-slate-900">{filters.page}</span> of{' '}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={filters.page! <= 1}
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={filters.page! >= totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
