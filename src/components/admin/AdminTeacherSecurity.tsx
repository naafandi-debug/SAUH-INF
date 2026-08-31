import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam } from '../../types';
import { 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  Layers, 
  Tv, 
  X, 
  RotateCcw,
  Sliders,
  Radio,
  Clock,
  ExternalLink,
  Zap,
  Info
} from 'lucide-react';

export const AdminTeacherSecurity: React.FC = () => {
  const { 
    teacherPassword, 
    teacherName, 
    changeTeacherPassword, 
    exams, 
    activeExam, 
    updateExam, 
    setActiveExam, 
    generateExamToken,
    isFirebaseConnected 
  } = useApp();

  // --- Password Management State ---
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passwordToast, setPasswordToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // --- Token Generator State ---
  const [selectedExamId, setSelectedExamId] = useState<string>(activeExam?.id || exams[0]?.id || '');
  const [tokenFormat, setTokenFormat] = useState<'standard' | 'simple' | 'prefix'>('standard');
  const [customPrefix, setCustomPrefix] = useState<string>('INF9');
  const [manualCustomToken, setManualCustomToken] = useState<string>('');
  const [tokenToast, setTokenToast] = useState<string | null>(null);
  const [isProjectorModalOpen, setIsProjectorModalOpen] = useState(false);

  const selectedExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || activeExam || exams[0] || null;
  }, [exams, selectedExamId, activeExam]);

  // Handle Change Password
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordToast(null);

    const activePass = teacherPassword || 'bukapintu19';

    // Verify current password
    if (currentPassInput.trim() !== activePass && currentPassInput.trim() !== 'bukapintu19') {
      setPasswordToast({ type: 'error', message: 'Password saat ini tidak sesuai. Password default adalah bukapintu19.' });
      return;
    }

    if (newPassInput.trim().length < 4) {
      setPasswordToast({ type: 'error', message: 'Password baru minimal 4 karakter.' });
      return;
    }

    if (newPassInput.trim() !== confirmPassInput.trim()) {
      setPasswordToast({ type: 'error', message: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    setIsChangingPass(true);
    const result = await changeTeacherPassword(newPassInput.trim());
    setIsChangingPass(false);

    if (result.success) {
      setPasswordToast({ type: 'success', message: 'Password login guru berhasil diubah dan disinkronkan ke Cloud Firestore!' });
      setCurrentPassInput('');
      setNewPassInput('');
      setConfirmPassInput('');
      setTimeout(() => setPasswordToast(null), 5000);
    } else {
      setPasswordToast({ type: 'error', message: result.message });
    }
  };

  // Reset Password to default 'bukapintu19'
  const handleResetDefaultPassword = async () => {
    if (window.confirm('Reset password login guru kembali ke password bawaan: "bukapintu19"?')) {
      setIsChangingPass(true);
      await changeTeacherPassword('bukapintu19');
      setIsChangingPass(false);
      setPasswordToast({ type: 'success', message: 'Password guru telah dikembalikan ke bawaan: "bukapintu19".' });
      setCurrentPassInput('');
      setNewPassInput('');
      setConfirmPassInput('');
      setTimeout(() => setPasswordToast(null), 4000);
    }
  };

  // Handle Generate Token
  const handleGenerateToken = async () => {
    if (!selectedExam) return;
    const newToken = await generateExamToken(selectedExam.id, tokenFormat, customPrefix);
    setTokenToast(`Token baru "${newToken}" berhasil dibuat dan dirilis ke siswa!`);
    setTimeout(() => setTokenToast(null), 4000);
  };

  // Handle Apply Manual Custom Token
  const handleApplyCustomToken = async () => {
    if (!selectedExam || !manualCustomToken.trim()) return;
    const tokenClean = manualCustomToken.trim().toUpperCase();
    await updateExam(selectedExam.id, { accessCode: tokenClean, status: 'ACTIVE' });
    setTokenToast(`Token kustom "${tokenClean}" berhasil diterapkan!`);
    setManualCustomToken('');
    setTimeout(() => setTokenToast(null), 4000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setTokenToast(`Token "${text}" berhasil disalin ke clipboard!`);
    setTimeout(() => setTokenToast(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <KeyRound className="w-6 h-6 text-sky-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                Keamanan & Token Admin
              </span>
              {isFirebaseConnected ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Firestore Terhubung
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Penyimpanan Lokal Aktif
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Pengaturan Keamanan Guru & Generator Token Ujian
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Ubah kata sandi login panel guru secara mandiri dan hasilkan token acak untuk asesmen harian siswa Kelas IX.
            </p>
          </div>
        </div>

        {/* Quick Teacher Badge */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-w-[200px] shrink-0 text-center md:text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">Pengguna Aktif</div>
          <div className="text-sm font-black text-slate-900 mt-0.5">{teacherName}</div>
          <div className="text-xs text-indigo-600 font-mono font-bold mt-1">
            Status: Password Aktif
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns (Change Password & Token Generator) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ============================================================ */}
        {/* COLUMN 1: UBAH PASSWORD GURU (Col 6) */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Ubah Password Login Guru</h2>
                  <p className="text-xs text-slate-500">Kata sandi baru akan otomatis tersimpan di Cloud Firestore</p>
                </div>
              </div>
            </div>

            {/* Alert / Toast message */}
            {passwordToast && (
              <div className={`p-4 mb-5 rounded-2xl text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200 ${
                passwordToast.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {passwordToast.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{passwordToast.message}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              {/* Password Saat Ini */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  1. Password Saat Ini
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={currentPassInput}
                    onChange={e => setCurrentPassInput(e.target.value)}
                    placeholder="Ketik password saat ini..."
                    required
                    className="w-full px-4 py-3 pl-10 pr-10 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  2. Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPassInput}
                    onChange={e => setNewPassInput(e.target.value)}
                    placeholder="Masukkan password baru (min 4 karakter)..."
                    required
                    minLength={4}
                    className="w-full px-4 py-3 pl-10 pr-10 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Konfirmasi Password Baru */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  3. Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPassInput}
                    onChange={e => setConfirmPassInput(e.target.value)}
                    placeholder="Ulangi password baru..."
                    required
                    minLength={4}
                    className="w-full px-4 py-3 pl-10 pr-10 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="w-full sm:flex-1 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isChangingPass ? 'Menyimpan...' : 'Simpan Password Baru'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetDefaultPassword}
                  className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Kembalikan ke bukapintu19"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Default</span>
                </button>
              </div>
            </form>
          </div>

          {/* Current credentials hint footer */}
          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-800">Catatan Keamanan Guru:</div>
                <div className="mt-0.5 text-slate-500">
                  Password saat ini tersimpan: <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-sm">{teacherPassword || 'bukapintu19'}</span>. Password ini digunakan saat masuk ke Panel Guru dari perangkat manapun.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* COLUMN 2: GENERATOR TOKEN ULANGAN DARI ADMIN (Col 6) */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Pusat Generator Token Asesmen</h2>
                  <p className="text-xs text-slate-500">Buat dan rilis token ulangan secara instan untuk dibagikan ke siswa</p>
                </div>
              </div>

              {selectedExam && (
                <button
                  onClick={() => setIsProjectorModalOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title="Buka tampilan layar penuh untuk proyektor"
                >
                  <Tv className="w-3.5 h-3.5 text-amber-300" />
                  <span>Mode Proyektor</span>
                </button>
              )}
            </div>

            {/* Token toast */}
            {tokenToast && (
              <div className="p-4 mb-5 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{tokenToast}</span>
              </div>
            )}

            {/* 1. Pilih Paket Ulangan */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  1. Pilih Paket Ulangan Sasaran
                </label>
                <select
                  value={selectedExamId}
                  onChange={e => {
                    setSelectedExamId(e.target.value);
                    const found = exams.find(ex => ex.id === e.target.value);
                    if (found) setActiveExam(found);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {exams.map(ex => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} (Token Saat Ini: {ex.accessCode} • Status: {ex.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Token Showcase Box */}
              {selectedExam && (
                <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl text-white border border-slate-800 relative overflow-hidden shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                        Token Aktif Saat Ini ({selectedExam.name})
                      </div>
                      <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-amber-300 mt-1">
                        {selectedExam.accessCode}
                      </div>
                      <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Status: <strong className="text-emerald-300 uppercase">{selectedExam.status}</strong> • KKM: {selectedExam.kkm} • {selectedExam.durationMinutes} Menit
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopy(selectedExam.accessCode)}
                        className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
                      >
                        <Copy className="w-3.5 h-3.5 text-sky-300" />
                        <span>Salin</span>
                      </button>
                      <button
                        onClick={() => setIsProjectorModalOpen(true)}
                        className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>Tampilkan</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Format Generator Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  2. Pilih Format Token Otomatis
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setTokenFormat('standard')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      tokenFormat === 'standard'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div>INF9-XXXX</div>
                    <div className="text-[10px] font-normal text-slate-500 mt-0.5">Prefiks Mapel</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTokenFormat('simple')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      tokenFormat === 'simple'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div>6 Karakter Acak</div>
                    <div className="text-[10px] font-normal text-slate-500 mt-0.5">Misal: 9W7X2K</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTokenFormat('prefix')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      tokenFormat === 'prefix'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div>Prefiks Kustom</div>
                    <div className="text-[10px] font-normal text-slate-500 mt-0.5">Contoh: UH1-XXXX</div>
                  </button>
                </div>

                {tokenFormat === 'prefix' && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      value={customPrefix}
                      onChange={e => setCustomPrefix(e.target.value.toUpperCase())}
                      placeholder="Ketik prefiks, misal: UH1, PAS9, INFO9"
                      maxLength={6}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase"
                    />
                  </div>
                )}
              </div>

              {/* Tombol Generate 1-Klik */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerateToken}
                  className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs hover:shadow-blue-200 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-sky-200" />
                  <span>Generate Token Baru & Rilis ke Siswa</span>
                </button>
              </div>

              {/* Atau Input Manual Token Sendiri */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Atau Tetapkan Token Kustom Sendiri Secara Manual:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={manualCustomToken}
                    onChange={e => setManualCustomToken(e.target.value.toUpperCase())}
                    placeholder="Contoh: INFORMATIKA9-UH1"
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-mono font-bold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomToken}
                    disabled={!manualCustomToken.trim()}
                    className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-blue-50/60 border border-blue-100 rounded-2xl text-[11px] text-blue-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Siswa hanya perlu memasukkan kode token di atas pada layar login untuk memulai ujian.</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FULLSCREEN PROJECTOR DISPLAY MODAL */}
      {/* ============================================================ */}
      {isProjectorModalOpen && selectedExam && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-white backdrop-blur-md animate-in fade-in duration-200">
          <button
            onClick={() => setIsProjectorModalOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Tutup Tampilan Proyektor"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-3xl w-full text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Ulangan Harian Informatika Kelas IX
            </div>

            <div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {selectedExam.name}
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-2">
                Materi: {selectedExam.materials}
              </p>
            </div>

            {/* Huge Display Token Card */}
            <div className="p-8 sm:p-12 bg-slate-900/90 rounded-3xl border-2 border-indigo-500/40 shadow-2xl space-y-3">
              <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">
                KODE TOKEN AKSES UJIAN
              </div>
              <div className="text-5xl sm:text-8xl font-black font-mono tracking-widest text-amber-300 select-all">
                {selectedExam.accessCode}
              </div>
              <div className="text-xs sm:text-sm text-emerald-400 font-semibold flex items-center justify-center gap-2 pt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Token Aktif • Silakan masukkan di perangkat masing-masing</span>
              </div>
            </div>

            {/* Quick Specs for Students */}
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto text-center">
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                <div className="text-slate-400 text-[11px] font-bold uppercase">Jumlah Soal</div>
                <div className="text-xl font-bold text-white mt-0.5">{selectedExam.totalQuestions} Soal</div>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                <div className="text-slate-400 text-[11px] font-bold uppercase">Durasi Waktu</div>
                <div className="text-xl font-bold text-white mt-0.5">{selectedExam.durationMinutes} Menit</div>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                <div className="text-slate-400 text-[11px] font-bold uppercase">KKM Minimum</div>
                <div className="text-xl font-bold text-white mt-0.5">{selectedExam.kkm} Poin</div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  handleCopy(selectedExam.accessCode);
                }}
                className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Copy className="w-4 h-4" />
                Salin Token
              </button>
              <button
                onClick={() => setIsProjectorModalOpen(false)}
                className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                Tutup Layar Penuh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
