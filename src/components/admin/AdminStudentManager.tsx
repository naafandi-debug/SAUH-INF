import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { parseCSV, downloadCSV } from '../../utils/exportHelpers';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  FileSpreadsheet, 
  Sparkles,
  X
} from 'lucide-react';

export const AdminStudentManager: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, importStudents, resetStudentsToOfficialList } = useApp();

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [formNISN, setFormNISN] = useState<string>('');
  const [formNIS, setFormNIS] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formClass, setFormClass] = useState<string>('9A');
  const [formRombel, setFormRombel] = useState<string>('9A-1');

  // Import states
  const [importText, setImportText] = useState<string>('');
  const [importToast, setImportToast] = useState<string>('');

  const classList = useMemo(() => {
    const cls = Array.from(new Set(students.map(s => s.className))).sort();
    return cls.length > 0 ? cls : ['9A', '9B', '9C', '9D', '9E', '9F', '9G'];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchClass = selectedClass === 'all' || s.className === selectedClass;
      const matchSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.includes(searchQuery) ||
        s.nis.includes(searchQuery);
      return matchClass && matchSearch;
    });
  }, [students, selectedClass, searchQuery]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormNISN(`008123${Math.floor(1000 + Math.random() * 9000)}`);
    setFormNIS(`9${Math.floor(100 + Math.random() * 900)}`);
    setFormName('');
    setFormClass('9A');
    setFormRombel('9A-1');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setFormNISN(s.nisn);
    setFormNIS(s.nis);
    setFormName(s.name);
    setFormClass(s.className);
    setFormRombel(s.rombel || `${s.className}-1`);
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formNISN.trim()) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        nisn: formNISN,
        nis: formNIS,
        name: formName,
        className: formClass,
        rombel: formRombel
      });
    } else {
      addStudent({
        nisn: formNISN,
        nis: formNIS,
        name: formName,
        className: formClass,
        rombel: formRombel
      });
    }
    setIsModalOpen(false);
  };

  const handleDownloadTemplate = () => {
    const headers = ['NISN', 'NIS', 'Nama', 'Kelas', 'Rombel'];
    const sample = [
      ['0012345678', '1001', 'Ahmad Faiz Ramadhan', '9A', '9A-1'],
      ['0012345679', '1002', 'Budi Santoso', '9A', '9A-1'],
      ['0012345680', '1003', 'Citra Dewi Lestari', '9B', '9B-1']
    ];
    downloadCSV('Template_Data_Siswa_Kelas9.csv', sample, headers);
  };

  const handleProcessImport = () => {
    if (!importText.trim()) return;
    const rows = parseCSV(importText);
    if (rows.length < 2) return;

    const dataRows = rows.slice(1);
    const newStudents: Student[] = dataRows.map((r, idx) => ({
      id: `IMP_S_${Date.now()}_${idx + 1}`,
      nisn: r[0]?.trim() || `008123${idx}`,
      nis: r[1]?.trim() || `9${idx}`,
      name: r[2]?.trim() || `Siswa Baru ${idx + 1}`,
      className: r[3]?.trim() || '9A',
      rombel: r[4]?.trim() || `${r[3] || '9A'}-1`
    }));

    importStudents(newStudents);
    setImportToast(`Berhasil mengimpor ${newStudents.length} siswa!`);
    setIsImportModalOpen(false);
    setImportText('');
  };

  const handleGenerateBenchmarkStudents = (count: number = 667) => {
    const generated: Student[] = [];
    const classes = ['9A', '9B', '9C', '9D', '9E', '9F', '9G', '9H'];
    const sampleNames = ['Aditya', 'Bagas', 'Cahya', 'Dimas', 'Erlangga', 'Fajar', 'Galih', 'Hendra', 'Irfan', 'Julian', 'Karisma', 'Lestari', 'Maulana', 'Nadya', 'Oki', 'Putri', 'Qori', 'Rizky', 'Syifa', 'Tegar', 'Utami', 'Vina', 'Wahyu', 'Yusuf', 'Zahra'];

    for (let i = 1; i <= count; i++) {
      const cls = classes[i % classes.length];
      const fn = sampleNames[(i * 3) % sampleNames.length];
      const ln = sampleNames[(i * 7) % sampleNames.length];
      generated.push({
        id: `GEN_S_${i}`,
        nisn: `008${String(1000000 + i).slice(1)}`,
        nis: `9${String(1000 + i).slice(1)}`,
        name: `${fn} ${ln} #${i}`,
        className: cls,
        rombel: `${cls}-1`
      });
    }

    importStudents(generated);
    setImportToast(`Berhasil menambahkan dataset pengujian ${count} siswa (Sesuai target PRD).`);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'NISN', 'NIS', 'Nama Siswa', 'Kelas', 'Rombel'];
    const rows = filteredStudents.map(s => [s.id, s.nisn, s.nis, s.name, s.className, s.rombel || '']);
    downloadCSV(`Data_Siswa_Kelas_9_${Date.now()}.csv`, rows, headers);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Manajemen Data Siswa ({students.length} Terdaftar)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola daftar siswa kelas 9, impor data via Excel/CSV, dan kelompokkan berdasarkan kelas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={async () => {
              if (window.confirm('Muat ulang seluruh data 220 Siswa Resmi Kelas 9A - 9G dari berkas database?')) {
                await resetStudentsToOfficialList();
                setImportToast('Berhasil memuat 220 Siswa Resmi Kelas 9A - 9G!');
              }
            }}
            className="py-2.5 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Muat 220 Siswa Resmi (9A-9G)
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </button>
          <button
            onClick={handleExportCSV}
            className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {importToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{importToast}</span>
          </div>
          <button onClick={() => setImportToast('')} className="p-1 hover:bg-emerald-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <input
            type="text"
            placeholder="Cari berdasarkan nama lengkap, NISN, atau NIS..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="all">Semua Kelas ({students.length} Siswa)</option>
            {classList.map(c => (
              <option key={c} value={c}>
                Kelas {c} ({students.filter(s => s.className === c).length} Siswa)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5">Nama Lengkap</th>
                <th className="p-3.5 font-mono">NISN</th>
                <th className="p-3.5 font-mono">NIS</th>
                <th className="p-3.5">Kelas</th>
                <th className="p-3.5">Rombel</th>
                <th className="p-3.5 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((std, idx) => (
                <tr key={std.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                  <td className="p-3.5 font-bold text-slate-900">{std.name}</td>
                  <td className="p-3.5 font-mono text-slate-600">{std.nisn}</td>
                  <td className="p-3.5 font-mono text-slate-600">{std.nis}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-100">
                      Kelas {std.className}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">{std.rombel || '-'}</td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        title="Edit Siswa"
                        onClick={() => handleOpenEdit(std)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Hapus Siswa"
                        onClick={() => deleteStudent(std.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-sm">
            Tidak ada data siswa yang cocok dengan kriteria pencarian.
          </div>
        )}
      </div>

      {/* Modal Add/Edit Student */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Contoh: Ahmad Faiz Ramadhan"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">NISN (10 Digit)</label>
                  <input
                    type="text"
                    required
                    value={formNISN}
                    onChange={e => setFormNISN(e.target.value)}
                    placeholder="0081234501"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">NIS Sekolah</label>
                  <input
                    type="text"
                    required
                    value={formNIS}
                    onChange={e => setFormNIS(e.target.value)}
                    placeholder="9001"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Kelas</label>
                  <input
                    type="text"
                    required
                    value={formClass}
                    onChange={e => setFormClass(e.target.value)}
                    placeholder="9A"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Rombel</label>
                  <input
                    type="text"
                    value={formRombel}
                    onChange={e => setFormRombel(e.target.value)}
                    placeholder="9A-1"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Excel/CSV */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Import Data Siswa Massal (.CSV)
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl text-xs">
              <span className="text-slate-600">Gunakan format kolom: NISN, NIS, Nama, Kelas, Rombel</span>
              <button
                onClick={handleDownloadTemplate}
                className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Unduh Template
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tempel (Paste) Teks CSV Siswa di Sini
              </label>
              <textarea
                rows={6}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder={`NISN,NIS,Nama,Kelas,Rombel\n0012345678,1001,Ahmad Faiz,9A,9A-1\n0012345679,1002,Budi Santoso,9A,9A-1`}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessImport}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                Impor Data Siswa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
