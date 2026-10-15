import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminApi, BulkImportResult } from '../../lib/api/adminApi';
import { SubjectRow, ChapterRow } from '../../types/database';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  ArrowLeft, 
  FileText, 
  HelpCircle,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';

interface ParsedQuestionRow {
  rowIndex: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation?: string;
  difficulty?: 'easy' | 'moderate' | 'hard';
  positive_marks?: number;
  negative_marks?: number;
  topic?: string;
  subject_id?: string;
  chapter_id?: string;
  isValid: boolean;
  errors: string[];
}

export function AdminBulkImportPage() {
  const { navigate } = useRouter();
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [defaultSubjectId, setDefaultSubjectId] = useState('');
  const [defaultChapterId, setDefaultChapterId] = useState('');

  // File & Parsing State
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'csv' | 'xlsx'>('csv');
  const [parsedRows, setParsedRows] = useState<ParsedQuestionRow[]>([]);
  const [filterView, setFilterView] = useState<'all' | 'valid' | 'errors'>('all');
  const [isParsing, setIsParsing] = useState(false);

  // Import Execution State
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Load available subjects
  useEffect(() => {
    async function loadMeta() {
      try {
        const subs = await adminApi.getSubjects(session?.access_token);
        setSubjects(subs);
        if (subs.length > 0) {
          setDefaultSubjectId(subs[0].id);
          const chaps = await adminApi.getChapters(subs[0].id, session?.access_token);
          setChapters(chaps);
        }
      } catch (err: any) {
        console.error(err);
      }
    }
    loadMeta();
  }, [session]);

  const handleSubjectChange = async (subId: string) => {
    setDefaultSubjectId(subId);
    setDefaultChapterId('');
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

    // Re-validate parsed rows if any
    if (parsedRows.length > 0) {
      revalidateRows(parsedRows, subId, defaultChapterId);
    }
  };

  const handleChapterChange = (chapId: string) => {
    setDefaultChapterId(chapId);
    if (parsedRows.length > 0) {
      revalidateRows(parsedRows, defaultSubjectId, chapId);
    }
  };

  // Re-validates question rows with the currently selected default subject
  const revalidateRows = (rows: ParsedQuestionRow[], targetSubId: string, targetChapId: string) => {
    const updated = rows.map(row => {
      const errors: string[] = [];
      const effectiveSubId = row.subject_id || targetSubId;

      if (!effectiveSubId) errors.push('Missing Subject ID assignment');
      if (!row.question_text || row.question_text.trim().length < 5) {
        errors.push('Question statement must be at least 5 characters');
      }
      if (!row.option_a || !row.option_a.trim()) errors.push('Option A is required');
      if (!row.option_b || !row.option_b.trim()) errors.push('Option B is required');

      const normCorrect = (row.correct_option || '').toUpperCase().trim();
      if (!['A', 'B', 'C', 'D'].includes(normCorrect)) {
        errors.push(`Correct key must be A, B, C, or D (found "${row.correct_option}")`);
      }

      return {
        ...row,
        subject_id: effectiveSubId,
        chapter_id: row.chapter_id || targetChapId || undefined,
        isValid: errors.length === 0,
        errors
      };
    });
    setParsedRows(updated);
  };

  // Process File: CSV or XLSX
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    setFileType(isExcel ? 'xlsx' : 'csv');
    setIsParsing(true);
    setGeneralError(null);
    setImportResult(null);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setGeneralError('The uploaded file contains no data rows.');
          setIsParsing(false);
          return;
        }

        // Parse and normalize rows
        const parsed: ParsedQuestionRow[] = rawJson.map((r, idx) => {
          // Normalize header key lookups
          const getField = (candidates: string[]) => {
            for (const key of Object.keys(r)) {
              const clean = key.toLowerCase().replace(/[^a-z0-9]/g, '');
              for (const cand of candidates) {
                if (clean === cand.toLowerCase().replace(/[^a-z0-9]/g, '')) {
                  return String(r[key]).trim();
                }
              }
            }
            return '';
          };

          const question_text = getField(['question_text', 'question', 'prompt', 'statement']);
          const option_a = getField(['option_a', 'option1', 'opt_a', 'a']);
          const option_b = getField(['option_b', 'option2', 'opt_b', 'b']);
          const option_c = getField(['option_c', 'option3', 'opt_c', 'c']);
          const option_d = getField(['option_d', 'option4', 'opt_d', 'd']);
          const rawCorrect = getField(['correct_option', 'correct_answer', 'answer', 'key', 'answer_key']);
          const explanation = getField(['explanation', 'solution', 'rationale']);
          const difficultyRaw = getField(['difficulty', 'level']).toLowerCase();
          const topic = getField(['topic', 'tag', 'subtheme']);

          const posMarks = parseFloat(getField(['positive_marks', 'marks', 'positive'])) || 4;
          const negMarks = parseFloat(getField(['negative_marks', 'negative', 'penalty'])) || 1;

          const difficulty: 'easy' | 'moderate' | 'hard' = 
            ['easy', 'moderate', 'hard'].includes(difficultyRaw) ? (difficultyRaw as any) : 'moderate';

          const errors: string[] = [];
          if (!defaultSubjectId) errors.push('No target subject specified');
          if (!question_text || question_text.length < 5) {
            errors.push('Question statement must be at least 5 characters');
          }
          if (!option_a) errors.push('Option A is missing');
          if (!option_b) errors.push('Option B is missing');

          const correctNorm = rawCorrect.toUpperCase();
          if (!['A', 'B', 'C', 'D'].includes(correctNorm)) {
            errors.push(`Correct option must be A, B, C, or D (found "${rawCorrect}")`);
          }

          return {
            rowIndex: idx + 2, // 1-indexed header + 1
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option: correctNorm,
            explanation,
            difficulty,
            positive_marks: posMarks,
            negative_marks: negMarks,
            topic,
            subject_id: defaultSubjectId,
            chapter_id: defaultChapterId || undefined,
            isValid: errors.length === 0,
            errors
          };
        });

        setParsedRows(parsed);
      } catch (err: any) {
        setGeneralError(`Failed to parse file: ${err.message}`);
      } finally {
        setIsParsing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Download Sample Template CSV
  const downloadSampleCsv = () => {
    const csvContent = 
`question_text,option_a,option_b,option_c,option_d,correct_option,explanation,difficulty,positive_marks,negative_marks,topic
"Who authored the foundational text 'The Republic' analyzing the philosopher king?","Aristotle","Plato","Socrates","Machiavelli","B","Plato wrote The Republic introducing justice, the ideal state, and philosopher-rulers.","easy",4,1,"Classical Political Philosophy"
"Which constitutional amendment introduced the Goods and Services Tax (GST) in India?","99th Amendment","100th Amendment","101st Amendment","102nd Amendment","C","The 101st Constitutional Amendment Act 2016 introduced GST in India.","moderate",4,1,"Indian Constitution & Governance"
"In cognitive psychology, working memory capacity is famously estimated at 7±2 items by which theorist?","Jean Piaget","B.F. Skinner","George A. Miller","Ulric Neisser","C","George A. Miller proposed the 7±2 magical number in 1956.","moderate",4,1,"Cognitive Psychology"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'primeprep_questions_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sample Template Excel XLSX using the xlsx library
  const downloadSampleXlsx = () => {
    const sampleData = [
      {
        question_text: "Who authored the foundational text 'The Republic' analyzing the philosopher king?",
        option_a: "Aristotle",
        option_b: "Plato",
        option_c: "Socrates",
        option_d: "Machiavelli",
        correct_option: "B",
        explanation: "Plato wrote The Republic introducing justice, the ideal state, and philosopher-rulers.",
        difficulty: "easy",
        positive_marks: 4,
        negative_marks: 1,
        topic: "Classical Political Philosophy"
      },
      {
        question_text: "Which constitutional amendment introduced the Goods and Services Tax (GST) in India?",
        option_a: "99th Amendment",
        option_b: "100th Amendment",
        option_c: "101st Amendment",
        option_d: "102nd Amendment",
        correct_option: "C",
        explanation: "The 101st Constitutional Amendment Act 2016 introduced GST in India.",
        difficulty: "moderate",
        positive_marks: 4,
        negative_marks: 1,
        topic: "Indian Constitution & Governance"
      },
      {
        question_text: "In cognitive psychology, working memory capacity is famously estimated at 7±2 items by which theorist?",
        option_a: "Jean Piaget",
        option_b: "B.F. Skinner",
        option_c: "George A. Miller",
        option_d: "Ulric Neisser",
        correct_option: "C",
        explanation: "George A. Miller proposed the 7±2 magical number in 1956.",
        difficulty: "moderate",
        positive_marks: 4,
        negative_marks: 1,
        topic: "Cognitive Psychology"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');
    XLSX.writeFile(workbook, 'primeprep_questions_import_template.xlsx');
  };

  // Execute Bulk Import to API
  const handleExecuteImport = async () => {
    const validQuestions = parsedRows.filter(r => r.isValid);
    if (validQuestions.length === 0) {
      setGeneralError('No valid questions to import.');
      return;
    }

    setIsImporting(true);
    setGeneralError(null);

    try {
      const payload = {
        filename: fileName || 'bulk_questions_import',
        file_type: fileType,
        subject_id: defaultSubjectId,
        chapter_id: defaultChapterId || undefined,
        questions: validQuestions.map(q => ({
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c || '',
          option_d: q.option_d || '',
          correct_option: q.correct_option as any,
          explanation: q.explanation,
          difficulty: q.difficulty,
          positive_marks: q.positive_marks,
          negative_marks: q.negative_marks,
          topic: q.topic
        }))
      };

      const result = await adminApi.bulkImportQuestions(payload, session?.access_token);
      setImportResult(result);
    } catch (err: any) {
      setGeneralError(err.message || 'Bulk import process failed.');
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  const displayedRows = parsedRows.filter(r => {
    if (filterView === 'valid') return r.isValid;
    if (filterView === 'errors') return !r.isValid;
    return true;
  });

  return (
    <AdminLayout
      title="Bulk Question Import Engine"
      breadcrumbs={[
        { label: 'Questions', href: '/admin/questions' },
        { label: 'Bulk Import' }
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
      {generalError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{generalError}</span>
        </div>
      )}

      {/* IMPORT COMPLETED BANNER */}
      {importResult && (
        <div className="mb-6 p-6 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base text-emerald-900">
                Bulk Import Operation Completed Successfully!
              </h3>
              <p className="text-xs text-emerald-700 mt-1">
                {importResult.message || `Imported ${importResult.successful_count} questions into the active question bank.`}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => navigate('/admin/questions')}
                  className="px-4 py-2 bg-[#0D9488] hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  View Question Bank
                </button>
                <button
                  onClick={() => navigate('/admin/import-history')}
                  className="px-4 py-2 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  View Import History Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: CONFIGURATION & TEMPLATES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Step 1A: Target Scope */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-sm text-[#0F172A]">Default Subject & Chapter</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Specify the default syllabus module for rows that do not specify an individual subject ID.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Subject *</label>
              <select
                value={defaultSubjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Chapter</label>
              <select
                value={defaultChapterId}
                onChange={(e) => handleChapterChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value="">General (Multiple Chapters)</option>
                {chapters.map(c => (
                  <option key={c.id} value={c.id}>Unit #{c.display_order}: {c.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 1B: Download Templates */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="font-bold text-sm text-[#0F172A]">Download Templates</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Get official pre-formatted templates matching PrimePrep database schema and NTA CBT formats.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={downloadSampleCsv}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-[#E2E8F0] text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-teal-600" />
              <span>Download CSV Template (.csv)</span>
            </button>
            <button
              onClick={downloadSampleXlsx}
              className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Download Excel Template (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Step 1C: Upload Dropzone */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-bold text-sm text-[#0F172A]">Upload Spreadsheet</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Select or drop your populated question file. Supports <strong className="text-slate-800">.csv</strong> and <strong className="text-slate-800">.xlsx</strong> files.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-xl bg-teal-50/30 hover:bg-teal-50/60 text-center transition-colors cursor-pointer"
            >
              <UploadCloud className="w-7 h-7 text-teal-600 mx-auto mb-1.5" />
              <div className="text-xs font-bold text-[#0F172A]">
                {fileName ? fileName : 'Choose File or Drop Here'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Up to 500 questions per batch
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* STEP 2: PREVIEW GRID & VALIDATION */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden mb-8">
          {/* Preview Header & Stats */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-sm text-[#0F172A]">
                  Import Preview & Validation: {fileName}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect parsed rows and resolve any format issues before saving into the database.
              </p>
            </div>

            {/* Validation Filter Badges */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setFilterView('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterView === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({parsedRows.length})
              </button>
              <button
                onClick={() => setFilterView('valid')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterView === 'valid' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Valid ({validCount})
              </button>
              <button
                onClick={() => setFilterView('errors')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterView === 'errors' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Errors ({invalidCount})
              </button>
            </div>
          </div>

          {/* Validation Warnings Summary if errors exist */}
          {invalidCount > 0 && (
            <div className="px-6 py-3 bg-rose-50/70 border-b border-rose-100 flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Found <strong className="font-bold">{invalidCount} invalid rows</strong>. Only valid rows ({validCount}) will be inserted into the database.
              </span>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-4">Row</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 max-w-sm">Question Prompt</th>
                  <th className="py-2.5 px-4">Options (A, B, C, D)</th>
                  <th className="py-2.5 px-4">Key</th>
                  <th className="py-2.5 px-4">Marks</th>
                  <th className="py-2.5 px-4">Validation Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedRows.map((row) => (
                  <tr key={row.rowIndex} className={`transition-colors ${row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/30 hover:bg-rose-50/50'}`}>
                    <td className="py-3 px-4 font-mono font-medium text-slate-500">
                      #{row.rowIndex}
                    </td>

                    <td className="py-3 px-4">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Valid</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Invalid</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-sm font-medium text-[#0F172A] truncate">
                      {row.question_text || <span className="text-rose-500 italic">[Empty Question]</span>}
                    </td>

                    <td className="py-3 px-4 text-[11px] text-slate-600 font-mono">
                      A: {row.option_a?.slice(0, 15)} | B: {row.option_b?.slice(0, 15)}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded font-bold text-xs ${
                        ['A', 'B', 'C', 'D'].includes(row.correct_option) 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {row.correct_option || '?'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500">
                      +{row.positive_marks}/-{row.negative_marks}
                    </td>

                    <td className="py-3 px-4 text-xs">
                      {row.isValid ? (
                        <span className="text-emerald-700">Ready for batch insert</span>
                      ) : (
                        <span className="text-rose-600 font-medium">{row.errors.join('; ')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Footer */}
          <div className="p-5 border-t border-slate-100 bg-[#F8F9FA] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              Ready to import <strong className="font-bold text-[#0F172A]">{validCount} valid questions</strong> into subject repository.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setParsedRows([])}
                className="px-4 py-2 border border-[#E2E8F0] rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Clear File
              </button>
              <button
                type="button"
                disabled={validCount === 0 || isImporting}
                onClick={handleExecuteImport}
                className="px-6 py-2 bg-[#0D9488] hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isImporting ? 'Processing Transactional Import...' : `Confirm & Import (${validCount} Questions)`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
