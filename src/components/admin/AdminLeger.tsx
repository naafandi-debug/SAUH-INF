import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentExamSession } from '../../types';
import { downloadCSV } from '../../utils/exportHelpers';
import { 
  Printer, 
  Download, 
  FileText, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Sparkles,
  Building2
} from 'lucide-react';

export const AdminLeger: React.FC = () => {
  const { students, exams, activeExam, sessions } = useApp();

  const [selectedClass, setSelectedClass] = useState<string>('9A');
  const [selectedExamId, setSelectedExamId] = useState<string>(activeExam?.id || exams[0]?.id || 'EXAM_1');

  // School metadata customizable
  const [schoolName, setSchoolName] = useState<string>('SMP NEGERI 1 NUSANTARA');
  const [academicYear, setAcademicYear] = useState<string>('2025/2026');
  const [teacherName, setTeacherName] = useState<string>('Budi Setiawan, S.Kom.');
  const [teacherNip, setTeacherNip] = useState<string>('19850712 201001 1 008');
  const [principalName, setPrincipalName] = useState<string>('Dra. Hj. Siti Rahmawati, M.Pd.');
  const [principalNip, setPrincipalNip] = useState<string>('19720315 199802 2 003');

  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0];

  const classList = useMemo(() => {
    const cls = Array.from(new Set(students.map(s => s.className))).sort();
    return cls.length > 0 ? cls : ['9A', '9B', '9C'];
  }, [students]);

  // Students in selected class with their exam results
  const legerData = useMemo(() => {
    const classStudents = students.filter(s => s.className === selectedClass);
    const allSessions = Object.values(sessions) as StudentExamSession[];

    return classStudents.map((st, idx) => {
      const sess = allSessions.find(s => s.studentId === st.id && s.examId === currentExam?.id);
      const isSubmitted = sess?.submitted;
      const score = isSubmitted ? (sess?.score || 0) : 0;
      const kkm = currentExam?.kkm || 75;
      const passed = score >= kkm && isSubmitted;

      return {
        no: idx + 1,
        id: st.id,
        nisn: st.nisn,
        nis: st.nis,
        name: st.name,
        gender: st.gender || (idx % 2 === 0 ? 'L' : 'P'),
        correct: isSubmitted ? (sess?.correctCount || 0) : 0,
        wrong: isSubmitted ? (sess?.wrongCount || 0) : 0,
        score: isSubmitted ? score : 0,
        isSubmitted,
        passed,
        predicate: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 75 ? 'C' : 'D',
        status: !isSubmitted ? 'Belum Ujian' : passed ? 'TUNTAS' : 'REMEDIAL'
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [students, selectedClass, sessions, currentExam]);

  // Leger summary statistics
  const summary = useMemo(() => {
    const submitted = legerData.filter(d => d.isSubmitted);
    const total = legerData.length;
    const count = submitted.length;
    const scores = submitted.map(d => d.score);

    const avg = count > 0 ? (scores.reduce((a, b) => a + b, 0) / count).toFixed(1) : '0.0';
    const highest = count > 0 ? Math.max(...scores) : 0;
    const lowest = count > 0 ? Math.min(...scores) : 0;
    const passedCount = submitted.filter(d => d.passed).length;
    const passPercentage = count > 0 ? Math.round((passedCount / count) * 100) : 0;

    return { total, count, avg, highest, lowest, passedCount, failedCount: count - passedCount, passPercentage };
  }, [legerData]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportLegerCSV = () => {
    const headers = ['No', 'NISN', 'NIS', 'Nama Siswa', 'L/P', 'Kelas', 'Jawaban Benar', 'Jawaban Salah', 'Nilai Ulangan', 'Predikat', 'Status KKM (KKM 75)'];
    const rows = legerData.map(r => [
      r.no,
      r.nisn,
      r.nis,
      r.name,
      r.gender,
      selectedClass,
      r.correct,
      r.wrong,
      r.score,
      r.predicate,
      r.status
    ]);
    downloadCSV(`Leger_Nilai_Informatika_${selectedClass}_${Date.now()}.csv`, rows, headers);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar (Hidden during print) */}
      <div className="print:hidden bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            Leger Nilai Ulangan Harian Resmi (PRD Modul 16 & 38)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Format rekapitulasi nilai resmi sekolah untuk pencetakan dokumen PDF & arsip kurikulum.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
          >
            {classList.map(c => (
              <option key={c} value={c}>
                Kelas {c}
              </option>
            ))}
          </select>

          {/* Exam Filter */}
          <select
            value={selectedExamId}
            onChange={e => setSelectedExamId(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
          >
            {exams.map(ex => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportLegerCSV}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>

          <button
            onClick={handlePrint}
            className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            Cetak Leger (PDF / Kertas)
          </button>
        </div>
      </div>

      {/* Official Indonesian School Leger Document Container */}
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none print:rounded-none">
        {/* Kop Surat Resmi */}
        <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 text-center">
          <div className="text-xs font-extrabold uppercase tracking-widest text-slate-700">
            PEMERINTAH DAERAH PROVINSI / KABUPATEN • DINAS PENDIDIKAN
          </div>
          <div className="text-xl md:text-2xl font-black uppercase text-slate-950 mt-1 tracking-tight">
            {schoolName}
          </div>
          <div className="text-xs text-slate-600 mt-1">
            Alamat: Jl. Pendidikan No. 45 • NPSN: 20109988 • Akreditasi: A (Unggul)
          </div>
          <div className="mt-3 text-sm md:text-base font-black uppercase text-slate-900 border-t border-slate-300 pt-2 tracking-wide">
            LEGER NILAI ULANGAN HARIAN INFORMATIKA KELAS {selectedClass}
          </div>
          <div className="text-xs text-slate-600 font-semibold">
            Materi: {currentExam?.materials || 'Struktur Data & Gerbang Logika'} • Tahun Ajaran {academicYear}
          </div>
        </div>

        {/* Identity Meta Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-800 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-transparent print:border print:p-2">
          <div>
            <span className="text-slate-500 font-normal">Mata Pelajaran:</span> Informatika
          </div>
          <div>
            <span className="text-slate-500 font-normal">Kelas / Semester:</span> IX (Sembilan) / Ganjil
          </div>
          <div>
            <span className="text-slate-500 font-normal">KKM Sekolah:</span> <strong>{currentExam?.kkm || 75}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-normal">Jumlah Peserta:</span> {legerData.length} Siswa
          </div>
        </div>

        {/* Table Leger Nilai */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-slate-400">
            <thead>
              <tr className="bg-slate-100 text-slate-900 uppercase font-black text-center border-b border-slate-400">
                <th className="border border-slate-400 p-2 w-10">No</th>
                <th className="border border-slate-400 p-2 w-28 font-mono">NISN</th>
                <th className="border border-slate-400 p-2 w-20 font-mono">NIS</th>
                <th className="border border-slate-400 p-2 text-left">Nama Siswa</th>
                <th className="border border-slate-400 p-2 w-10">L/P</th>
                <th className="border border-slate-400 p-2 w-14">Benar</th>
                <th className="border border-slate-400 p-2 w-14">Salah</th>
                <th className="border border-slate-400 p-2 w-16 font-black">Nilai</th>
                <th className="border border-slate-400 p-2 w-16">Predikat</th>
                <th className="border border-slate-400 p-2 w-28">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {legerData.map((row, i) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="border border-slate-300 p-2 text-center font-bold text-slate-600">{i + 1}</td>
                  <td className="border border-slate-300 p-2 font-mono text-center">{row.nisn}</td>
                  <td className="border border-slate-300 p-2 font-mono text-center">{row.nis}</td>
                  <td className="border border-slate-300 p-2 font-bold text-slate-900">{row.name}</td>
                  <td className="border border-slate-300 p-2 text-center">{row.gender}</td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-emerald-700">{row.correct}</td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-rose-700">{row.wrong}</td>
                  <td className="border border-slate-300 p-2 text-center font-black text-sm">
                    {row.isSubmitted ? row.score : '-'}
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold">{row.isSubmitted ? row.predicate : '-'}</td>
                  <td className="border border-slate-300 p-2 text-center font-bold">
                    <span 
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        row.status === 'TUNTAS' 
                          ? 'text-emerald-800 bg-emerald-100 font-black' 
                          : row.status === 'REMEDIAL' 
                          ? 'text-rose-800 bg-rose-100 font-black' 
                          : 'text-slate-500'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Leger Statistical Summary Box */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs border border-slate-300 p-4 rounded-xl bg-slate-50 print:bg-transparent">
          <div>
            <span className="text-slate-500">Rata-Rata Kelas:</span>{' '}
            <strong className="text-slate-900 text-sm font-black">{summary.avg}</strong>
          </div>
          <div>
            <span className="text-slate-500">Nilai Tertinggi:</span>{' '}
            <strong className="text-emerald-700 text-sm font-black">{summary.highest}</strong>
          </div>
          <div>
            <span className="text-slate-500">Nilai Terendah:</span>{' '}
            <strong className="text-rose-700 text-sm font-black">{summary.lowest}</strong>
          </div>
          <div>
            <span className="text-slate-500">Ketuntasan Klasikal:</span>{' '}
            <strong className="text-blue-700 text-sm font-black">{summary.passPercentage}% ({summary.passedCount}/{summary.count} Siswa)</strong>
          </div>
        </div>

        {/* Official Signature Block (PRD Section 16 & 38) */}
        <div className="mt-12 grid grid-cols-2 gap-8 text-xs text-center">
          <div>
            <p className="text-slate-600">Mengetahui,</p>
            <p className="font-bold text-slate-900">Kepala Sekolah</p>
            <div className="h-20" />
            <p className="font-black text-slate-900 underline">{principalName}</p>
            <p className="text-slate-500 font-mono">NIP. {principalNip}</p>
          </div>

          <div>
            <p className="text-slate-600">Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold text-slate-900">Guru Mata Pelajaran Informatika</p>
            <div className="h-20" />
            <p className="font-black text-slate-900 underline">{teacherName}</p>
            <p className="text-slate-500 font-mono">NIP. {teacherNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
