import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, QuestionDifficulty, QuestionMaterial } from '../../types';
import { parseCSV, downloadCSV } from '../../utils/exportHelpers';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  X, 
  Check,
  Info
} from 'lucide-react';

interface ParsedImportRow {
  rowNumber: number;
  question: string;
  optA: string;
  optB: string;
  optC: string;
  optD: string;
  correctKey: string;
  material: QuestionMaterial;
  submaterial: string;
  difficulty: QuestionDifficulty;
  explanation: string;
  isValid: boolean;
  validationErrors: string[];
}

export const AdminImportQuestions: React.FC = () => {
  const { questions, importQuestions } = useApp();

  const [csvContent, setCsvContent] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleDownloadTemplate = () => {
    const headers = ['No', 'Pertanyaan', 'Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D', 'Kunci', 'Materi', 'Submateri', 'Kesulitan', 'Pembahasan'];
    const sampleRows = [
      [
        '1',
        'Struktur data yang bekerja dengan prinsip First-In First-Out (FIFO) adalah...',
        'Stack',
        'Queue',
        'Tree',
        'Graph',
        'B',
        'Struktur Data',
        'Queue & FIFO',
        'Mudah',
        'Queue menerapkan prinsip FIFO di mana elemen pertama masuk akan keluar pertama.'
      ],
      [
        '2',
        'Gerbang logika yang menghasilkan output 1 jika kedua input bernilai 1 adalah...',
        'OR',
        'XOR',
        'AND',
        'NOT',
        'C',
        'Logika Informatika',
        'Gerbang Logika Dasar',
        'Mudah',
        'Gerbang AND hanya menghasilkan 1 saat seluruh inputnya bernilai 1.'
      ]
    ];
    downloadCSV('Template_Import_Soal_Informatika.csv', sampleRows, headers);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setCsvContent(text);
      processCSV(text);
    };
    reader.readAsText(file);
  };

  const processCSV = (rawText: string) => {
    setSuccessMessage('');
    setErrorMessage('');

    if (!rawText.trim()) {
      setParsedRows([]);
      return;
    }

    const rows = parseCSV(rawText);
    if (rows.length < 2) {
      setErrorMessage('Format file tidak memiliki baris data.');
      return;
    }

    // Skip header row
    const dataRows = rows.slice(1);
    const existingQuestions = new Set(questions.map(q => q.question.toLowerCase().trim()));

    const parsed: ParsedImportRow[] = dataRows.map((row, idx) => {
      const errors: string[] = [];
      const questionText = row[1]?.trim() || '';
      const optA = row[2]?.trim() || '';
      const optB = row[3]?.trim() || '';
      const optC = row[4]?.trim() || '';
      const optD = row[5]?.trim() || '';
      const correctKey = (row[6]?.trim() || '').toUpperCase();
      const rawMaterial = row[7]?.trim() || 'Struktur Data';
      const material: QuestionMaterial = rawMaterial.toLowerCase().includes('logika') ? 'Logika Informatika' : 'Struktur Data';
      const submaterial = row[8]?.trim() || 'Umum';
      const rawDiff = row[9]?.trim() || 'Sedang';
      const difficulty: QuestionDifficulty = ['Mudah', 'Sedang', 'Sulit'].includes(rawDiff) ? (rawDiff as QuestionDifficulty) : 'Sedang';
      const explanation = row[10]?.trim() || 'Pembahasan kunci jawaban.';

      // Validations (PRD Section 9)
      if (!questionText) errors.push('Pertanyaan kosong');
      if (!optA || !optB || !optC || !optD) errors.push('Opsi pilihan A, B, C, D belum lengkap');
      if (!['A', 'B', 'C', 'D'].includes(correctKey)) errors.push(`Kunci jawaban "${correctKey}" tidak valid (harus A/B/C/D)`);
      if (existingQuestions.has(questionText.toLowerCase())) errors.push('Duplikasi dengan soal yang sudah ada');

      return {
        rowNumber: idx + 1,
        question: questionText,
        optA,
        optB,
        optC,
        optD,
        correctKey,
        material,
        submaterial,
        difficulty,
        explanation,
        isValid: errors.length === 0,
        validationErrors: errors
      };
    });

    setParsedRows(parsed);
  };

  const handleExecuteImport = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      setErrorMessage('Tidak ada baris data valid yang dapat diimpor.');
      return;
    }

    const formattedQuestions: Question[] = validRows.map((r, idx) => ({
      id: `IMP_${Date.now()}_${idx + 1}`,
      question: r.question,
      options: [
        { id: 'A', text: r.optA },
        { id: 'B', text: r.optB },
        { id: 'C', text: r.optC },
        { id: 'D', text: r.optD }
      ],
      correctOptionId: r.correctKey,
      material: r.material,
      submaterial: r.submaterial,
      difficulty: r.difficulty,
      explanation: r.explanation,
      source: 'Import Massal Excel/CSV',
      status: 'active',
      createdAt: new Date().toISOString()
    }));

    importQuestions(formattedQuestions);
    setSuccessMessage(`Sukses mengimpor ${formattedQuestions.length} butir soal ke dalam Bank Soal!`);
    setParsedRows([]);
    setCsvContent('');
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Unggah / Import Soal Massal (PRD Modul 9 & 40)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Unggah puluhan atau ratusan butir soal sekaligus melalui template Excel/CSV dengan validasi otomatis.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          Unduh Template Excel (.CSV)
        </button>
      </div>

      {/* Upload Drag & Drop Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" />
            Pilih File Soal (.csv / .xlsx)
          </h3>

          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-50/50 transition-colors relative cursor-pointer">
            <input
              type="file"
              accept=".csv, .txt, .xlsx"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <div className="text-xs font-bold text-slate-700">
              Klik atau Seret file CSV/Excel ke sini
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Mendukung format standar kolom template asesmen
            </div>
          </div>
        </div>

        {/* Or Paste CSV Text Box */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Atau Tempel (Paste) Teks CSV Langsung
            </h3>
            <textarea
              rows={4}
              value={csvContent}
              onChange={e => {
                setCsvContent(e.target.value);
                processCSV(e.target.value);
              }}
              placeholder={`No,Pertanyaan,Pilihan A,Pilihan B,Pilihan C,Pilihan D,Kunci,Materi,Submateri,Kesulitan,Pembahasan\n1,"Soal FIFO...","Stack","Queue","Tree","Graph","B","Struktur Data","Queue","Mudah","Pembahasan..."`}
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-right">
            <button
              onClick={() => processCSV(csvContent)}
              className="py-2 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Proses Validasi Data
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Preview & Validation Table */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hasil Validasi Soal ({parsedRows.length} Baris Terdeteksi)
              </h3>
              <div className="flex items-center gap-3 text-xs mt-1">
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  ✓ {validCount} Siap Diimpor
                </span>
                {invalidCount > 0 && (
                  <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                    ✗ {invalidCount} Perlu Diperbaiki
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleExecuteImport}
              disabled={validCount === 0}
              className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-40 cursor-pointer self-start sm:self-auto"
            >
              Impor {validCount} Soal Valid ke Bank Soal
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Pertanyaan</th>
                  <th className="p-3">Pilihan (A / B / C / D)</th>
                  <th className="p-3 w-16 text-center">Kunci</th>
                  <th className="p-3 w-28">Materi</th>
                  <th className="p-3 w-28">Status Validasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map(row => (
                  <tr key={row.rowNumber} className={row.isValid ? 'hover:bg-slate-50/60' : 'bg-rose-50/30'}>
                    <td className="p-3 text-center font-mono font-bold text-slate-500">{row.rowNumber}</td>
                    <td className="p-3 font-medium text-slate-900 max-w-xs truncate">{row.question || '<Kosong>'}</td>
                    <td className="p-3 text-slate-600 space-y-0.5 max-w-xs text-[11px]">
                      <div>A: {row.optA}</div>
                      <div>B: {row.optB}</div>
                      <div>C: {row.optC}</div>
                      <div>D: {row.optD}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 font-bold rounded">
                        {row.correctKey || '-'}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{row.material}</td>
                    <td className="p-3">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold text-[11px]">
                          <Check className="w-3 h-3" /> Valid
                        </span>
                      ) : (
                        <div className="text-rose-600 font-bold text-[10px] space-y-0.5">
                          {row.validationErrors.map((err, i) => (
                            <div key={i}>• {err}</div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
