import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam, Student, StudentExamSession } from '../../types';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  Send, 
  ShieldAlert, 
  Maximize2, 
  Bookmark,
  Layers,
  Sparkles,
  BarChart2,
  Check,
  Code2
} from 'lucide-react';

interface StudentExamScreenProps {
  student: Student;
  exam: Exam;
  session: StudentExamSession;
  onFinish: (completedSession: StudentExamSession) => void;
}

export const StudentExamScreen: React.FC<StudentExamScreenProps> = ({
  student,
  exam,
  session,
  onFinish,
}) => {
  const { saveStudentAnswer, submitStudentExam, recordViolation } = useApp();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>(session.answers || {});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(() => {
    const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
    const total = (session.durationMinutes || 40) * 60;
    const remaining = total - elapsed;
    return remaining > 0 ? remaining : 0;
  });

  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showViolationWarning, setShowViolationWarning] = useState<string | null>(null);
  const [autosaveStatus, setAutosaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const totalQuestions = session.questions.length;
  const currentItem = session.questions[currentIndex];

  // Request fullscreen on mount if not active
  useEffect(() => {
    const enterFS = async () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (err) {
        console.warn('Fullscreen request blocked by browser policy:', err);
      }
    };
    enterFS();
  }, []);

  // Anti-Cheat: Listeners for Fullscreen change, Tab blur, Visibility change, Context menu, Copy shortcuts
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        const act = 'Keluar dari layar penuh (Fullscreen Exited)';
        recordViolation(student.name, student.className, act, 'medium');
        setShowViolationWarning('PERINGATAN: Anda terdeteksi keluar dari mode layar penuh!');
        setTimeout(() => setShowViolationWarning(null), 5000);
      } else {
        setIsFullscreen(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const act = 'Berpindah tab/minimize browser (Tab Hidden)';
        recordViolation(student.name, student.className, act, 'high');
        setShowViolationWarning('PERINGATAN KERAS: Terdeteksi meninggalkan tab halaman ujian!');
        setTimeout(() => setShowViolationWarning(null), 6000);
      }
    };

    const handleWindowBlur = () => {
      const act = 'Kehilangan fokus jendela (Window Blur / Switch App)';
      recordViolation(student.name, student.className, act, 'medium');
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      recordViolation(student.name, student.className, 'Mencoba klik kanan (Context Menu)', 'low');
      setShowViolationWarning('Klik kanan dinonaktifkan demi keamanan ujian.');
      setTimeout(() => setShowViolationWarning(null), 3000);
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        recordViolation(student.name, student.className, 'Menekan tombol Print Screen', 'high');
        setShowViolationWarning('Peringatan: Screenshot terpantau dalam log pengawas.');
        setTimeout(() => setShowViolationWarning(null), 4000);
      }

      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'u', 'p', 's', 'a'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        recordViolation(student.name, student.className, `Mencoba shortcut Ctrl+${e.key.toUpperCase()}`, 'low');
        setShowViolationWarning(`Kombinasi tombol Ctrl+${e.key.toUpperCase()} dinonaktifkan.`);
        setTimeout(() => setShowViolationWarning(null), 3000);
      }

      if (e.key === 'F12') {
        e.preventDefault();
        recordViolation(student.name, student.className, 'Mencoba membuka Inspect Elements (F12)', 'high');
      }

      // Keyboard navigation & quick option selection
      if (!showSubmitModal) {
        if (['1', '2', '3', '4'].includes(e.key) && currentItem) {
          const idx = parseInt(e.key) - 1;
          if (currentItem.shuffledOptions[idx]) {
            handleSelectOption(currentItem.shuffledOptions[idx].id);
          }
        } else if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase()) && currentItem) {
          const keyLetter = e.key.toUpperCase();
          const opt = currentItem.shuffledOptions.find(o => o.id === keyLetter);
          if (opt) {
            handleSelectOption(opt.id);
          }
        } else if (e.key === 'ArrowRight' && currentIndex < totalQuestions - 1) {
          setCurrentIndex(prev => prev + 1);
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [student, recordViolation, showSubmitModal, currentItem, currentIndex, totalQuestions]);

  // Countdown Timer
  useEffect(() => {
    if (timeLeftSeconds <= 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeftSeconds]);

  // Select Option & Autosave
  const handleSelectOption = useCallback((optionId: string) => {
    if (!currentItem) return;

    setAutosaveStatus('saving');
    const newAnswers = { ...answers, [currentItem.questionId]: optionId };
    setAnswers(newAnswers);

    saveStudentAnswer(exam.id, student.id, currentItem.questionId, optionId);

    setTimeout(() => {
      setAutosaveStatus('saved');
    }, 180);
  }, [currentItem, answers, exam.id, student.id, saveStudentAnswer]);

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleFinalSubmit = async () => {
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}

    const completed = await submitStudentExam(exam.id, student.id);
    onFinish(completed);
  };

  const reEnterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (e) {}
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const isTimeCritical = timeLeftSeconds < 300; // less than 5 mins

  // Dynamic Topic Progress for the Bento Card widget
  const topicProgress = useMemo(() => {
    const structDataQs = session.questions.filter(q => q.originalQuestion.material === 'Struktur Data');
    const logicQs = session.questions.filter(q => q.originalQuestion.material === 'Logika Informatika');

    const structAnswered = structDataQs.filter(q => !!answers[q.questionId]).length;
    const logicAnswered = logicQs.filter(q => !!answers[q.questionId]).length;

    const structPercent = structDataQs.length > 0 ? Math.round((structAnswered / structDataQs.length) * 100) : 0;
    const logicPercent = logicQs.length > 0 ? Math.round((logicAnswered / logicQs.length) * 100) : 0;

    return {
      structPercent,
      structCount: `${structAnswered}/${structDataQs.length}`,
      logicPercent,
      logicCount: `${logicAnswered}/${logicQs.length}`
    };
  }, [session.questions, answers]);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#F1F5F9] text-slate-900 select-none relative flex flex-col font-sans p-4 sm:p-6 gap-6"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Dynamic Security Watermark (PRD Section 18) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex flex-wrap items-center justify-around opacity-[0.035] select-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="text-sm md:text-base font-mono font-bold transform -rotate-25 p-8 whitespace-nowrap text-slate-950">
            ULANGAN HARIAN INFORMATIKA • {student.name} • {student.nisn} • KELAS {student.className} • {exam.accessCode}
          </div>
        ))}
      </div>

      {/* Floating Violation Warning Toast */}
      {showViolationWarning && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-rose-400 animate-in slide-in-from-top-4 duration-200">
          <ShieldAlert className="w-5 h-5 animate-pulse text-amber-300" />
          <div className="text-xs sm:text-sm font-bold">{showViolationWarning}</div>
        </div>
      )}

      {/* Exit Fullscreen Alert Banner */}
      {!isFullscreen && (
        <div className="bg-rose-500 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md relative z-20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>Mode Layar Penuh terputus. Mohon segera kembali ke mode fullscreen.</span>
          </div>
          <button
            onClick={reEnterFullscreen}
            className="px-3 py-1 bg-white text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            Aktifkan Fullscreen
          </button>
        </div>
      )}

      {/* Bento Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:px-6 rounded-2xl shadow-xs border border-slate-200 relative z-10 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-xs">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg leading-tight text-slate-900">
              {exam.name || 'Struktur Data & Gerbang Logika'}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {student.name} • Kelas {student.className} • NISN: {student.nisn}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-5">
          {/* Autosave status indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{autosaveStatus === 'saving' ? 'Menyimpan...' : 'Autosave Aktif'}</span>
          </div>

          {/* Sisa Waktu Bento Clock */}
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Sisa Waktu</p>
            <p className={`font-mono text-xl sm:text-2xl font-black ${isTimeCritical ? 'text-rose-600 animate-pulse' : 'text-indigo-600'}`}>
              {formatTime(timeLeftSeconds)}
            </p>
          </div>

          <button 
            onClick={() => setShowSubmitModal(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Selesaikan Ujian
          </button>
        </div>
      </header>

      {/* Main Bento Grid Workspace */}
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Bento Section 1: Main Question Card (Col 8) */}
        <section className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Top Question Pill & Flag Toggle */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
                  Pertanyaan {currentIndex + 1} dari {totalQuestions}
                </span>
                <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-3 py-1 rounded-full">
                  {currentItem?.originalQuestion.material}
                </span>
                {currentItem?.originalQuestion.submaterial && (
                  <span className="hidden sm:inline-block bg-indigo-50 text-indigo-700 text-[11px] font-medium px-3 py-1 rounded-full border border-indigo-100">
                    {currentItem.originalQuestion.submaterial}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-xs italic hidden sm:inline">Bobot: 5 Poin</span>
                <button
                  type="button"
                  onClick={() => currentItem && toggleFlag(currentItem.questionId)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    currentItem && flaggedQuestions[currentItem.questionId]
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{currentItem && flaggedQuestions[currentItem.questionId] ? 'Ragu-ragu' : 'Tandai Ragu'}</span>
                </button>
              </div>
            </div>
            
            {/* Question Text */}
            <div className="flex-grow">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold leading-snug mb-7 text-slate-900">
                {currentItem?.originalQuestion.question}
              </h2>
              
              {/* Option List (Bento buttons with group hover and letter pill) */}
              <div className="grid grid-cols-1 gap-3.5">
                {currentItem?.shuffledOptions.map((opt, optIndex) => {
                  const letter = ['A', 'B', 'C', 'D'][optIndex];
                  const isSelected = answers[currentItem.questionId] === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      className={`flex items-center p-4 border-2 rounded-2xl text-left group transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/80 shadow-xs' 
                          : 'border-slate-100 hover:border-indigo-600 hover:bg-indigo-50/50 bg-white'
                      }`}
                    >
                      <span 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm mr-4 transition-colors shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className={`text-sm sm:text-base font-medium flex-1 ${isSelected ? 'text-indigo-950 font-semibold' : 'text-slate-800'}`}>
                        {opt.text}
                      </span>
                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 ml-2">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Bento Question Nav Bar */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
            <button 
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              className="text-slate-600 font-semibold text-xs sm:text-sm flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </button>

            <div className="text-[11px] font-bold text-slate-400 hidden sm:block">
              Tekan tombol angka 1-4 atau huruf A-D pada keyboard
            </div>

            {currentIndex < totalQuestions - 1 ? (
              <button 
                onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                className="bg-indigo-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all cursor-pointer"
              >
                Berikutnya
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => setShowSubmitModal(true)}
                className="bg-emerald-600 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:bg-emerald-700 shadow-sm shadow-emerald-200 transition-all cursor-pointer"
              >
                Kirim Jawaban
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>

        {/* Right Bento Column: 2 Stacked Bento Modules (Col 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Bento Card 2: Progress Topik & Quick Stats */}
          <aside className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-600" />
                Progress Topik Materi
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Struktur Data (LIFO / FIFO)</span>
                    <span className="text-indigo-600 font-bold">{topicProgress.structPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${topicProgress.structPercent}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Gerbang Logika & Boolean</span>
                    <span className="text-emerald-600 font-bold">{topicProgress.logicPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${topicProgress.logicPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Metric Counters Bento Box */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-around text-center">
                <div>
                  <p className="text-2xl font-black text-slate-900">{answeredCount}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Terjawab</p>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div>
                  <p className="text-2xl font-black text-slate-900">{unansweredCount}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Tersisa</p>
                </div>
                <div className="w-px h-8 bg-slate-100" />
                <div>
                  <p className="text-2xl font-black text-amber-500">{flaggedCount}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Ragu-ragu</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Bento Card 3: Dark Bento Navigation Palette */}
          <aside className="bg-slate-900 rounded-3xl p-6 text-white shadow-xs border border-slate-800 flex flex-col justify-between flex-grow">
            <div>
              <h3 className="font-bold mb-4 text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Navigasi Soal ({totalQuestions})
                </span>
                <span className="text-[11px] font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-800">
                  {answeredCount}/{totalQuestions}
                </span>
              </h3>

              {/* Grid Number Palette (5 cols for 20 questions) */}
              <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
                {session.questions.map((q, idx) => {
                  const isAnswered = !!answers[q.questionId];
                  const isFlagged = !!flaggedQuestions[q.questionId];
                  const isActive = currentIndex === idx;

                  let colorClass = 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white';
                  if (isAnswered) colorClass = 'bg-emerald-500 text-white font-bold';
                  if (isFlagged) colorClass = 'bg-amber-500 text-white font-bold';
                  if (isActive) colorClass = 'bg-indigo-600 ring-2 ring-indigo-300 text-white font-bold';

                  return (
                    <button
                      key={q.questionId}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${colorClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mini Legend inside Dark Bento */}
            <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Sudah Dijawab
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Ragu-ragu
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Sedang Dibuka
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" /> Belum Dijawab
              </span>
            </div>
          </aside>
        </div>

        {/* Bento Footer info bar */}
        <footer className="lg:col-span-12 flex flex-wrap items-center justify-center text-slate-500 text-xs gap-3 sm:gap-6 py-2">
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" /> Sudah Terjawab
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" /> Ragu-ragu
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-slate-400" /> Belum Terjawab
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="text-slate-500 font-medium">Sistem Asesmen Terkunci • Informatika Kelas IX</span>
        </footer>
      </main>

      {/* Submit Confirmation Modal (PRD Section 22) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
              <Send className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 text-center">
              Konfirmasi Pengiriman Ujian
            </h3>
            
            <p className="text-slate-600 text-xs text-center mt-1">
              Apakah Anda yakin ingin mengakhiri dan mengirim hasil ulangan harian ini?
            </p>

            {/* Summary Box */}
            <div className="my-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Soal</span>
                <span className="font-bold text-slate-800">{totalQuestions} Soal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sudah Dijawab</span>
                <span className="font-bold text-emerald-600">{answeredCount} Soal</span>
              </div>
              {unansweredCount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Belum Dijawab</span>
                  <span>{unansweredCount} Soal Kosong</span>
                </div>
              )}
              {flaggedCount > 0 && (
                <div className="flex justify-between text-amber-600 font-semibold">
                  <span>Ditandai Ragu</span>
                  <span>{flaggedCount} Soal</span>
                </div>
              )}
            </div>

            {unansweredCount > 0 && (
              <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200 mb-4 text-center font-medium">
                Peringatan: Masih ada {unansweredCount} soal yang belum dijawab.
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Periksa Lagi
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Ya, Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
