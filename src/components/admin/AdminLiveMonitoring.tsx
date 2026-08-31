import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentExamSession } from '../../types';
import { downloadCSV } from '../../utils/exportHelpers';
import { 
  Activity, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  ShieldAlert, 
  Search, 
  Download,
  Filter,
  Check,
  RefreshCw,
  Eye,
  CheckCheck,
  FileText,
  X
} from 'lucide-react';

export const AdminLiveMonitoring: React.FC = () => {
  const { 
    students, 
    activeExam, 
    exams, 
    sessions, 
    violations, 
    resetStudentSession, 
    forceCompleteSession, 
    refreshCloudData,
    firebaseSyncStatus 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('9D'); // Default to 9D as requested
  const [statusFilter, setStatusFilter] = useState<'all' | 'working' | 'submitted' | 'not_started'>('all');
  const [violationFilter, setViolationFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [inspectingSession, setInspectingSession] = useState<StudentExamSession | null>(null);

  const effectiveExam = activeExam || exams[0];

  const allSessionsList = useMemo(() => {
    return Object.values(sessions) as StudentExamSession[];
  }, [sessions]);

  // Combine student list with sessions
  const studentMonitoringList = useMemo(() => {
    return students.map(st => {
      // Find matching session by studentId, nisn, or name
      const sess = allSessionsList.find(s => 
        (s.studentId === st.id || s.nisn === st.nisn || s.studentNisn === st.nisn || s.studentName.toLowerCase() === st.name.toLowerCase()) &&
        (!effectiveExam || s.examId === effectiveExam.id || allSessionsList.length <= students.length)
      );

      const studentViolations = violations.filter(v => 
        v.studentName.toLowerCase() === st.name.toLowerCase() ||
        (st.nisn && v.studentName.includes(st.nisn))
      );

      let status: 'working' | 'submitted' | 'not_started' = 'not_started';
      let answeredCount = 0;
      let score = 0;
      let timeSpent = 0;

      if (sess) {
        status = sess.submitted ? 'submitted' : 'working';
        answeredCount = Object.keys(sess.answers || {}).length;
        score = sess.score || 0;
        timeSpent = sess.submitted 
          ? Math.round(((sess.submittedAt || sess.endTime || Date.now()) - sess.startTime) / 60000)
          : Math.round((Date.now() - sess.startTime) / 60000);
      }

      return {
        student: st,
        session: sess,
        status,
        answeredCount,
        score,
        timeSpent: Math.max(1, timeSpent),
        violations: studentViolations
      };
    });
  }, [students, allSessionsList, violations, effectiveExam]);

  // Available classes
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.className) set.add(s.className);
    });
    return Array.from(set).sort();
  }, [students]);

  const filteredMonitoring = useMemo(() => {
    return studentMonitoringList.filter(item => {
      const matchClass = selectedClass === 'all' || item.student.className === selectedClass;
      const matchSearch = 
        item.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.student.nisn && item.student.nisn.includes(searchQuery));

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchClass && matchSearch && matchStatus;
    });
  }, [studentMonitoringList, searchQuery, selectedClass, statusFilter]);

  const filteredViolations = useMemo(() => {
    return violations.filter(v => {
      const matchClass = selectedClass === 'all' || v.className === selectedClass;
      const matchSeverity = violationFilter === 'all' || v.severity === violationFilter;
      return matchClass && matchSeverity;
    });
  }, [violations, selectedClass, violationFilter]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshCloudData();
    setTimeout(() => {
      setIsRefreshing(false);
      setActionNotice('Data monitoring berhasil disinkronkan langsung dari server cloud.');
      setTimeout(() => setActionNotice(null), 3500);
    }, 600);
  };

  const handleReset = async (studentId: string, studentName: string) => {
    if (!effectiveExam) return;
    if (window.confirm(`Yakin ingin mereset sesi ujian untuk siswa ${studentName}? Jawaban akan dihapus dan siswa dapat login kembali.`)) {
      await resetStudentSession(effectiveExam.id, studentId);
      setActionNotice(`Sesi ujian siswa ${studentName} berhasil direset.`);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleForceSubmit = async (studentId: string, studentName: string) => {
    if (!effectiveExam) return;
    if (window.confirm(`Selesaikan dan hitung nilai untuk siswa ${studentName} sekarang? Sistem akan mengevaluasi jawaban yang sudah tersimpan.`)) {
      const result = await forceCompleteSession(effectiveExam.id, studentId);
      if (result) {
        setActionNotice(`Sesi ujian ${studentName} berhasil diselesaikan. Nilai: ${result.score} (${result.passed ? 'TUNTAS' : 'REMEDIAL'}).`);
      } else {
        setActionNotice(`Gagal menyelesaikan sesi untuk ${studentName}.`);
      }
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleExportViolations = () => {
    const headers = ['ID', 'Waktu', 'Nama Siswa', 'Kelas', 'Tindakan Pelanggaran', 'Tingkat Bahaya'];
    const rows = filteredViolations.map(v => [v.id, v.timeFormatted, v.studentName, v.className, v.activity, v.severity.toUpperCase()]);
    downloadCSV(`Log_Pelanggaran_Kelas_${selectedClass}_${Date.now()}.csv`, rows, headers);
  };

  const currentClassStudents = studentMonitoringList.filter(s => selectedClass === 'all' || s.student.className === selectedClass);
  const totalWorking = currentClassStudents.filter(s => s.status === 'working').length;
  const totalSubmitted = currentClassStudents.filter(s => s.status === 'submitted').length;
  const totalNotStarted = currentClassStudents.filter(s => s.status === 'not_started').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-900">
              Live Monitoring & Pengawasan Asesmen Real-Time
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Paket Aktif: <strong>{effectiveExam?.name || 'Ulangan Harian Informatika'}</strong> • Token Ujian: <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">{effectiveExam?.accessCode}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="py-2.5 px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Menyinkronkan...' : 'Sinkronkan Data Live'}
          </button>

          <button
            onClick={handleExportViolations}
            className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            Export Log Pelanggaran
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Class Selection Filter Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase px-2">Pilih Kelas:</span>
        <button
          onClick={() => setSelectedClass('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedClass === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Semua Kelas ({students.length})
        </button>
        {availableClasses.map(c => {
          const countInClass = students.filter(s => s.className === c).length;
          const is9D = c === '9D';
          return (
            <button
              key={c}
              onClick={() => setSelectedClass(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedClass === c
                  ? 'bg-blue-600 text-white shadow-xs'
                  : is9D 
                  ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Kelas {c}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedClass === c ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {countInClass}
              </span>
              {is9D && selectedClass !== c && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* 4 Status Counters for Selected Class */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">
            Peserta {selectedClass === 'all' ? 'Semua Kelas' : `Kelas ${selectedClass}`}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{currentClassStudents.length} Siswa</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-blue-200 bg-blue-50/30 shadow-xs">
          <div className="text-xs font-bold text-blue-700 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            Sedang Mengerjakan
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">{totalWorking} Siswa</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Selesai / Terkirim
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{totalSubmitted} Siswa</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Belum Memulai</div>
          <div className="text-2xl font-black text-slate-500 mt-2">{totalNotStarted} Siswa</div>
        </div>
      </div>

      {/* Main Grid: Student Table (8 cols) + Realtime Violation Stream (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Student Progress Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Cari siswa berdasarkan nama atau NISN..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-blue-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="all">Semua Status</option>
                <option value="working">Sedang Mengerjakan</option>
                <option value="submitted">Sudah Selesai</option>
                <option value="not_started">Belum Mulai</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Siswa</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Progres Soal</th>
                  <th className="p-3 text-center">Nilai</th>
                  <th className="p-3 text-center">Pelanggaran</th>
                  <th className="p-3 text-center">Aksi Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMonitoring.map(item => (
                  <tr key={item.student.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{item.student.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Kelas {item.student.className} • NISN: {item.student.nisn}
                      </div>
                    </td>

                    <td className="p-3">
                      {item.status === 'working' && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] uppercase inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                          Mengerjakan
                        </span>
                      )}
                      {item.status === 'submitted' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Selesai ({item.timeSpent} mnt)
                        </span>
                      )}
                      {item.status === 'not_started' && (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-semibold text-[10px] uppercase">
                          Belum Mulai
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              item.status === 'submitted' ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${(item.answeredCount / 20) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-700 text-[11px]">
                          {item.answeredCount}/20
                        </span>
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      {item.status === 'submitted' ? (
                        <span 
                          className={`font-black text-sm ${
                            item.score >= (effectiveExam?.kkm || 75) ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {item.score}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      {item.violations.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold font-mono text-[11px]">
                          {item.violations.length}x
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">0</span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {item.status === 'working' && item.answeredCount > 0 && (
                          <button
                            title="Paksa Selesai & Hitung Nilai (Jika siswa selesai tapi belum sempat submit)"
                            onClick={() => handleForceSubmit(item.student.id, item.student.name)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <CheckCheck className="w-3 h-3" />
                            Selesaikan
                          </button>
                        )}

                        {item.session && item.status === 'submitted' && (
                          <button
                            title="Lihat Lembar Jawaban Siswa"
                            onClick={() => setInspectingSession(item.session)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {item.session && (
                          <button
                            title="Reset Sesi Ujian Siswa"
                            onClick={() => handleReset(item.student.id, item.student.name)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMonitoring.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              Tidak ada siswa yang sesuai dengan filter pencarian.
            </div>
          )}
        </div>

        {/* Right: Realtime Violation Logs Stream */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Live Log Pelanggaran ({filteredViolations.length})
              </h3>

              <select
                value={violationFilter}
                onChange={e => setViolationFilter(e.target.value)}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600"
              >
                <option value="all">Semua Level</option>
                <option value="high">Tinggi (High)</option>
                <option value="medium">Sedang (Medium)</option>
                <option value="low">Rendah (Low)</option>
              </select>
            </div>

            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1 text-xs">
              {filteredViolations.map(v => (
                <div 
                  key={v.id}
                  className={`p-3 rounded-xl border ${
                    v.severity === 'high' 
                      ? 'bg-rose-50/50 border-rose-200 text-rose-950' 
                      : v.severity === 'medium' 
                      ? 'bg-amber-50/50 border-amber-200 text-amber-950' 
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{v.studentName} ({v.className})</span>
                    <span className="font-mono text-[10px] text-slate-500">{v.timeFormatted}</span>
                  </div>
                  <div className="mt-1 text-[11px] font-medium leading-snug">
                    {v.activity}
                  </div>
                </div>
              ))}

              {filteredViolations.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Tidak ada catatan pelanggaran terpantau untuk kelas ini.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Lembar Jawaban Siswa */}
      {inspectingSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Lembar Jawaban: {inspectingSession.studentName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelas {inspectingSession.className} • NISN: {inspectingSession.nisn || inspectingSession.studentNisn} • Nilai: <span className="font-bold text-emerald-600">{inspectingSession.score}</span> (Benar: {inspectingSession.correctCount}, Salah: {inspectingSession.wrongCount})
                </p>
              </div>
              <button
                onClick={() => setInspectingSession(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {inspectingSession.questions.map((item, idx) => {
                const chosen = inspectingSession.answers[item.questionId];
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
                      {item.shuffledOptions.map(opt => {
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
                onClick={() => setInspectingSession(null)}
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
