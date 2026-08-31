import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentExamSession } from '../../types';
import { 
  Users, 
  BookOpen, 
  Layers, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  Plus, 
  Upload, 
  Printer, 
  ChevronRight, 
  ShieldAlert, 
  Activity, 
  Code2,
  KeyRound
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { questions, students, exams, activeExam, sessions, violations, isFirebaseConnected } = useApp();

  const currentExam = activeExam || exams[0];

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const totalQuestions = questions.length;
    const totalExams = exams.length;

    const allSessions = Object.values(sessions) as StudentExamSession[];
    const examSessions = currentExam 
      ? allSessions.filter(s => s.examId === currentExam.id)
      : allSessions;

    const submittedSessions = examSessions.filter(s => s.submitted);
    const inProgressSessions = examSessions.filter(s => !s.submitted);

    const submittedCount = submittedSessions.length;
    const inProgressCount = inProgressSessions.length;
    const notStartedCount = Math.max(0, totalStudents - submittedCount - inProgressCount);

    const scores = submittedSessions.map(s => s.score || 0);
    const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '0.0';
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;

    const passedCount = submittedSessions.filter(s => (s.score || 0) >= (currentExam?.kkm || 75)).length;
    const passRate = submittedCount > 0 ? Math.round((passedCount / submittedCount) * 100) : 0;

    return {
      totalStudents,
      totalQuestions,
      totalExams,
      submittedCount,
      inProgressCount,
      notStartedCount,
      avgScore,
      maxScore,
      minScore,
      passedCount,
      failedCount: submittedCount - passedCount,
      passRate
    };
  }, [students, questions, exams, currentExam, sessions]);

  return (
    <div className="space-y-6">
      {/* Bento Top Showcase Banner */}
      <div className="bg-white rounded-3xl p-8 shadow-xs border border-slate-200 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Pusat Manajemen Asesmen Informatika
                </div>
                {isFirebaseConnected ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-bold text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Cloud Firestore Real-Time
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-[11px] font-bold text-blue-700">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Penyimpanan Lokal Aktif
                  </div>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                Dashboard Guru & Evaluasi Pembelajaran
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
                Kelola bank soal struktur data (LIFO/FIFO) & gerbang logika, pantau live ujian secara real-time, dan cetak leger nilai resmi.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('keamanan-guru')}
              className="py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-indigo-600" />
              Keamanan & Token
            </button>
            <button
              onClick={() => onNavigate('ai-generator')}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              AI Soal Generator
            </button>
            <button
              onClick={() => onNavigate('leger')}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Cetak Leger Nilai
            </button>
          </div>
        </div>
      </div>

      {/* Main Metric Cards Grid (Bento 4-columns) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Siswa</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3 font-mono">{stats.totalStudents}</div>
          <div className="text-xs text-slate-500 mt-1">Siswa Terdaftar (9A - 9G)</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bank Soal</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3 font-mono">{stats.totalQuestions}</div>
          <div className="text-xs text-indigo-600 font-semibold mt-1">42 Butir Terkurasi + AI</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sudah Submit</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-3 font-mono">{stats.submittedCount}</div>
          <div className="text-xs text-slate-500 mt-1">{stats.notStartedCount} Belum Mulai</div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rata-Rata Nilai</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3 font-mono">{stats.avgScore}</div>
          <div className="text-xs text-emerald-600 font-bold mt-1">Ketuntasan KKM: {stats.passRate}%</div>
        </div>
      </div>

      {/* 2-Column Section: Active Exam Overview + Live Violations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Exam Bento Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Paket Ulangan Aktif</div>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{currentExam?.name || 'Ulangan Harian Bab 1'}</h2>
              </div>
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black rounded-full uppercase">
                STATUS: {currentExam?.status || 'AKTIF'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Jumlah Soal</div>
                <div className="text-lg font-black text-slate-800 mt-0.5">{currentExam?.totalQuestions || 20}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Durasi</div>
                <div className="text-lg font-black text-slate-800 mt-0.5">{currentExam?.durationMinutes || 40} Mnt</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Standar KKM</div>
                <div className="text-lg font-black text-emerald-600 mt-0.5">{currentExam?.kkm || 75}</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Token Ujian</div>
                <div className="text-lg font-black font-mono text-indigo-600 mt-0.5">{currentExam?.accessCode || 'INF9UH1'}</div>
              </div>
            </div>

            {/* Quick Score Distribution summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Distribusi Capaian KKM (KKM: {currentExam?.kkm || 75})</span>
                <span className="text-emerald-700 font-bold">{stats.passedCount} Tuntas / {stats.failedCount} Belum</span>
              </div>
              <div className="h-3 w-full bg-rose-100 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.passRate}%` }} 
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Nilai Terendah: <strong className="text-rose-600">{stats.minScore}</strong></span>
                <span>Nilai Tertinggi: <strong className="text-emerald-600">{stats.maxScore}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('monitoring')}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Pantau Live Ujian
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('hasil-analisis')}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Lihat Analisis Butir Soal
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Violation Feed Bento Card (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Log Pelanggaran Ujian Terkini
              </h3>
              <span className="text-xs font-bold text-amber-300 bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-800">
                {violations.length} Catatan
              </span>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {violations.slice(0, 5).map(viol => (
                <div key={viol.id} className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-2xl border border-slate-700/60 text-xs transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{viol.studentName} ({viol.className})</span>
                    <span className="text-[11px] font-mono text-slate-400">{viol.timeFormatted}</span>
                  </div>
                  <div className="text-slate-300 mt-1 flex items-center gap-2">
                    <span 
                      className={`w-2 h-2 rounded-full ${
                        viol.severity === 'high' ? 'bg-rose-500' : viol.severity === 'medium' ? 'bg-amber-500' : 'bg-slate-400'
                      }`} 
                    />
                    <span>{viol.activity}</span>
                  </div>
                </div>
              ))}

              {violations.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs">
                  Belum ada aktivitas pelanggaran yang tercatat.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              onClick={() => onNavigate('monitoring')}
              className="w-full py-2.5 text-center text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer"
            >
              Lihat Seluruh Aktivitas Peserta &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
