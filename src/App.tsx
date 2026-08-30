import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Student, Exam, StudentExamSession } from './types';

// Student Components
import { StudentLogin } from './components/student/StudentLogin';
import { ExamLockModal } from './components/student/ExamLockModal';
import { StudentExamScreen } from './components/student/StudentExamScreen';
import { StudentResultScreen } from './components/student/StudentResultScreen';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminQuestionBank } from './components/admin/AdminQuestionBank';
import { AdminAIGenerator } from './components/admin/AdminAIGenerator';
import { AdminImportQuestions } from './components/admin/AdminImportQuestions';
import { AdminStudentManager } from './components/admin/AdminStudentManager';
import { AdminExamManager } from './components/admin/AdminExamManager';
import { AdminLiveMonitoring } from './components/admin/AdminLiveMonitoring';
import { AdminResultsAnalysis } from './components/admin/AdminResultsAnalysis';
import { AdminLeger } from './components/admin/AdminLeger';
import { TeacherLoginModal } from './components/admin/TeacherLoginModal';

import { 
  GraduationCap, 
  ShieldCheck, 
  BookOpen, 
  LayoutDashboard, 
  Sparkles, 
  Upload, 
  Users, 
  Layers, 
  Activity, 
  BarChart3, 
  Printer, 
  LogOut, 
  UserCheck, 
  Code2,
  ChevronRight,
  Menu,
  X,
  Lock,
  User
} from 'lucide-react';

