import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam, ExamStatus } from '../../types';
import { 
  Layers, 
  Plus, 
  Clock, 
  Key, 
  Award, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Copy, 
  ShieldCheck, 
  Sparkles, 
  Play, 
  Pause, 
  X, 
  Check,
  RefreshCw
} from 'lucide-react';

export const AdminExamManager: React.FC = () => {
  const { exams, activeExam, questions, createExam, updateExam, setActiveExam, generateExamToken } = useApp();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Form states
  const [name, setName] = useState<string>('Ulangan Harian 1: Struktur Data & Gerbang Logika');
  const [subject, setSubject] = useState<string>('Informatika');
  const [grade, setGrade] = useState<string>('IX (Sembilan)');
  const [semester, setSemester] = useState<string>('Ganjil');
  const [materials, setMaterials] = useState<string>('Struktur Data (LIFO, FIFO, Stack) & Gerbang Logika (AND, OR, XOR, NOT)');
  const [totalQuestions, setTotalQuestions] = useState<number>(20);
  const [durationMinutes, setDurationMinutes] = useState<number>(40);
  const [kkm, setKkm] = useState<number>(75);
  const [accessCode, setAccessCode] = useState<string>('INF9UH1');
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);
  const [lockFullscreen, setLockFullscreen] = useState<boolean>(true);

  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingExam(null);
    setName(`Ulangan Harian ${exams.length + 1}: Asesmen Informatika`);
    setSubject('Informatika');
    setGrade('IX (Sembilan)');
    setSemester('Ganjil');
    setMaterials('Struktur Data (LIFO, FIFO, Stack) & Logika Informatika');
    setTotalQuestions(20);
    setDurationMinutes(40);
    setKkm(75);
    setAccessCode(`INF9UH${exams.length + 1}`);
    setShuffleQuestions(true);
    setShuffleOptions(true);
    setLockFullscreen(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ex: Exam) => {
    setEditingExam(ex);
    setName(ex.name);
    setSubject(ex.subject);
    setGrade(ex.grade);
    setSemester(ex.semester);
    setMaterials(ex.materials);
    setTotalQuestions(ex.totalQuestions);
    setDurationMinutes(ex.durationMinutes);
    setKkm(ex.kkm);
    setAccessCode(ex.accessCode);
    setShuffleQuestions(ex.shuffleQuestions);
    setShuffleOptions(ex.shuffleOptions);
    setLockFullscreen(ex.lockFullscreen);
    setIsModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingExam) {
      updateExam(editingExam.id, {
        name,
        subject,
        grade,
        semester,
        materials,
        totalQuestions,
        durationMinutes,
        kkm,
        accessCode: accessCode.toUpperCase().trim(),
        shuffleQuestions,
        shuffleOptions,
        lockFullscreen
      });
    } else {
      createExam({
        name,
        subject,
        grade,
        semester,
        materials,
        totalQuestions,
        durationMinutes,
        kkm,
        accessCode: accessCode.toUpperCase().trim(),
        status: 'READY',
        shuffleQuestions,
        shuffleOptions,
        lockFullscreen
      });
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (ex: Exam) => {
    const nextStatus: ExamStatus = ex.status === 'ACTIVE' ? 'READY' : 'ACTIVE';
    updateExam(ex.id, { status: nextStatus });
    if (nextStatus === 'ACTIVE') {
      setActiveExam(ex.id);
    }
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopySuccess(token);
    setTimeout(() => setCopySuccess(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Manajemen Paket Ulangan Harian (PRD Modul 11 & 12)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi paket ujian, atur KKM, durasi waktu (40 menit), dan aktifkan token akses kelas.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Buat Paket Ulangan Baru
        </button>
      </div>

      {/* Exam List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map(ex => {
          const isActive = activeExam?.id === ex.id && ex.status === 'ACTIVE';

          return (
            <div 
              key={ex.id} 
              className={`bg-white rounded-3xl p-6 border-2 transition-all flex flex-col justify-between ${
                isActive ? 'border-blue-600 shadow-md ring-2 ring-blue-500/10' : 'border-slate-200 shadow-xs'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      ex.status === 'ACTIVE' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : ex.status === 'READY' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    STATUS: {ex.status}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      title="Edit Konfigurasi"
                      onClick={() => handleOpenEdit(ex)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  {ex.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {ex.materials}
                </p>

                {/* Meta Grid */}
                <div className="grid grid-cols-3 gap-2 my-5">
                  <div className="p-2.5 bg-slate-50 rounded-xl text-center border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Jumlah Soal</div>
                    <div className="text-base font-black text-slate-800 mt-0.5">{ex.totalQuestions} Butir</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl text-center border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Waktu</div>
                    <div className="text-base font-black text-slate-800 mt-0.5">{ex.durationMinutes} Menit</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl text-center border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Standar KKM</div>
                    <div className="text-base font-black text-emerald-600 mt-0.5">{ex.kkm}</div>
                  </div>
                </div>

                {/* Token Box */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">Token Akses Siswa:</span>
                    <span className="font-mono font-black text-sm text-blue-900 tracking-wider bg-white px-2 py-0.5 rounded-md border border-blue-200">
                      {ex.accessCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Generate token acak baru untuk ulangan ini"
                      onClick={async () => {
                        const newToken = await generateExamToken(ex.id);
                        handleCopyToken(newToken);
                      }}
                      className="p-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Generate Token</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyToken(ex.accessCode)}
                      className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copySuccess === ex.accessCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{copySuccess === ex.accessCode ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {ex.lockFullscreen ? '✓ Lock Fullscreen Aktif' : 'Standard Mode'}
                </span>

                <button
                  onClick={() => handleToggleStatus(ex)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    ex.status === 'ACTIVE'
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                  }`}
                >
                  {ex.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {ex.status === 'ACTIVE' ? 'Jadikan Standby (Nonaktifkan)' : 'Aktifkan Ulangan Sekarang'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add/Edit Exam */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                {editingExam ? 'Edit Paket Ulangan' : 'Buat Paket Ulangan Harian Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Nama / Judul Paket Ulangan</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Contoh: Ulangan Harian Bab 1: Struktur Data & Logika"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Tingkat Kelas</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Cakupan Materi Pembelajaran</label>
                <textarea
                  rows={2}
                  value={materials}
                  onChange={e => setMaterials(e.target.value)}
                  placeholder="Materi yang diujikan..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Jumlah Soal</label>
                  <input
                    type="number"
                    min={5}
                    max={questions.length}
                    value={totalQuestions}
                    onChange={e => setTotalQuestions(parseInt(e.target.value) || 20)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    min={10}
                    max={120}
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(parseInt(e.target.value) || 40)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">KKM Kelulusan</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={kkm}
                    onChange={e => setKkm(parseInt(e.target.value) || 75)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-600 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Token Akses Ujian (Kapital)</label>
                <input
                  type="text"
                  required
                  value={accessCode}
                  onChange={e => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="INF9UH1"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-sm uppercase text-blue-900"
                />
              </div>

              {/* Security & Shuffling Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={e => setShuffleQuestions(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Acak urutan butir soal untuk setiap siswa (PRD Section 17)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={e => setShuffleOptions(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Acak urutan pilihan jawaban A, B, C, D</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lockFullscreen}
                    onChange={e => setLockFullscreen(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Wajibkan Mode Layar Penuh (Anti-Cheat Exam Lock)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Simpan Konfigurasi Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
