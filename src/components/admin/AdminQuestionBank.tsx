import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Question, QuestionDifficulty, QuestionMaterial } from '../../types';
import { downloadCSV } from '../../utils/exportHelpers';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Tag,
  Layers,
  CheckCircle2,
  X
} from 'lucide-react';

export const AdminQuestionBank: React.FC = () => {
  const { questions, addQuestion, updateQuestion, deleteQuestion } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form fields
  const [formQuestion, setFormQuestion] = useState<string>('');
  const [formMaterial, setFormMaterial] = useState<QuestionMaterial>('Struktur Data');
  const [formSubmaterial, setFormSubmaterial] = useState<string>('Stack & LIFO');
  const [formDifficulty, setFormDifficulty] = useState<QuestionDifficulty>('Sedang');
  const [formOptions, setFormOptions] = useState<{ id: string; text: string }[]>([
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' }
  ]);
  const [formCorrectKey, setFormCorrectKey] = useState<string>('A');
  const [formExplanation, setFormExplanation] = useState<string>('');
  const [formSource, setFormSource] = useState<string>('Bank Soal Guru Informatika');

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchSearch = 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.submaterial.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchMaterial = selectedMaterial === 'all' || q.material === selectedMaterial;
      const matchDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;

      return matchSearch && matchMaterial && matchDifficulty;
    });
  }, [questions, searchQuery, selectedMaterial, selectedDifficulty]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setFormQuestion('');
    setFormMaterial('Struktur Data');
    setFormSubmaterial('Stack & LIFO');
    setFormDifficulty('Sedang');
    setFormOptions([
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' }
    ]);
    setFormCorrectKey('A');
    setFormExplanation('');
    setFormSource('Bank Soal Guru Informatika');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q: Question) => {
    setEditingQuestion(q);
    setFormQuestion(q.question);
    setFormMaterial(q.material);
    setFormSubmaterial(q.submaterial);
    setFormDifficulty(q.difficulty);
    setFormOptions([...q.options]);
    setFormCorrectKey(q.correctOptionId);
    setFormExplanation(q.explanation);
    setFormSource(q.source);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim()) return;

    if (editingQuestion) {
      updateQuestion(editingQuestion.id, {
        question: formQuestion,
        material: formMaterial,
        submaterial: formSubmaterial,
        difficulty: formDifficulty,
        options: formOptions,
        correctOptionId: formCorrectKey,
        explanation: formExplanation,
        source: formSource
      });
    } else {
      addQuestion({
        question: formQuestion,
        material: formMaterial,
        submaterial: formSubmaterial,
        difficulty: formDifficulty,
        options: formOptions,
        correctOptionId: formCorrectKey,
        explanation: formExplanation,
        source: formSource,
        status: 'active'
      });
    }
    setIsModalOpen(false);
  };

  const handleDuplicate = (q: Question) => {
    addQuestion({
      question: `${q.question} (Salinan)`,
      material: q.material,
      submaterial: q.submaterial,
      difficulty: q.difficulty,
      options: [...q.options],
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
      source: q.source,
      status: 'active'
    });
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Pertanyaan', 'Pilihan A', 'Pilihan B', 'Pilihan C', 'Pilihan D', 'Kunci', 'Materi', 'Submateri', 'Tingkat Kesulitan', 'Pembahasan', 'Sumber'];
    const rows = filteredQuestions.map(q => {
      const optA = q.options.find(o => o.id === 'A')?.text || '';
      const optB = q.options.find(o => o.id === 'B')?.text || '';
      const optC = q.options.find(o => o.id === 'C')?.text || '';
      const optD = q.options.find(o => o.id === 'D')?.text || '';
      return [
        q.id,
        q.question,
        optA,
        optB,
        optC,
        optD,
        q.correctOptionId,
        q.material,
        q.submaterial,
        q.difficulty,
        q.explanation,
        q.source
      ];
    });
    downloadCSV(`Bank_Soal_Informatika_Kelas_9_${Date.now()}.csv`, rows, headers);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Bank Soal Informatika Terpadu ({questions.length} Butir)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kumpulan soal pilihan ganda kurikulum Informatika Kelas 9 (Struktur Data LIFO/FIFO & Gerbang Logika).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handleOpenAddModal}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Soal Baru
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <input
            type="text"
            placeholder="Cari kata kunci soal, materi, atau pembahasan..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Material Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedMaterial}
            onChange={e => setSelectedMaterial(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="all">Semua Materi (Struktur Data & Logika)</option>
            <option value="Struktur Data">Struktur Data</option>
            <option value="Logika Informatika">Logika Informatika</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="all">Semua Tingkat Kesulitan</option>
            <option value="Mudah">Mudah</option>
            <option value="Sedang">Sedang</option>
            <option value="Sulit">Sulit</option>
          </select>
        </div>
      </div>

      {/* Question List Accordion */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => {
          const isExpanded = expandedIds[q.id] !== false; // default expanded

          return (
            <div key={q.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Question Header Row */}
              <div 
                onClick={() => toggleExpand(q.id)}
                className="p-4 md:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-mono font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {q.id.replace('Q', '')}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {q.material}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                        {q.submaterial}
                      </span>
                      <span 
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          q.difficulty === 'Mudah' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : q.difficulty === 'Sedang' 
                            ? 'bg-amber-50 text-amber-700' 
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                        • {q.source}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900 leading-snug">
                      {q.question}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    title="Edit Soal"
                    onClick={() => handleOpenEditModal(q)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    title="Duplikasi Soal"
                    onClick={() => handleDuplicate(q)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    title="Hapus Soal"
                    onClick={() => deleteQuestion(q.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleExpand(q.id)}
                    className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Question Options & Explanation Expanded */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-4 text-xs">
                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map(opt => {
                      const isCorrect = opt.id === q.correctOptionId;
                      return (
                        <div 
                          key={opt.id}
                          className={`p-3 rounded-xl border flex items-center justify-between ${
                            isCorrect 
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold' 
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {opt.id}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                          {isCorrect && (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              Kunci Jawaban ✓
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pembahasan Box */}
                  <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-slate-700 leading-relaxed">
                    <strong className="text-blue-900 font-bold block mb-1">
                      💡 Pembahasan Jawaban:
                    </strong>
                    <span className="whitespace-pre-line">{q.explanation}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 text-sm">
            Tidak ada butir soal yang sesuai dengan kriteria pencarian.
          </div>
        )}
      </div>

      {/* Modal Add / Edit Question */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                {editingQuestion ? 'Edit Butir Soal' : 'Tambah Soal Baru ke Bank Soal'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              {/* Materi & Submateri */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Materi Utama</label>
                  <select
                    value={formMaterial}
                    onChange={e => setFormMaterial(e.target.value as QuestionMaterial)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Struktur Data">Struktur Data</option>
                    <option value="Logika Informatika">Logika Informatika</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Submateri</label>
                  <input
                    type="text"
                    value={formSubmaterial}
                    onChange={e => setFormSubmaterial(e.target.value)}
                    placeholder="misal: Queue & FIFO"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Tingkat Kesulitan</label>
                  <select
                    value={formDifficulty}
                    onChange={e => setFormDifficulty(e.target.value as QuestionDifficulty)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sulit">Sulit</option>
                  </select>
                </div>
              </div>

              {/* Teks Soal */}
              <div>
                <label className="block font-bold text-slate-600 mb-1">Teks Pertanyaan</label>
                <textarea
                  rows={3}
                  required
                  value={formQuestion}
                  onChange={e => setFormQuestion(e.target.value)}
                  placeholder="Tuliskan butir soal pilihan ganda di sini..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              {/* Pilihan Jawaban A, B, C, D */}
              <div>
                <label className="block font-bold text-slate-600 mb-2">Pilihan Jawaban (A, B, C, D)</label>
                <div className="space-y-2">
                  {formOptions.map((opt, optIdx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">
                        {opt.id}
                      </span>
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={e => {
                          const newOpts = [...formOptions];
                          newOpts[optIdx].text = e.target.value;
                          setFormOptions(newOpts);
                        }}
                        placeholder={`Isi pilihan ${opt.id}...`}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Kunci Jawaban */}
              <div>
                <label className="block font-bold text-slate-600 mb-1">Kunci Jawaban Benar</label>
                <div className="flex gap-3">
                  {['A', 'B', 'C', 'D'].map(key => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormCorrectKey(key)}
                      className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                        formCorrectKey === key
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Opsi {key}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pembahasan & Sumber */}
              <div>
                <label className="block font-bold text-slate-600 mb-1">Pembahasan / Penjelasan Jawaban</label>
                <textarea
                  rows={3}
                  value={formExplanation}
                  onChange={e => setFormExplanation(e.target.value)}
                  placeholder="Tuliskan pembahasan detail jawaban yang benar..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Sumber Referensi Soal</label>
                <input
                  type="text"
                  value={formSource}
                  onChange={e => setFormSource(e.target.value)}
                  placeholder="Contoh: Buku Siswa Informatika 9 / Olimpiade"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan ke Bank Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
