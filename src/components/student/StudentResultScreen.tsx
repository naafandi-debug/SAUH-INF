import React, { useEffect, useState } from 'react';
import { StudentExamSession, Exam } from '../../types';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  BookOpen, 
  RotateCcw, 
  Sparkles, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Layers,
  Code2
} from 'lucide-react';

interface StudentResultScreenProps {
  session: StudentExamSession;
  exam: Exam;
  onRestart: () => void;
}

export const StudentResultScreen: React.FC<StudentResultScreenProps> = ({
  session,
  exam,
  onRestart
}) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const score = session.score || 0;
  const isPassed = session.passed || score >= (exam.kkm || 75);
  const correctCount = session.correctCount || 0;
  const wrongCount = session.wrongCount || (session.questions.length - correctCount);

  useEffect(() => {
    if (isPassed) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [isPassed]);

  const toggleExpand = (qId: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const filteredQuestions = session.questions.filter(item => {
    const studentAns = session.answers[item.questionId];
    const isCorrect = studentAns === item.originalQuestion.correctOptionId;
    if (filter === 'correct') return isCorrect;
    if (filter === 'wrong') return !isCorrect;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Bento Grid Top Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Bento Card 1: Main Score Showcase (Col 7) */}
        <div className="md:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ujian Berhasil Terkirim
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(session.endTime || Date.now()).toLocaleTimeString()}
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-900 leading-tight">
              {isPassed ? 'Selamat! Anda Tuntas KKM' : 'Evaluasi Hasil Ulangan'}
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Peserta: <strong className="text-slate-800">{session.studentName}</strong> • Kelas {session.className} • NISN: {session.studentNisn}
            </p>
          </div>

          <div className="my-6 flex items-center gap-6">
            {/* Big Bento Score Box */}
            <div className="w-32 h-32 rounded-3xl bg-slate-900 text-white flex flex-col items-center justify-center shadow-xs shrink-0 border border-slate-800">
              <span className="text-4xl font-black text-amber-400 font-mono tracking-tight">{score}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">Nilai Akhir</span>
            </div>

            <div className="space-y-2 flex-1">
              <div>
                <span className="text-xs text-slate-400 font-medium">Status Ketuntasan</span>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {isPassed ? 'TUNTAS (LULUS)' : 'BELUM TUNTAS'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Nilai Kriteria Ketuntasan Minimal (KKM): <strong className="text-slate-800 font-bold">{exam.kkm || 75} Poin</strong>.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onRestart}
              className="py-2.5 px-5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              Kembali ke Login Peserta
            </button>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              {exam.name}
            </span>
          </div>
        </div>

        {/* Bento Card 2: Performance Breakdown (Col 5) */}
        <div className="md:col-span-5 bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2 text-indigo-400 mb-6">
              <BarChart3 className="w-4 h-4" />
              Ringkasan Analisis Skor
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Jawaban Benar</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">{correctCount} <span className="text-xs font-normal text-slate-400">Soal</span></p>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Jawaban Salah</p>
                <p className="text-2xl font-black text-rose-400 mt-1">{wrongCount} <span className="text-xs font-normal text-slate-400">Soal</span></p>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Akurasi Nilai</p>
                <p className="text-2xl font-black text-indigo-300 mt-1">{Math.round((correctCount / (session.questions.length || 1)) * 100)}%</p>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Log Keamanan</p>
                <p className="text-2xl font-black text-amber-400 mt-1">{session.violations?.length || 0} <span className="text-xs font-normal text-slate-400">Kejadian</span></p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-950/60 border border-indigo-800/60 rounded-2xl text-[11px] text-indigo-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Hasil penilaian otomatis telah disinkronkan ke buku nilai pengawas.</span>
          </div>
        </div>
      </div>

      {/* Review Section Bento Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Pembahasan & Review Butir Soal
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tinjau kunci jawaban, analisis materi, dan penjelasan logika
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({session.questions.length})
            </button>
            <button
              onClick={() => setFilter('correct')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filter === 'correct' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Benar ({correctCount})
            </button>
            <button
              onClick={() => setFilter('wrong')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filter === 'wrong' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Salah ({wrongCount})
            </button>
          </div>
        </div>

        {/* Question Review List */}
        <div className="divide-y divide-slate-100 mt-4 space-y-4">
          {filteredQuestions.map((item, idx) => {
            const studentAns = session.answers[item.questionId];
            const isCorrect = studentAns === item.originalQuestion.correctOptionId;
            const isExpanded = !!expandedQuestions[item.questionId];

            return (
              <div key={item.questionId} className="pt-4 first:pt-0">
                <div 
                  onClick={() => toggleExpand(item.questionId)}
                  className="flex items-start justify-between gap-4 p-4 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span 
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isCorrect ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 stroke-[3]" />}
                    </span>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-800">
                          Nomor {idx + 1}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {item.originalQuestion.material}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 line-clamp-2">
                        {item.originalQuestion.question}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {isCorrect ? '+5 Poin' : '0 Poin'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 mt-2 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 text-xs animate-in fade-in duration-150">
                    <div>
                      <span className="font-bold text-slate-700 block mb-2">Pilihan Jawaban:</span>
                      <div className="space-y-2">
                        {item.originalQuestion.options.map(opt => {
                          const isKey = opt.id === item.originalQuestion.correctOptionId;
                          const isChosen = opt.id === studentAns;

                          let bg = 'bg-white border-slate-200 text-slate-700';
                          if (isKey) bg = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                          if (isChosen && !isKey) bg = 'bg-rose-50 border-rose-400 text-rose-900 line-through';

                          return (
                            <div key={opt.id} className={`p-3 rounded-xl border flex items-center justify-between ${bg}`}>
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs">
                                  {opt.id}
                                </span>
                                <span>{opt.text}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                {isChosen && <span className="text-slate-500 bg-slate-200 px-2 py-0.5 rounded">Pilihan Anda</span>}
                                {isKey && <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Kunci Jawaban</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                      <span className="font-bold text-indigo-900 block mb-1">Penjelasan & Pembahasan:</span>
                      <p className="text-indigo-950 leading-relaxed">
                        {item.originalQuestion.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
