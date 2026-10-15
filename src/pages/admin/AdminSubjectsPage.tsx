import React, { useEffect, useState } from 'react';
import { useRouter } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/api/adminApi';
import { SubjectRow, ExaminationRow } from '../../types/database';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  FolderTree, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  X,
  ExternalLink
} from 'lucide-react';

export function AdminSubjectsPage() {
  const { searchParams, navigate } = useRouter();
  const { session } = useAuth();

  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [examinations, setExaminations] = useState<ExaminationRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectRow | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    slug: '',
    description: '',
    examination_id: '',
    display_order: 1,
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubjectsAndExams = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [subs, exams] = await Promise.all([
        adminApi.getSubjects(session?.access_token),
        adminApi.getExaminations(session?.access_token)
      ]);
      setSubjects(subs);
      setExaminations(exams);

      // If ?action=new was passed in query params
      if (searchParams.get('action') === 'new' && !editingSubject) {
        openCreateModal(exams[0]?.id || '');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectsAndExams();
  }, [session]);

  const openCreateModal = (defaultExamId?: string) => {
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      slug: '',
      description: '',
      examination_id: defaultExamId || examinations[0]?.id || '',
      display_order: subjects.length + 1,
      is_active: true
    });
    setModalOpen(true);
  };

  const openEditModal = (subject: SubjectRow) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      slug: subject.slug,
      description: subject.description || '',
      examination_id: subject.examination_id || examinations[0]?.id || '',
      display_order: subject.display_order,
      is_active: subject.is_active
    });
    setModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!editingSubject) {
      const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, name, slug: autoSlug }));
    } else {
      setFormData(prev => ({ ...prev, name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    setIsSubmitting(true);
    setError(null);
    try {
      if (editingSubject) {
        await adminApi.updateSubject(editingSubject.id, formData, session?.access_token);
      } else {
        await adminApi.createSubject(formData, session?.access_token);
      }
      setModalOpen(false);
      await fetchSubjectsAndExams();
    } catch (err: any) {
      setError(err.message || 'Failed to save subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (subject: SubjectRow) => {
    try {
      await adminApi.updateSubject(subject.id, { is_active: !subject.is_active }, session?.access_token);
      await fetchSubjectsAndExams();
    } catch (err: any) {
      setError(err.message || 'Failed to update subject status');
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout
      title="Subject Management"
      breadcrumbs={[{ label: 'Subjects' }]}
      actions={
        <button
          onClick={() => openCreateModal()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Subject</span>
        </button>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 mb-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search subjects by name, paper code (e.g. HUQP18), or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredSubjects.length} of {subjects.length} subjects
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading subjects...</div>
        ) : filteredSubjects.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No subjects match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-6">Order</th>
                  <th className="py-3 px-6">Subject Name</th>
                  <th className="py-3 px-6">Paper Code</th>
                  <th className="py-3 px-6">Slug</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Chapters</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-medium text-slate-500">
                      #{sub.display_order}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-[#0F172A]">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{sub.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                        {sub.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-500 text-[11px]">
                      {sub.slug}
                    </td>
                    <td className="py-3.5 px-6">
                      <button
                        onClick={() => toggleStatus(sub)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                          sub.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {sub.is_active ? (
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
                    <td className="py-3.5 px-6">
                      <button
                        onClick={() => navigate(`/admin/chapters?subject_id=${sub.id}`)}
                        className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-900 font-medium cursor-pointer"
                      >
                        <FolderTree className="w-3.5 h-3.5" />
                        <span>Manage Chapters</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => openEditModal(sub)}
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
                {editingSubject ? 'Edit Subject' : 'Create Subject'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Political Science"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NTA Paper Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. HUQP18"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg font-mono uppercase focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Examination Association
                </label>
                <select
                  value={formData.examination_id}
                  onChange={(e) => setFormData({ ...formData, examination_id: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500"
                >
                  {examinations.map(exam => (
                    <option key={exam.id} value={exam.id}>{exam.name} ({exam.slug})</option>
                  ))}
                </select>
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
                  placeholder="e.g. political-science"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Target courses (e.g. MA in International Relations, JNU/DU/BHU)..."
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Display Order
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
                  {isSubmitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
