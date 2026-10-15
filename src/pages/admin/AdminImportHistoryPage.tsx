import React, { useEffect, useState } from 'react';
import { useRouter } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi } from '../../lib/api/adminApi';
import { ImportHistoryRow } from '../../types/database';
import { 
  History, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  X,
  Clock,
  ArrowRight
} from 'lucide-react';

export function AdminImportHistoryPage() {
  const { navigate } = useRouter();
  const { session } = useAuth();

  const [history, setHistory] = useState<ImportHistoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Error inspection modal
  const [selectedRecord, setSelectedRecord] = useState<ImportHistoryRow | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const records = await adminApi.getImportHistory(session?.access_token);
      setHistory(records);
    } catch (err: any) {
      setError(err.message || 'Failed to load import history records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [session]);

  return (
    <AdminLayout
      title="Question Import Audit & History"
      breadcrumbs={[{ label: 'Import History' }]}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/questions/import')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D9488] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>New Bulk Import</span>
          </button>
          <button
            onClick={fetchHistory}
            disabled={isLoading}
            className="p-2 text-slate-600 bg-white border border-[#E2E8F0] hover:bg-slate-50 rounded-lg cursor-pointer"
            title="Refresh history"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
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

      {/* History Table Card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">Historical Import Logs</h2>
            <p className="text-xs text-slate-500">Every bulk spreadsheet upload and ingestion result is permanently tracked</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
            {history.length} Logs
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading import logs...</div>
        ) : history.length === 0 ? (
          <div className="p-16 text-center">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-[#0F172A] mb-1">No Imports Performed Yet</h3>
            <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
              Bulk imports from CSV or Excel files will appear here with detailed logs of valid and rejected rows.
            </p>
            <button
              onClick={() => navigate('/admin/questions/import')}
              className="px-4 py-2 bg-[#0D9488] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Upload First Question Spreadsheet
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-6">Filename</th>
                  <th className="py-3 px-6">Format</th>
                  <th className="py-3 px-6">Imported By</th>
                  <th className="py-3 px-6">Rows & Outcomes</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3.5 px-6 font-mono text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(record.created_at).toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Filename */}
                    <td className="py-3.5 px-6 font-bold text-[#0F172A]">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate max-w-[200px]">{record.filename}</span>
                      </div>
                    </td>

                    {/* Format */}
                    <td className="py-3.5 px-6 font-mono uppercase text-slate-600">
                      {record.file_type}
                    </td>

                    {/* Importer */}
                    <td className="py-3.5 px-6 text-slate-700">
                      {record.importer_name || 'System Admin'}
                    </td>

                    {/* Counts */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{record.total_rows} total</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-emerald-700 font-semibold">{record.successful_count} valid</span>
                        {record.error_count > 0 && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-rose-600 font-semibold">{record.error_count} rejected</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                        record.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : record.status === 'partial'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {record.status === 'completed' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                        {record.status === 'partial' && <AlertCircle className="w-3 h-3 text-amber-600" />}
                        {record.status === 'failed' && <XCircle className="w-3 h-3 text-rose-600" />}
                        <span>{record.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      {record.errors && record.errors.length > 0 ? (
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md font-semibold cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Errors</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ERROR INSPECTION MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xl max-w-2xl w-full p-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">
                  Rejected Rows: {selectedRecord.filename}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedRecord.error_count} row(s) failed validation and were excluded during import
                </p>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {selectedRecord.errors.map((err, idx) => (
                <div key={idx} className="p-3 bg-rose-50 border border-rose-100 rounded-lg">
                  <div className="flex items-center justify-between text-rose-900 font-bold mb-1">
                    <span>Row #{err.row}</span>
                  </div>
                  <p className="text-rose-700 text-xs leading-relaxed font-mono">
                    {err.error}
                  </p>
                  {err.data?.text && (
                    <div className="text-[11px] text-slate-500 mt-1 italic">
                      Snippet: "{err.data.text}..."
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
