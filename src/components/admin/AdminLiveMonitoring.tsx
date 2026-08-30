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
  Check
} from 'lucide-react';

export const AdminLiveMonitoring: React.FC = () => {
  const { students, activeExam, sessions, violations, resetStudentSession } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'working' | 'submitted' | 'not_started'>('all');
  const [violationFilter, setViolationFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const examSessions = useMemo(() => {
    const allSessions = Object.values(sessions) as StudentExamSession[];
    return allSessions.filter(s => !activeExam || s.examId === activeExam.id);
  }, [sessions, activeExam]);

  // Combine student list with sessions
  const studentMonitoringList = useMemo(() => {
    return students.map(st => {
      const sess = examSessions.find(s => s.studentId === st.id);
      const studentViolations = violations.filter(v => v.studentName === st.name);

      let status: 'working' | 'submitted' | 'not_started' = 'not_started';
      let answeredCount = 0;
      let score = 0;
      let timeSpent = 0;

      if (sess) {
        status = sess.submitted ? 'submitted' : 'working';
        answeredCount = Object.keys(sess.answers || {}).length;
        score = sess.score || 0;
        timeSpent = sess.submitted 
          ? Math.round(((sess.endTime || Date.now()) - sess.startTime) / 60000)
          : Math.round((Date.now() - sess.startTime) / 60000);
      }

      return {
        student: st,
        session: sess,
        status,
        answeredCount,
        score,
        timeSpent,
        violations: studentViolations
      };
    });
  }, [students, examSessions, violations]);

  const filteredMonitoring = useMemo(() => {
    return studentMonitoringList.filter(item => {
      const matchSearch = 
        item.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student.nisn.includes(searchQuery);

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [studentMonitoringList, searchQuery, statusFilter]);

  const filteredViolations = useMemo(() => {
    return violations.filter(v => {
      if (violationFilter === 'all') return true;
      return v.severity === violationFilter;
    });
  }, [violations, violationFilter]);

  const handleReset = (studentId: string, studentName: string) => {
    if (!activeExam) return;
    if (window.confirm(`Yakin ingin mereset sesi ujian untuk siswa ${studentName}? Semua progres jawaban akan dihapus dan siswa dapat login kembali.`)) {
      resetStudentSession(activeExam.id, studentId);
      setActionNotice(`Sesi ujian siswa ${studentName} berhasil direset.`);
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleExportViolations = () => {
    const headers = ['ID', 'Waktu', 'Nama Siswa', 'Kelas', 'Tindakan Pelanggaran', 'Tingkat Bahaya'];
    const rows = violations.map(v => [v.id, v.timeFormatted, v.studentName, v.className, v.activity, v.severity.toUpperCase()]);
    downloadCSV(`Log_Pelanggaran_Ujian_${Date.now()}.csv`, rows, headers);
  };

  const totalWorking = studentMonitoringList.filter(s => s.status === 'working').length;
  const totalSubmitted = studentMonitoringList.filter(s => s.status === 'submitted').length;
  const totalNotStarted = studentMonitoringList.filter(s => s.status === 'not_started').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-900">
              Live Monitoring & Pengawasan Asesmen (PRD Modul 13)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Paket Aktif: <strong>{activeExam?.name || 'Ulangan Harian 1'}</strong> • Token: <span className="font-mono font-bold text-blue-700">{activeExam?.accessCode}</span>
          </p>
        </div>

        <button
          onClick={handleExportViolations}
          className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-amber-600" />
          Export Log Pelanggaran
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 4 Status Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Peserta</div>
          <div className="text-2xl font-black text-slate-900 mt-2">{students.length} Siswa</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-blue-200 bg-blue-50/30 shadow-xs">
          <div className="text-xs font-bold text-blue-700 uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            Sedang Mengerjakan
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">{totalWorking} Siswa</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="text-xs font-bold text-emerald-700 uppercase">Selesai / Terkirim</div>
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
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Daftar Progres Peserta Ujian
            </h3>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
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
                  <th className="p-3">Skor / Nilai</th>
                  <th className="p-3 text-center">Pelanggaran</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMonitoring.map(item => (
                  <tr key={item.student.id} className="hover:bg-slate-50/60">
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
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
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
                            className="bg-blue-600 h-full rounded-full" 
                            style={{ width: `${(item.answeredCount / 20) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-700 text-[11px]">
                          {item.answeredCount}/20
                        </span>
                      </div>
                    </td>

                    <td className="p-3">
                      {item.status === 'submitted' ? (
                        <span 
                          className={`font-black text-sm ${
                            item.score >= (activeExam?.kkm || 75) ? 'text-emerald-600' : 'text-rose-600'
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
                      {item.session && (
                        <button
                          title="Reset Sesi Ujian Siswa"
                          onClick={() => handleReset(item.student.id, item.student.name)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Realtime Violation Logs Stream */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Live Log Pelanggaran ({violations.length})
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
                  Tidak ada catatan pelanggaran terpantau.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
