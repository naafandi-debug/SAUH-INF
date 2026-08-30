import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  KeyRound, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  X, 
  Sparkles,
  School,
  ArrowRight
} from 'lucide-react';

interface TeacherLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TeacherLoginModal: React.FC<TeacherLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { teacherPassword } = useApp();
  const [username, setUsername] = useState('guru');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const currentActivePassword = teacherPassword || 'bukapintu19';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Valid teacher usernames
    const validUsers = ['guru', 'admin', 'guru.informatika', 'pakguru', '198507232010011012'];
    const isUserValid = validUsers.includes(cleanUser) || cleanUser === 'guru' || cleanUser.length >= 3;

    // Check against configured teacher password, or default 'bukapintu19'
    const isPassValid = cleanPass === currentActivePassword || cleanPass === 'bukapintu19';

    if (isUserValid && isPassValid) {
      if (rememberMe) {
        localStorage.setItem('inf9_teacher_auth', 'true');
        localStorage.setItem('inf9_teacher_name', username);
      } else {
        sessionStorage.setItem('inf9_teacher_auth', 'true');
      }
      onSuccess();
    } else {
      setErrorMsg('Username atau Password Guru salah. Password default adalah bukapintu19.');
    }
  };

  const handleFillDemo = () => {
    setUsername('guru');
    setPassword(currentActivePassword);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Decorative Header Bar */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Akses Terproteksi
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
                Login Panel Guru
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Area administrasi khusus guru pengampu Informatika Kelas IX. Siswa tidak memiliki izin mengakses panel ini.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username / NIP Guru
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Contoh: guru / NIP"
                  required
                  className="w-full px-4 py-3 pl-10 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password / PIN Keamanan
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password guru"
                  required
                  className="w-full px-4 py-3 pl-10 pr-10 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                Ingat sesi guru di perangkat ini
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Masuk ke Panel Guru
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Helper Credentials Box */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-700">Kredensial Login Guru:</div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                User: <span className="text-indigo-600 font-bold">guru</span> • Pass: <span className="text-indigo-600 font-bold">{currentActivePassword}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            >
              Isi Cepat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
