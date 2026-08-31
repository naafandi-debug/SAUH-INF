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
  Eye,
  FileText,
  Printer,
  X,
  CheckCheck
} from 'lucide-react';

export const AdminResultsAnalysis: React.FC = () => {
  const { students, activeExam, exams, sessions, questions } = useApp();

  const [selectedExamId, setSelectedExamId] = useState<string>(activeExam?.id || exams[0]?.id || 'EXAM_1');
  const [selectedClass, setSelectedClass] = useState<string>('9D'); // Default to 9D where students took the exam
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'rekap' | 'analisis_butir'>('rekap');
  const [inspectingResult, setInspectingResult] = useState<any | null>(null);

  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0] || activeExam;

  // Available classes in system
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.className) set.add(s.className);
    });
    return Array.from(set).sort();
  }, [students]);

  // All session objects in memory/cloud
  const allSessions = useMemo(() => {
    return Object.values(sessions) as StudentExamSession[];
  }, [sessions]);

  // Sessions for current exam (or fallback to any sessions if only 1 exam exists)
  const examRelevantSessions = useMemo(() => {
    return allSessions.filter(s => {
      const matchExam = !currentExam || s.examId === currentExam.id || allSessions.length <= students.length;
      const hasActivity = s.submitted || (s.answers && Object.keys(s.answers).length > 0);
      return matchExam && hasActivity;
    });
  }, [allSessions, currentExam, students]);

  // Student results list
  const resultsList = useMemo(() => {
    return examRelevantSessions.map((sess, idx) => {
      const student = students.find(st => 
        st.id === sess.studentId || 
        st.nisn === sess.nisn || 
        st.nisn === sess.studentNisn || 
        st.name.toLowerCase() === sess.studentName.toLowerCase()
      );

      // Auto compute score if not yet set
      let correctCount = sess.correctCount || 0;
      const totalQ = sess.questions?.length || 20;

      if (sess.correctCount === undefined || sess.score === undefined) {
        correctCount = 0;
        sess.questions.forEach(item => {
          const chosen = sess.answers[item.questionId];
          if (chosen && chosen === item.originalQuestion.correctOptionId) {
            correctCount += 1;
          }
        });
      }

      const score = sess.score !== undefined ? sess.score : Math.round((correctCount / totalQ) * 100);
      const wrongCount = sess.wrongCount !== undefined ? sess.wrongCount : Math.max(0, totalQ - correctCount);
      const isPassed = score >= (currentExam?.kkm || 75);
      const timeSpentMinutes = Math.max(1, Math.round(((sess.submittedAt || sess.endTime || Date.now()) - sess.startTime) / 60000));

      return {
        rank: idx + 1,
        sessionId: sess.id || `${sess.examId}_${sess.studentId}`,
        studentId: sess.studentId,
        nisn: student?.nisn || sess.nisn || sess.studentNisn || '-',
        name: student?.name || sess.studentName,
        className: student?.className || sess.className || '9D',
        correctCount,
        wrongCount,
        score,
        passed: isPassed,
        timeSpentMinutes,
        violationsCount: sess.violations?.length || 0,
        answers: sess.answers || {},
        questions: sess.questions || []
      };
    }).sort((a, b) => b.score - a.score);
  }, [examRelevantSessions, students, currentExam]);

  const filteredResults = useMemo(() => {
    return resultsList.filter(item => {
      const matchClass = selectedClass === 'all' || item.className === selectedClass;
      const matchSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nisn.includes(searchQuery);
      return matchClass && matchSearch;
    });
  }, [resultsList, selectedClass, searchQuery]);

  // Item Analysis (Analisis Butir Soal - PRD Section 15)
  const itemAnalysisData = useMemo(() => {
    if (examRelevantSessions.length === 0) return [];

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

    examRelevantSessions.forEach(sess => {
      // Filter by class if selected
      if (selectedClass !== 'all' && sess.className !== selectedClass) return;

      (sess.questions || []).forEach(qItem => {
        if (!questionStatsMap[qItem.questionId]) {
          questionStatsMap[qItem.questionId] = {
            questionId: qItem.questionId,
            questionText: qItem.originalQuestion?.question || 'Teks Soal',
            material: qItem.originalQuestion?.material || 'Informatika',
            submaterial: qItem.originalQuestion?.submaterial || 'Umum',
            correctOptionId: qItem.originalQuestion?.correctOptionId || 'A',
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
          if (studentAns === qItem.originalQuestion?.correctOptionId) {
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
        difficultyCategory = 'Mudah';
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
  }, [examRelevantSessions, selectedClass]);

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
    downloadCSV(`Rekap_Nilai_${currentExam?.name.replace(/ /g, '_')}_Kelas_${selectedClass}_${Date.now()}.csv`, rows, headers);
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
    downloadCSV(`Analisis_Butir_Soal_${currentExam?.name.replace(/ /g, '_')}_Kelas_${selectedClass}_${Date.now()}.csv`, rows, headers);
  };

  const handlePrintLeger = () => {
    window.print();
  };

  const currentClassTotal = students.filter(s => selectedClass === 'all' || s.className === selectedClass).length;
  const currentClassResults = filteredResults;
  const scores = currentClassResults.map(r => r.score);
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0.0';
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
  const passedCount = currentClassResults.filter(r => r.passed).length;
  const passRate = currentClassResults.length > 0 ? Math.round((passedCount / currentClassResults.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Hasil Evaluasi & Analisis Nilai Asesmen
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi nilai otomatis, ketuntasan KKM, analisis daya pembeda butir soal, dan cetak leger nilai.
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
                {ex.name} (KKM: {ex.kkm || 75})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrintLeger}
            className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Leger Nilai
          </button>

          {activeTab === 'rekap' ? (
            <button
              onClick={handleExportResults}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Rekap (.CSV)
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

      {/* Class Selection Filter Pills */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase px-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter Kelas:
        </span>
        <button
          onClick={() => setSelectedClass('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedClass === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Semua Kelas ({resultsList.length} Siswa Mengerjakan)
        </button>
        {availableClasses.map(c => {
          const countSubmitted = resultsList.filter(r => r.className === c).length;
          const totalInClass = students.filter(s => s.className === c).length;
          const is9D = c === '9D';
          return (
            <button
              key={c}
              onClick={() => setSelectedClass(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedClass === c
                  ? 'bg-blue-600 text-white shadow-xs'
                  : is9D
                  ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Kelas {c}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                selectedClass === c ? 'bg-white/20 text-white' : countSubmitted > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {countSubmitted}/{totalInClass}
              </span>
              {is9D && countSubmitted > 0 && selectedClass !== c && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Metric Cards Summary for Selected Class */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Siswa Selesai / Terdata</div>
          <div className="text-2xl font-black text-slate-900 mt-2">{filteredResults.length} Siswa</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Dari {currentClassTotal} Siswa {selectedClass === 'all' ? 'Total' : `Kelas ${selectedClass}`}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Rata-Rata Nilai</div>
          <div className="text-2xl font-black text-blue-600 mt-2">{avgScore}</div>
          <div className="text-[11px] text-slate-500 mt-1">Tertinggi: <strong>{highestScore}</strong> • Terendah: <strong>{lowestScore}</strong></div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Ketuntasan Belajar</div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{passRate}%</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">{passedCount} Siswa Tuntas (KKM &ge; {currentExam?.kkm || 75})</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Perlu Remedial</div>
          <div className="text-2xl font-black text-rose-600 mt-2">{filteredResults.length - passedCount} Siswa</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Nilai di bawah KKM</div>
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
          1. Rekap Nilai Siswa ({filteredResults.length})
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
          2. Analisis Butir Soal & Diagnostik Remedial ({itemAnalysisData.length})
        </button>
      </div>

      {/* Tab 1: Rekap Nilai Table */}
      {activeTab === 'rekap' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cari nama siswa, NISN, atau kelas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-blue-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>Menampilkan: <strong>{filteredResults.length}</strong> siswa</span>
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
                  <th className="p-3 text-center text-emerald-700">Benar</th>
                  <th className="p-3 text-center text-rose-700">Salah</th>
                  <th className="p-3 text-center font-bold">Nilai Akhir</th>
                  <th className="p-3 text-center">Status KKM</th>
                  <th className="p-3 text-center">Waktu</th>
                  <th className="p-3 text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((row, idx) => (
                  <tr key={row.sessionId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{row.name}</div>
                      {row.violationsCount > 0 && (
                        <span className="text-[10px] text-rose-600 font-semibold">
                          ⚠️ {row.violationsCount} pelanggaran
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-500">{row.nisn}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[11px]">
                        Kelas {row.className}
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
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                          row.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {row.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {row.passed ? 'Tuntas' : 'Remedial'}
                      </span>
                    </td>
                    <td className="p-3 text-center text-slate-500 font-mono text-[11px]">
                      {row.timeSpentMinutes} mnt
                    </td>
                    <td className="p-3 text-center">
                      <button
                        title="Lihat Lembar Jawaban Siswa"
                        onClick={() => setInspectingResult(row)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Jawaban
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredResults.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-sm space-y-2">
              <p className="font-semibold text-slate-600">Belum ada data nilai ujian yang masuk untuk filter ini.</p>
              <p className="text-xs text-slate-400">
                Pastikan filter kelas sesuai (misal: <strong>Kelas 9D</strong>) dan siswa sudah mulai atau selesai mengerjakan.
              </p>
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
              <strong className="font-bold">Diagnostik Tingkat Penguasaan Materi (Remedial Guide):</strong>
              <p className="mt-0.5 text-slate-700">
                Tabel ini mengurutkan butir soal dari yang paling sulit (persentase benar terendah). Butir soal dengan label <strong>Perlu Remedial (&lt; 50%)</strong> menunjukkan indikator kompetensi dasar yang perlu diajarkan kembali kepada siswa sebelum ujian susulan/remedial.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Materi / Topik</th>
                  <th className="p-3">Teks Pertanyaan</th>
                  <th className="p-3 w-16 text-center">Kunci</th>
                  <th className="p-3 w-36">Daya Serap (%)</th>
                  <th className="p-3 w-28 text-center">Tingkat Kesulitan</th>
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
                          <AlertCircle className="w-3 h-3" /> Remedial
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

      {/* Modal: Lembar Jawaban Siswa Lengkap */}
      {inspectingResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Lembar Jawaban: {inspectingResult.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelas {inspectingResult.className} • NISN: {inspectingResult.nisn} • Nilai: <span className="font-bold text-emerald-600">{inspectingResult.score}</span> (Benar: {inspectingResult.correctCount}, Salah: {inspectingResult.wrongCount})
                </p>
              </div>
              <button
                onClick={() => setInspectingResult(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {inspectingResult.questions.map((item: any, idx: number) => {
                const chosen = inspectingResult.answers[item.questionId];
                const isCorrect = chosen && chosen === item.originalQuestion.correctOptionId;
                return (
                  <div key={item.questionId} className={`p-3.5 rounded-2xl border ${
                    isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-slate-900">
                        {idx + 1}. {item.originalQuestion.question}
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isCorrect ? 'Benar (+1)' : 'Salah'}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {item.shuffledOptions.map((opt: any) => {
                        const isSelected = chosen === opt.id;
                        const isKey = opt.id === item.originalQuestion.correctOptionId;
                        return (
                          <div
                            key={opt.id}
                            className={`p-2 rounded-xl border text-[11px] font-medium ${
                              isKey 
                                ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950 font-bold'
                                : isSelected 
                                ? 'bg-rose-100/70 border-rose-300 text-rose-950 line-through'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <span className="font-bold mr-1.5">{opt.id}.</span> {opt.text}
                            {isKey && ' ✓ (Kunci)'}
                            {isSelected && !isKey && ' ✗ (Pilihan Siswa)'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectingResult(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
