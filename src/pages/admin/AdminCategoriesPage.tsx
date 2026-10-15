import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/api/adminApi';
import { TestCategoryRow } from '../../types/database';
import { 
  Layers, 
  Plus, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  X,
  Clock,
  FileCheck
} from 'lucide-react';

export function AdminCategoriesPage() {
  const { session } = useAuth();
  const [categories, setCategories] = useState<TestCategoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TestCategoryRow | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    default_duration_seconds: 1800,
    default_test_count: 10,
    display_order: 1,
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getCategories(session?.access_token);
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load test categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [session]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      default_duration_seconds: 1800,
      default_test_count: 10,
      display_order: categories.length + 1,
      is_active: true
    });
    setModalOpen(true);
  };

  const openEditModal = (category: TestCategoryRow) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      default_duration_seconds: category.default_duration_seconds,
      default_test_count: category.default_test_count,
      display_order: category.display_order,
      is_active: category.is_active
    });
    setModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!editingCategory) {
      const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, name, slug: autoSlug }));
    } else {
      setFormData(prev => ({ ...prev, name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) return;

    setIsSubmitting(true);
    setError(null);
    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, formData, session?.access_token);
      } else {
        await adminApi.createCategory(formData, session?.access_token);
      }
      setModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to save test category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (cat: TestCategoryRow) => {
    try {
      await adminApi.updateCategory(cat.id, { is_active: !cat.is_active }, session?.access_token);
      await fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  return (
    <AdminLayout
      title="Test Category Management"
      breadcrumbs={[{ label: 'Test Categories' }]}
      actions={
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Info Banner */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 mb-6 shadow-2xs text-xs text-slate-600 leading-relaxed">
        Test categories define the pedagogical tier for mock tests. Initial defaults configured in the database: 
        <strong className="text-slate-900"> Sectional Tests (30 mins / 15 per chapter)</strong>, 
        <strong className="text-slate-900"> Full-Length Tests (90 mins / 10 per chapter)</strong>, and 
        <strong className="text-slate-900"> Previous-Year Question Tests (PYQ / 5 per chapter)</strong>.
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading test categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No categories found. Click "New Category" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-6">Order</th>
                  <th className="py-3 px-6">Category Name</th>
                  <th className="py-3 px-6">Slug</th>
                  <th className="py-3 px-6">Default Duration</th>
                  <th className="py-3 px-6">Default Test Target</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-medium text-slate-500">
                      #{cat.display_order}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-[#0F172A]">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-violet-600 shrink-0" />
                        <span>{cat.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-slate-500 text-[11px]">
                      {cat.slug}
                    </td>
                    <td className="py-3.5 px-6 text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{Math.round(cat.default_duration_seconds / 60)} minutes</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cat.default_test_count} tests / chapter</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <button
                        onClick={() => toggleStatus(cat)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                          cat.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {cat.is_active ? (
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
                        onClick={() => openEditModal(cat)}
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
                {editingCategory ? 'Edit Category' : 'Create Category'}
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Sectional Test"
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
                  placeholder="e.g. sectional"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Default Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    min={5}
                    value={Math.round(formData.default_duration_seconds / 60)}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      default_duration_seconds: (parseInt(e.target.value, 10) || 30) * 60 
                    })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Default Target Target *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.default_test_count}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      default_test_count: parseInt(e.target.value, 10) || 10 
                    })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Pedagogical purpose and CBT layout..."
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
                    <span className="font-medium text-slate-700">Active Category</span>
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
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