function AppContent() {
  const { 
    exams, 
    activeExam, 
    startStudentExam, 
    isFirebaseConnected, 
    firebaseSyncStatus,
    isTeacherLoggedIn,
    teacherName,
    loginTeacher,
    logoutTeacher
  } = useApp();

  // Role state: 'student' | 'admin'
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [showTeacherLoginModal, setShowTeacherLoginModal] = useState<boolean>(false);

  // Student Flow States
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showLockModal, setShowLockModal] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<StudentExamSession | null>(null);
  const [completedSession, setCompletedSession] = useState<StudentExamSession | null>(null);

  // Student Login Success
  const handleStudentLoginSuccess = (student: Student, exam: Exam) => {
    setCurrentStudent(student);
    setSelectedExam(exam);
    setShowLockModal(true);
  };

  // Student Starts Exam (after entering fullscreen lock modal)
  const handleStartExam = async () => {
    if (!currentStudent || !selectedExam) return;
    setShowLockModal(false);
    const newSession = await startStudentExam(selectedExam.id, currentStudent.id);
    setActiveSession(newSession);
  };

  // Student Finishes Exam
  const handleFinishExam = (finishedSession: StudentExamSession) => {
    setActiveSession(null);
    setCompletedSession(finishedSession);
  };

  // Reset Student Flow
  const handleRestartStudent = () => {
    setCurrentStudent(null);
    setSelectedExam(null);
    setActiveSession(null);
    setCompletedSession(null);
    setShowLockModal(false);
  };

  // Teacher Access Protection Flow
  const handleSelectAdminRole = () => {
    if (isTeacherLoggedIn) {
      setRole('admin');
    } else {
      setShowTeacherLoginModal(true);
    }
  };

  const handleTeacherLoginSuccess = () => {
    loginTeacher('Guru Pengampu Informatika');
    setShowTeacherLoginModal(false);
    setRole('admin');
  };

  const handleTeacherLogout = () => {
    logoutTeacher();
    setRole('student');
    handleRestartStudent();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bank-soal', label: 'Bank Soal (42+)', icon: BookOpen },
    { id: 'ai-generator', label: 'AI Soal Generator', icon: Sparkles, highlight: true },
    { id: 'import-soal', label: 'Import Excel/CSV', icon: Upload },
    { id: 'data-siswa', label: 'Data Siswa (9A-9G)', icon: Users },
    { id: 'paket-ulangan', label: 'Paket Ulangan', icon: Layers },
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity },
    { id: 'hasil-analisis', label: 'Hasil & Analisis', icon: BarChart3 },
    { id: 'leger', label: 'Leger Nilai Resmi', icon: Printer },
  ];

  // If in active student exam mode, show dedicated distraction-free exam screen
  if (role === 'student' && activeSession && currentStudent && selectedExam) {
    return (
      <StudentExamScreen
        student={currentStudent}
        exam={selectedExam}
        session={activeSession}
        onFinish={handleFinishExam}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Application Header / Global Navbar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Code2 className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight">
                  INFORMATIKA IX
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase border border-blue-500/30">
                  9A • 9B • 9C • 9D • 9E • 9F • 9G
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Sistem Asesmen Ulangan Harian & Bank Soal Terpadu SMP
              </p>
            </div>
          </div>

          {/* Role Switcher Pill, Cloud Status & Teacher Lock */}
          <div className="flex items-center gap-2.5">
            {/* Firebase Cloud Status Indicator */}
            <div 
              title={isFirebaseConnected ? 'Firebase Firestore Terhubung (Real-Time Cloud Sync)' : 'Firebase Menghubungkan...'}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/70 text-[11px] font-medium"
            >
              <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-mono">Firestore</span>
              <span className={`text-[10px] font-bold uppercase ${isFirebaseConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {firebaseSyncStatus === 'syncing' ? 'Syncing...' : 'Live'}
              </span>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center p-1 bg-slate-800/90 rounded-2xl border border-slate-700/80 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setRole('student');
                  handleRestartStudent();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  role === 'student'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Mode Siswa</span>
              </button>
              <button
                type="button"
                onClick={handleSelectAdminRole}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  role === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isTeacherLoggedIn ? <ShieldCheck className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
                <span>Panel Guru</span>
              </button>
            </div>

            {/* Teacher Logout button when inside Admin */}
            {role === 'admin' && (
              <button
                type="button"
                onClick={handleTeacherLogout}
                title="Keluar dari Panel Guru (Kunci Akses)"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout Guru</span>
              </button>
            )}

            {/* Mobile menu toggle for admin */}
            {role === 'admin' && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Secondary Sub-Navbar for Admin Tabs */}
        {role === 'admin' && (
          <div className="bg-slate-950/60 border-t border-slate-800/60 px-4 sm:px-6 lg:px-8 hidden lg:block overflow-x-auto">
            <div className="max-w-7xl mx-auto flex items-center justify-between py-1.5">
              <div className="flex items-center gap-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = adminTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setAdminTab(item.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : item.highlight
                          ? 'text-amber-300 hover:bg-slate-800/80'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${item.highlight && !isActive ? 'text-amber-400' : ''}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Logged in Teacher Badge */}
              <div className="flex items-center gap-2 text-xs text-slate-300 pl-4 border-l border-slate-800">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-400/30 text-indigo-300 flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-slate-200">{teacherName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Dropdown for Admin */}
        {role === 'admin' && isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-950 border-t border-slate-800 p-4 space-y-1">
            <div className="p-3 mb-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span className="font-bold">{teacherName}</span>
              </div>
              <button
                onClick={handleTeacherLogout}
                className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>

            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setAdminTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Body View */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* STUDENT PORTAL FLOW */}
        {role === 'student' && (
          <div>
            {completedSession && selectedExam ? (
              <StudentResultScreen
                session={completedSession}
                exam={selectedExam}
                onRestart={handleRestartStudent}
              />
            ) : (
              <StudentLogin onLoginSuccess={handleStudentLoginSuccess} />
            )}

            {/* Exam Lock Modal */}
            {showLockModal && currentStudent && selectedExam && (
              <ExamLockModal
                student={currentStudent}
                exam={selectedExam}
                onConfirmStart={handleStartExam}
                onCancel={() => setShowLockModal(false)}
              />
            )}
          </div>
        )}

        {/* ADMIN / TEACHER PORTAL FLOW */}
        {role === 'admin' && (
          <div>
            {adminTab === 'dashboard' && <AdminDashboard onNavigate={setAdminTab} />}
            {adminTab === 'bank-soal' && <AdminQuestionBank />}
            {adminTab === 'ai-generator' && <AdminAIGenerator />}
            {adminTab === 'import-soal' && <AdminImportQuestions />}
            {adminTab === 'data-siswa' && <AdminStudentManager />}
            {adminTab === 'paket-ulangan' && <AdminExamManager />}
            {adminTab === 'monitoring' && <AdminLiveMonitoring />}
            {adminTab === 'hasil-analisis' && <AdminResultsAnalysis />}
            {adminTab === 'leger' && <AdminLeger />}
          </div>
        )}
      </div>

      {/* Teacher Login Modal Dialog */}
      <TeacherLoginModal
        isOpen={showTeacherLoginModal}
        onClose={() => setShowTeacherLoginModal(false)}
        onSuccess={handleTeacherLoginSuccess}
      />

      {/* Global Footer (Hidden in print) */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-semibold text-slate-700">
            Aplikasi Ulangan Harian Informatika Kelas IX • Kurikulum Nasional SMP
          </div>
          <div className="text-slate-400">
            Kelas Terdaftar: 9A, 9B, 9C, 9D, 9E, 9F, 9G (220 Siswa) • Struktur Data & Logika Informatika
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
