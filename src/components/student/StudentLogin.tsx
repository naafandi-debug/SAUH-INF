import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam, Student } from '../../types';
import { 
  BookOpen, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  UserCheck,
  Award,
  Layers,
  Code2
} from 'lucide-react';

interface StudentLoginProps {
  onStartExam?: (student: Student, exam: Exam) => void;
  onLoginSuccess?: (student: Student, exam: Exam) => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({ onStartExam, onLoginSuccess }) => {
  const { students, exams, activeExam } = useApp();
  
  const [selectedClass, setSelectedClass] = useState<string>('9A');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [examCode, setExamCode] = useState<string>(activeExam?.accessCode || 'INF9UH1');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const classList = useMemo(() => {
    const classes = Array.from(new Set(students.map(s => s.className))).sort();
    return classes.length > 0 ? classes : ['9A', '9B', '9C'];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => s.className === selectedClass);
  }, [students, selectedClass]);

  const currentExam = useMemo(() => {
    return activeExam || exams[0] || null;
  }, [activeExam, exams]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedStudentId) {
      setErrorMsg('Silakan pilih nama Anda terlebih dahulu.');
      return;
    }

    if (!currentExam) {
      setErrorMsg('Belum ada ulangan yang aktif saat ini.');
      return;
    }

    if (currentExam.status !== 'ACTIVE' && currentExam.status !== 'READY') {
      setErrorMsg('Ulangan ini saat ini berstatus ' + currentExam.status + ' dan belum dibuka.');
      return;
    }

    if (examCode.trim().toUpperCase() !== currentExam.accessCode.trim().toUpperCase()) {
      setErrorMsg(`Kode ujian tidak valid. (Gunakan kode token: ${currentExam.accessCode})`);
      return;
    }

    const student = students.find(s => s.id === selectedStudentId);
    if (!student) {
      setErrorMsg('Data siswa tidak ditemukan.');
      return;
    }

    if (onStartExam) {
      onStartExam(student, currentExam);
    } else if (onLoginSuccess) {
      onLoginSuccess(student, currentExam);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Bento Top Banner */}
      <div className="bg-white rounded-3xl p-8 shadow-xs border border-slate-200 relative overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[11px] font-bold uppercase tracking-wider text-indigo-700 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Asesmen Harian Digital Terpadu
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                Informatika Kelas IX • Bab 1 & 2
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
                Struktur Data (LIFO, FIFO, Stack, Queue) dan Logika Informatika (Gerbang AND, OR, NOT, XOR, Tabel Kebenaran).
              </p>
            </div>
          </div>

          {/* Quick specs pill */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center min-w-[170px] shrink-0">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Target Peserta</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">SMP Kelas IX</div>
            <div className="text-xs text-indigo-600 font-semibold mt-0.5">Semester Ganjil</div>
          </div>
        </div>
      </div>

      {/* Bento Grid: Form Card & Specs Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Bento Card 1: Login Form (Col 7) */}
        <div className="md:col-span-7 bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Identitas Peserta Ujian</h2>
              <p className="text-xs text-slate-500">Pilih rombel dan nama Anda sebelum mengaktifkan exam mode</p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleStart} className="space-y-5">
            {/* 1. Pilih Kelas */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                1. Pilih Kelas / Rombel
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {classList.map(cls => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      setSelectedClass(cls);
                      setSelectedStudentId('');
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all text-center cursor-pointer ${
                      selectedClass === cls
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Pilih Nama Siswa */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                2. Nama Lengkap Siswa
              </label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="">-- [ Klik untuk Memilih Nama Anda ] --</option>
                {filteredStudents.map(std => (
                  <option key={std.id} value={std.id}>
                    {std.name} (NISN: {std.nisn})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Kode Ujian */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                3. Kode Akses Token Ulangan
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={examCode}
                  onChange={e => setExamCode(e.target.value)}
                  placeholder="Contoh: INF9UH1"
                  className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold tracking-wider uppercase"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Token aktif dari guru: <span className="font-mono font-bold text-indigo-600">{currentExam?.accessCode || 'INF9UH1'}</span>
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Masuk ke Mode Ujian (Exam Mode)
              </button>
            </div>
          </form>
        </div>

        {/* Bento Column 2: Specs & Security Bento Cards (Col 5) */}
        <div className="md:col-span-5 space-y-6">
          {/* Dark Bento Card: Exam Info */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xs border border-slate-800">
            <h3 className="font-bold text-sm flex items-center gap-2 mb-4 text-indigo-400">
              <BookOpen className="w-4 h-4" />
              Informasi Paket Ulangan
            </h3>
            
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Mata Pelajaran</span>
                <span className="font-semibold text-white">Informatika IX</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Jumlah Soal</span>
                <span className="font-semibold text-white">20 Butir Soal</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Durasi Pengerjaan</span>
                <span className="font-semibold text-indigo-300">40 Menit</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Standar KKM</span>
                <span className="font-semibold text-emerald-400">{currentExam?.kkm || 75} Poin</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Bobot per Butir</span>
                <span className="font-semibold text-amber-300">5 Poin (Skor Max: 100)</span>
              </div>
            </div>
          </div>

          {/* Anti-Cheating Bento Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Protokol Keamanan Ujian Terkunci
            </div>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Ujian berjalan dalam <strong>Mode Layar Penuh (Fullscreen)</strong>.</li>
              <li>Urutan 20 soal dan opsi diacak unik untuk tiap peserta.</li>
              <li>Aktivitas keluar fullscreen / ganti tab dicatat otomatis.</li>
              <li>Jawaban tersimpan otomatis secara real-time (Autosave).</li>
              <li>Saat waktu habis, ujian akan <strong>Auto-submit otomatis</strong>.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
