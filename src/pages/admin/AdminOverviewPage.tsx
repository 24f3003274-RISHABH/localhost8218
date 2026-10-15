import React, { useEffect, useState } from 'react';
import { useRouter } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi, AdminSummaryStats } from '../../lib/api/adminApi';
import { 
  GraduationCap, 
  BookOpen, 
  FolderTree, 
  HelpCircle, 
  FileCheck2, 
  Plus, 
  FileSpreadsheet, 
  ArrowUpRight, 
  RefreshCw, 
  Activity, 
  Clock, 
  AlertCircle
} from 'lucide-react';

export function AdminOverviewPage() {
  const { navigate } = useRouter();
  const { session } = useAuth();
  const [stats, setStats] = useState<AdminSummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getSummary(session?.access_token);
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrative metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [session]);

  const quickActions = [
    { label: 'Add Subject', href: '/admin/subjects?action=new', icon: BookOpen, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Add Chapter', href: '/admin/chapters?action=new', icon: FolderTree, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { label: 'Add Question', href: '/admin/questions/new', icon: Plus, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { label: 'Import Questions', href: '/admin/questions/import', icon: FileSpreadsheet, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'Create Test', href: '/admin/tests/new', icon: FileCheck2, color: 'text-violet-600 bg-violet-50 border-violet-200' },
  ];

  return (
    <AdminLayout 
      title="Platform Operations & Content Overview"
      breadcrumbs={[{ label: 'Dashboard Overview' }]}
      actions={
        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
          <span>Refresh Metrics</span>
        </button>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Examinations */}
        <div 
          onClick={() => navigate('/admin/examinations')}
          className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Examinations</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A]">
              {isLoading ? '...' : stats?.examinations ?? 1}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              Active: CUET PG <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </p>
          </div>
        </div>

        {/* Subjects */}
        <div 
          onClick={() => navigate('/admin/subjects')}
          className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Subjects</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A]">
              {isLoading ? '...' : stats?.subjects ?? 7}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              Initial CUET PG Domains <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </p>
          </div>
        </div>

        {/* Chapters */}
        <div 
          onClick={() => navigate('/admin/chapters')}
          className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Chapters</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A]">
              {isLoading ? '...' : stats?.chapters ?? 49}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              Syllabus Units <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </p>
          </div>
        </div>

        {/* Questions Bank */}
        <div 
          onClick={() => navigate('/admin/questions')}
          className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Questions</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A]">
              {isLoading ? '...' : stats?.questions.total ?? 0}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px]">
              <span className="text-emerald-700 font-medium">
                {stats?.questions.published ?? 0} pub
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">
                {stats?.questions.draft ?? 0} draft
              </span>
            </div>
          </div>
        </div>

        {/* Tests & Mocks */}
        <div 
          onClick={() => navigate('/admin/tests')}
          className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Mock Tests</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A]">
              {isLoading ? '...' : stats?.tests.total ?? 0}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px]">
              <span className="text-emerald-700 font-medium">
                {stats?.tests.published ?? 0} live
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">
                {stats?.tests.draft ?? 0} draft
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.href)}
                className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-[#E2E8F0] hover:border-teal-300 hover:shadow-2xs transition-all text-left cursor-pointer group"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${action.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#0F172A] group-hover:text-teal-700 truncate">
                    {action.label}
                  </div>
                  <div className="text-[10px] text-slate-400">Launch form</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RECENT ACTIVITY & SYSTEM OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Log */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-sm text-[#0F172A]">Recent Administrative Activity</h3>
            </div>
            <span className="text-[11px] text-slate-400">Audit trail log</span>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading audit log events...</div>
          ) : stats?.recent_activity && stats.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_activity.slice(0, 6).map((log: any) => (
                <div key={log.id} className="flex items-start justify-between p-3 rounded-lg bg-slate-50/70 border border-slate-100 text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">
                      {log.action?.replace(/_/g, ' ')}
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Entity: <span className="font-mono text-slate-600">{log.entity_type}</span>
                      {log.entity_id && ` (${log.entity_id.slice(0, 8)}...)`}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs">
              No recent administrative actions recorded yet. All administrative actions (creating subjects, importing questions, or modifying tests) are logged here.
            </div>
          )}
        </div>

        {/* Content Status & Guidelines */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#0F172A] mb-3 pb-3 border-b border-slate-100">
              Content Pipeline
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-teal-50/50 border border-teal-100">
                <div className="font-bold text-teal-900 mb-1">Target Test Targets</div>
                <p className="text-teal-700 leading-relaxed text-[11px]">
                  Each subject contains 7 syllabus chapters, with target targets of 15 Sectional Tests, 10 Full-Length Mocks, and 5 PYQs per chapter.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-800 mb-1">Question Bank Format</div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Questions adhere to official NTA CBT scheme: +4 for correct, -1 for incorrect. Import via standard CSV or Excel files.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => navigate('/admin/questions/import')}
              className="w-full py-2 px-3 bg-[#0D9488] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Bulk Import Questions</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
