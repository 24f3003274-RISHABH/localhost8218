import React, { useEffect, useState } from 'react';
import { useRouter } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/api/adminApi';
import { TestRow, SubjectRow, ChapterRow, TestCategoryRow } from '../../types/database';
import { 
  FileCheck2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  BookOpen,
  FolderTree,
  Layers,
  Award
} from 'lucide-react';

export function AdminTestsPage() {
  const { navigate, searchParams } = useRouter();
  const { session } = useAuth();

  const [tests, setTests] = useState<TestRow[]>([]);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [categories, setCategories] = useState<TestCategoryRow[]>([]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(searchParams.get('subject_id') || '');
  const [selectedChapterId, setSelectedChapterId] = useState<string>(searchParams.get('chapter_id') || '');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || '');
  const [search, setSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load metadata filters
  useEffect(() => {
    async function loadMeta() {
      try {
        const [subs, cats] = await Promise.all([
          adminApi.getSubjects(session?.access_token),
          adminApi.getCategories(session?.access_token)
        ]);
        setSubjects(subs);
        setCategories(cats);
        if (selectedSubjectId) {
          const chaps = await adminApi.getChapters(selectedSubjectId, session?.access_token);
          setChapters(chaps);
        }
      } catch (err: any) {
        console.error(err);
      }
    }
    loadMeta();
  }, [selectedSubjectId, session]);

  const fetchTests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getTests({
        subject_id: selectedSubjectId || undefined,
        chapter_id: selectedChapterId || undefined,
        status: selectedStatus || undefined
      }, session?.access_token);
      setTests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load mock tests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [selectedSubjectId, selectedChapterId, selectedStatus, session]);

  const handleSubjectChange = async (subId: string) => {
    setSelectedSubjectId(subId);
    setSelectedChapterId('');
    if (subId) {
      const chaps = await adminApi.getChapters(subId, session?.access_token);
      setChapters(chaps);
    } else {
      setChapters([]);
    }
  };

  const togglePublish = async (test: TestRow) => {
    const newStatus = test.status === 'published' ? 'draft' : 'published';
    try {
      await adminApi.updateTest(test.id, { status: newStatus }, session?.access_token);
      await fetchTests();
    } catch (err: any) {
      setError(err.message || 'Failed to update test status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this test? All question associations will be removed.')) {
      return;
    }
    setDeletingId(id);
    try {
      await adminApi.deleteTest(id, session?.access_token);
      await fetchTests();
    } catch (err: any) {
      setError(err.message || 'Failed to delete test');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTests = tests.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="Mock & Sectional Test Management"
      breadcrumbs={[{ label: 'Tests & Mocks' }]}
      actions={
        <button
          onClick={() => navigate('/admin/tests/new')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Test</span>
        </button>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* FILTER CONTROL BAR */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 mb-6 shadow-2xs space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tests by title or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubjectId}
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
              value={selectedChapterId}
              disabled={!selectedSubjectId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">All Chapters</option>
              {chapters.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="published">Published (Live)</option>
              <option value="draft">Draft (Unpublished)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-100">
          <span>Showing {filteredTests.length} tests</span>
          {(search || selectedSubjectId || selectedChapterId || selectedStatus) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedSubjectId('');
                setSelectedChapterId('');
                setSelectedStatus('');
              }}
              className="text-teal-600 hover:text-teal-800 font-medium cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* TESTS TABLE CARD */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading tests...</div>
        ) : filteredTests.length === 0 ? (
          <div className="p-16 text-center">
            <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-[#0F172A] mb-1">No Tests Found</h3>
            <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
              No tests match your filter criteria. Create tests and assemble them from the question bank.
            </p>
            <button
              onClick={() => navigate('/admin/tests/new')}
              className="px-4 py-2 bg-[#0D9488] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Assemble New Test
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-6">Test Title</th>
                  <th className="py-3 px-6">Subject & Module</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Duration</th>
                  <th className="py-3 px-6">Questions & Marks</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Title */}
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-[#0F172A]">
                        {test.title}
                      </div>
                      <div className="font-mono text-slate-400 text-[11px] mt-0.5">
                        {test.slug}
                      </div>
                    </td>

                    {/* Subject & Chapter */}
                    <td className="py-3.5 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>{(test as any).subjects?.name || 'Subject'}</span>
                        </span>
                        {(test as any).chapters?.title && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 truncate max-w-[170px]">
                            <FolderTree className="w-3 h-3 text-indigo-500" />
                            <span>{(test as any).chapters.title}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                        <Layers className="w-3 h-3 text-violet-500" />
                        <span>{(test as any).test_categories?.name || 'Sectional'}</span>
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-6 font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{Math.round((test.duration_seconds || 5400) / 60)} mins</span>
                      </div>
                    </td>

                    {/* Questions & Marks */}
                    <td className="py-3.5 px-6 font-mono text-xs">
                      <div>
                        <span className="font-bold text-[#0F172A]">{test.total_questions || 0}</span> questions
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Total {test.total_marks || (test.total_questions || 0) * 4} Marks
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-6">
                      <button
                        onClick={() => togglePublish(test)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                          test.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {test.status === 'published' ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/tests/${test.id}/edit`)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Edit Test & Questions"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(test.id)}
                          disabled={deletingId === test.id}
                          className="p-1.5 text-rose-600 hover:text-rose-900 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Delete Test"
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
      </div>
    </AdminLayout>
  );
}
