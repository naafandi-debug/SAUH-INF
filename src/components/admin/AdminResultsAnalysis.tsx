import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentExamSession } from '../../types';
import { downloadCSV } from '../../utils/exportHelpers';
import { 
  BarChart3, 
  Download, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  TrendingUp, 
  Filter, 
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AdminResultsAnalysis: React.FC = () => {
  const { students, activeExam, exams, sessions, questions } = useApp();

  const [selectedExamId, setSelectedExamId] = useState<string>(activeExam?.id || exams[0]?.id || 'EXAM_1');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'rekap' | 'analisis_butir'>('rekap');

  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0];

  // Submitted sessions for current exam
  const examSubmittedSessions = useMemo(() => {
    const allSessions = Object.values(sessions) as StudentExamSession[];
    return allSessions.filter(s => s.examId === currentExam?.id && s.submitted);
  }, [sessions, currentExam]);

  // Student results list
  const resultsList = useMemo(() => {
    return examSubmittedSessions.map((sess, idx) => {
      const student = students.find(st => st.id === sess.studentId);
      const isPassed = (sess.score || 0) >= (currentExam?.kkm || 75);
      const timeSpentMinutes = Math.round(((sess.endTime || Date.now()) - sess.startTime) / 60000);

      return {
        rank: idx + 1,
        sessionId: sess.id,
        studentId: sess.studentId,
        nisn: student?.nisn || sess.studentNisn || '-',
        name: student?.name || sess.studentName,
        className: student?.className || sess.className,
        correctCount: sess.correctCount || 0,
        wrongCount: sess.wrongCount || (sess.questions.length - (sess.correctCount || 0)),
        score: sess.score || 0,
        passed: isPassed,
        timeSpentMinutes,
        violationsCount: sess.violations?.length || 0,
        answers: sess.answers || {},
        questions: sess.questions
      };
    }).sort((a, b) => b.score - a.score);
  }, [examSubmittedSessions, students, currentExam]);

  const filteredResults = useMemo(() => {
    return resultsList.filter(item => {
      const matchClass = selectedClass === 'all' || item.className === selectedClass;
      const matchSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nisn.includes(searchQuery);
      return matchClass && matchSearch;
    });
  }, [resultsList, selectedClass, searchQuery]);

  // Item Analysis (Analisis Butir Soal - PRD Section 15)
  const itemAnalysisData = useMemo(() => {
    if (examSubmittedSessions.length === 0) return [];

    // Map each question
    const questionStatsMap: Record<string, {
      questionId: string;
      questionText: string;
      material: string;
      submaterial: string;
      correctOptionId: string;
      correctAnswerCount: number;
      totalAttempts: number;
      optionDistribution: Record<string, number>;
    }> = {};

    examSubmittedSessions.forEach(sess => {
      sess.questions.forEach(qItem => {
        if (!questionStatsMap[qItem.questionId]) {
          questionStatsMap[qItem.questionId] = {
            questionId: qItem.questionId,
            questionText: qItem.originalQuestion.question,
            material: qItem.originalQuestion.material,
            submaterial: qItem.originalQuestion.submaterial,
            correctOptionId: qItem.originalQuestion.correctOptionId,
            correctAnswerCount: 0,
            totalAttempts: 0,
            optionDistribution: { A: 0, B: 0, C: 0, D: 0 }
          };
        }

        const stats = questionStatsMap[qItem.questionId];
        const studentAns = sess.answers[qItem.questionId];

        if (studentAns) {
          stats.totalAttempts += 1;
          stats.optionDistribution[studentAns] = (stats.optionDistribution[studentAns] || 0) + 1;
          if (studentAns === qItem.originalQuestion.correctOptionId) {
            stats.correctAnswerCount += 1;
          }
        }
      });
    });

    return Object.values(questionStatsMap).map(item => {
      const percentage = item.totalAttempts > 0 
        ? Math.round((item.correctAnswerCount / item.totalAttempts) * 100) 
        : 0;

      let difficultyCategory = 'Sedang';
      let needRemedial = false;

      if (percentage >= 80) {
        difficultyCategory = 'Sangat Mudah';
      } else if (percentage >= 50) {
        difficultyCategory = 'Sedang';
      } else {
        difficultyCategory = 'Sukar / Sulit';
        needRemedial = true;
      }

      return {
        ...item,
        percentage,
        difficultyCategory,
        needRemedial
      };
    }).sort((a, b) => a.percentage - b.percentage);
  }, [examSubmittedSessions]);

  const handleExportResults = () => {
    const headers = ['Peringkat', 'NISN', 'Nama Siswa', 'Kelas', 'Benar', 'Salah', 'Nilai Akhir', 'Status KKM', 'Durasi (Mnt)', 'Pelanggaran'];
    const rows = filteredResults.map((r, i) => [
      i + 1,
      r.nisn,
      r.name,
      r.className,
      r.correctCount,
      r.wrongCount,
      r.score,
      r.passed ? 'TUNTAS' : 'REMEDIAL',
      r.timeSpentMinutes,
      r.violationsCount
    ]);
    downloadCSV(`Rekap_Nilai_${currentExam?.name.replace(/ /g, '_')}_${Date.now()}.csv`, rows, headers);
  };

  const handleExportItemAnalysis = () => {
    const headers = ['ID Soal', 'Materi', 'Submateri', 'Teks Soal', 'Kunci', 'Persentase Benar (%)', 'Tingkat Kesulitan Riil', 'Perlu Remedial'];
    const rows = itemAnalysisData.map(item => [
      item.questionId,
      item.material,
      item.submaterial,
      item.questionText,
      item.correctOptionId,
      `${item.percentage}%`,
      item.difficultyCategory,
      item.needRemedial ? 'YA (Rekomendasi Remedial)' : 'TIDAK'
    ]);
    downloadCSV(`Analisis_Butir_Soal_${currentExam?.name.replace(/ /g, '_')}_${Date.now()}.csv`, rows, headers);
  };

  const scores = resultsList.map(r => r.score);
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0.0';
  const passedCount = resultsList.filter(r => r.passed).length;
  const passRate = resultsList.length > 0 ? Math.round((passedCount / resultsList.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Hasil Evaluasi & Analisis Butir Soal (PRD Modul 14 & 15)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Lihat perolehan nilai siswa, tingkat ketuntasan KKM, serta analisis daya pembeda butir soal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedExamId}
            onChange={e => setSelectedExamId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
          >
            {exams.map(ex => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>

          {activeTab === 'rekap' ? (
            <button
              onClick={handleExportResults}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Rekap Nilai (.CSV)
            </button>
          ) : (
            <button
              onClick={handleExportItemAnalysis}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Analisis Butir (.CSV)
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Siswa Mengumpulkan</div>
          <div className="text-2xl font-black text-slate-900 mt-2">{resultsList.length} Siswa</div>
          <div className="text-[11px] text-slate-400 mt-1">Dari {students.length} Terdaftar</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Rata-Rata Nilai</div>
          <div className="text-2xl font-black text-blue-600 mt-2">{avgScore}</div>
          <div className="text-[11px] text-slate-500 mt-1">Standar KKM: {currentExam?.kkm || 75}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Ketuntasan Belajar</div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{passRate}%</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">{passedCount} Siswa Tuntas</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Perlu Remedial</div>
          <div className="text-2xl font-black text-rose-600 mt-2">{resultsList.length - passedCount} Siswa</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Di bawah KKM</div>
        </div>
      </div>

      {/* Tabs Switcher: Rekap Nilai vs Analisis Butir Soal */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('rekap')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'rekap'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          1. Rekap Perolehan Nilai Siswa
        </button>
        <button
          onClick={() => setActiveTab('analisis_butir')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'analisis_butir'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          2. Analisis Daya Serap & Butir Soal (Remedial Guide)
        </button>
      </div>

      {/* Tab 1: Rekap Nilai Table */}
      {activeTab === 'rekap' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <input
                type="text"
                placeholder="Cari berdasarkan nama siswa atau NISN..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            <div className="sm:col-span-4">
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="all">Semua Kelas</option>
                <option value="9A">Kelas 9A</option>
                <option value="9B">Kelas 9B</option>
                <option value="9C">Kelas 9C</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-12 text-center">Rank</th>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3 font-mono">NISN</th>
                  <th className="p-3">Kelas</th>
                  <th className="p-3 text-center">Benar</th>
                  <th className="p-3 text-center">Salah</th>
                  <th className="p-3 text-center font-bold">Nilai</th>
                  <th className="p-3 text-center">Status KKM</th>
                  <th className="p-3 text-center">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((row, idx) => (
                  <tr key={row.sessionId} className="hover:bg-slate-50/60">
                    <td className="p-3 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">{row.name}</td>
                    <td className="p-3 font-mono text-slate-500">{row.nisn}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[11px]">
                        {row.className}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-600">{row.correctCount}</td>
                    <td className="p-3 text-center font-bold text-rose-600">{row.wrongCount}</td>
                    <td className="p-3 text-center">
                      <span className={`font-black text-sm ${row.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {row.score}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span 
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          row.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {row.passed ? 'Tuntas' : 'Remedial'}
                      </span>
                    </td>
                    <td className="p-3 text-center text-slate-500 font-mono text-[11px]">
                      {row.timeSpentMinutes} mnt
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredResults.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-sm">
              Belum ada data nilai ujian yang masuk untuk paket atau filter ini.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Analisis Butir Soal */}
      {activeTab === 'analisis_butir' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-blue-900">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Panduan Diagnostik & Remedial Guru:</strong>
              <p className="mt-0.5 text-slate-700">
                Tabel di bawah mengukur persentase jawaban benar per butir soal. Butir dengan persentase &lt; 50% menandakan materi yang belum dikuasai mayoritas siswa dan direkomendasikan untuk dijelaskan ulang pada sesi pengayaan/remedial.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Materi / Submateri</th>
                  <th className="p-3">Teks Soal</th>
                  <th className="p-3 w-16 text-center">Kunci</th>
                  <th className="p-3 w-36">Daya Serap (%)</th>
                  <th className="p-3 w-28 text-center">Kategori Soal</th>
                  <th className="p-3 w-32 text-center">Rekomendasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {itemAnalysisData.map((item, idx) => (
                  <tr key={item.questionId} className={item.needRemedial ? 'bg-rose-50/30' : 'hover:bg-slate-50/60'}>
                    <td className="p-3 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{item.material}</div>
                      <div className="text-[11px] text-blue-600 font-medium">{item.submaterial}</div>
                    </td>
                    <td className="p-3 max-w-sm">
                      <div className="line-clamp-2 text-slate-800 font-medium">{item.questionText}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-800 font-bold inline-flex items-center justify-center">
                        {item.correctOptionId}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              item.percentage >= 80 ? 'bg-emerald-500' : item.percentage >= 50 ? 'bg-blue-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-800 text-[11px] w-8">
                          {item.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span 
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.percentage >= 80 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : item.percentage >= 50 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.difficultyCategory}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {item.needRemedial ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-bold text-[10px] uppercase inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Perlu Remedial
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px]">
                          ✓ Tuntas
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {itemAnalysisData.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-sm">
              Belum ada respons siswa yang cukup untuk menghitung analisis butir soal.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
