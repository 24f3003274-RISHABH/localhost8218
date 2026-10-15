import React, { useEffect, useState } from 'react';
import { useRouter } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/api/adminApi';
import { ChapterRow, SubjectRow } from '../../types/database';
import { 
  FolderTree, 
  Plus, 
  Search, 
  Edit3, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  X,
  Target
} from 'lucide-react';

export function AdminChaptersPage() {
  const { searchParams, navigate } = useRouter();
  const { session } = useAuth();

  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(searchParams.get('subject_id') || '');
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterRow | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subject_id: '',
    description: '',
    display_order: 1,
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubjects = async () => {
    try {
      const subs = await adminApi.getSubjects(session?.access_token);
      setSubjects(subs);
      if (!selectedSubjectId && subs.length > 0) {
        setSelectedSubjectId(subs[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchChapters = async (subjectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const chaps = await adminApi.getChapters(subjectId || undefined, session?.access_token);
      setChapters(chaps);

      if (searchParams.get('action') === 'new' && !editingChapter) {
        openCreateModal(subjectId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load chapters');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [session]);

  useEffect(() => {
    if (selectedSubjectId) {
      fetchChapters(selectedSubjectId);
    }
  }, [selectedSubjectId, session]);

  const openCreateModal = (defSubjectId?: string) => {
    setEditingChapter(null);
    setFormData({
      title: '',
      slug: '',
      subject_id: defSubjectId || selectedSubjectId || (subjects[0]?.id || ''),
      description: '',
      display_order: chapters.length + 1,
      is_active: true
    });
    setModalOpen(true);
  };

  const openEditModal = (chapter: ChapterRow) => {
    setEditingChapter(chapter);
    setFormData({
      title: chapter.title,
      slug: chapter.slug,
      subject_id: chapter.subject_id,
      description: chapter.description || '',
      display_order: chapter.display_order,
      is_active: chapter.is_active
    });
    setModalOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (!editingChapter) {
      const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, title, slug: autoSlug }));
    } else {
      setFormData(prev => ({ ...prev, title }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.subject_id) return;

    setIsSubmitting(true);
    setError(null);
    try {
      if (editingChapter) {
        await adminApi.updateChapter(editingChapter.id, formData, session?.access_token);
      } else {
        await adminApi.createChapter(formData, session?.access_token);
      }
      setModalOpen(false);
      await fetchChapters(selectedSubjectId);
    } catch (err: any) {
      setError(err.message || 'Failed to save chapter');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (chapter: ChapterRow) => {
    try {
      await adminApi.updateChapter(chapter.id, { is_active: !chapter.is_active }, session?.access_token);
      await fetchChapters(selectedSubjectId);
    } catch (err: any) {
      setError(err.message || 'Failed to update chapter status');
    }
  };

  const filteredChapters = chapters.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <AdminLayout
      title="Chapter & Syllabus Management"
      breadcrumbs={[{ label: 'Chapters' }]}
      actions={
        <button
          onClick={() => openCreateModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Chapter</span>
        </button>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Subject Filter Bar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 mb-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <label className="text-xs font-semibold text-slate-700 shrink-0 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Select Subject:</span>
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              navigate(`/admin/chapters?subject_id=${e.target.value}`);
            }}
            className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] bg-slate-50/70 focus:outline-none focus:border-teal-500 max-w-sm"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search chapters in this subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Target Targets Card */}
      <div className="bg-teal-50/60 border border-teal-100 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-teal-900 font-medium">
          <Target className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            {selectedSubject ? `${selectedSubject.name} Content Targets:` : 'Chapter Targets:'} 
            {' '}Target of 7 syllabus chapters per subject, each housing Sectional, Full-Length, and PYQ tests.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold text-[11px]">
            {filteredChapters.length} Chapters Present
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading syllabus chapters...</div>
        ) : filteredChapters.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No chapters found for this subject. Click "New Chapter" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-6">Order</th>
                  <th className="py-3 px-6">Chapter Title</th>
                  <th className="py-3 px-6">Slug</th>
                  <th className="py-3 px-6">Description</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChapters.map((chap) => (
                  <tr key={chap.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-medium text-slate-500">
                      Unit #{chap.display_order}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-[#0F172A]">
                      <div className="flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{chap.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-500 text-[11px]">
                      {chap.slug}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 max-w-xs truncate">
                      {chap.description || '—'}
                    </td>
                    <td className="py-3.5 px-6">
                      <button
                        onClick={() => toggleStatus(chap)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                          chap.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {chap.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => openEditModal(chap)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md font-medium cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-slate-500" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-[#0F172A]">
                {editingChapter ? 'Edit Chapter' : 'Create Chapter'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Parent Subject *
                </label>
                <select
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chapter / Unit Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g. Political Theory: Concepts & Debates"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500"
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
                  placeholder="e.g. political-theory-concepts-debates"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Syllabus Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key concepts, syllabus modules covered in this chapter..."
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Display Order (Unit #)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span className="font-medium text-slate-700">Active on Platform</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#E2E8F0] rounded-lg font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#0D9488] hover:bg-teal-700 text-white rounded-lg font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : editingChapter ? 'Update Chapter' : 'Create Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
