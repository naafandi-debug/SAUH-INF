import React from 'react';
import { ShieldCheck, Maximize2, AlertOctagon, CheckCircle2, Lock } from 'lucide-react';
import { Student, Exam } from '../../types';

interface ExamLockModalProps {
  student: Student;
  exam: Exam;
  onConfirmStart: () => void;
  onCancel: () => void;
}

export const ExamLockModal: React.FC<ExamLockModalProps> = ({
  student,
  exam,
  onConfirmStart,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-5 border border-indigo-100">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-black text-slate-900 text-center">
          Aktivasi Mode Ujian Terkunci (Bento Exam Mode)
        </h3>
        
        <p className="text-slate-600 text-xs text-center mt-2">
          Halo, <strong className="text-slate-900">{student.name} ({student.className})</strong>! Anda akan memulai ulangan <strong className="text-indigo-600">{exam.name}</strong>.
        </p>

        <div className="my-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Browser akan otomatis masuk ke <strong>Mode Layar Penuh (Fullscreen)</strong>.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Klik kanan, blok teks, dan shortcut keyboard (copy/paste/inspect) dinonaktifkan.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span><strong>Dilarang keluar fullscreen atau berganti tab.</strong> Pelanggaran dicatat otomatis di log monitoring pengawas.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Semua jawaban tersimpan secara otomatis (Autosave).</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirmStart}
            className="flex-2 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
            Mulai & Masuk Layar Penuh
          </button>
        </div>
      </div>
    </div>
  );
};

