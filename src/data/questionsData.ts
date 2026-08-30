import { Question } from '../types';

export const INITIAL_QUESTIONS: Question[] = [
  // ==========================================
  // MATERI 1: STRUKTUR DATA (LIFO, FIFO, STACK, QUEUE, ARRAY, TREE, GRAPH) - 20 SOAL
  // ==========================================
  {
    id: 'Q001',
    question: 'Struktur data linier yang bekerja dengan prinsip First-In First-Out (FIFO) adalah...',
    options: [
      { id: 'A', text: 'Stack (Tumpukan)' },
      { id: 'B', text: 'Queue (Antrean)' },
      { id: 'C', text: 'Binary Tree' },
      { id: 'D', text: 'Graph' }
    ],
    correctOptionId: 'B',
    material: 'Struktur Data',
    submaterial: 'Queue & FIFO',
    difficulty: 'Mudah',
    explanation: 'Queue (antrean) menerapkan prinsip FIFO (First In First Out), artinya elemen yang pertama kali dimasukkan adalah yang pertama kali dikeluarkan.',
    source: 'Buku Informatika SMP Kelas 9',
    status: 'active'
  },
  {
    id: 'Q002',
    question: 'Prinsip kerja LIFO (Last-In First-Out) pada struktur data bermakna bahwa...',
    options: [
      { id: 'A', text: 'Data yang pertama masuk akan diproses paling pertama' },
      { id: 'B', text: 'Data yang terakhir masuk akan diproses paling pertama' },
      { id: 'C', text: 'Data diacak secara acak sebelum diproses' },
      { id: 'D', text: 'Data diproses berdasarkan urutan abjad' }
    ],
    correctOptionId: 'B',
    material: 'Struktur Data',
    submaterial: 'Stack & LIFO',
    difficulty: 'Mudah',
    explanation: 'LIFO (Last In First Out) berarti data yang paling akhir (terakhir) dimasukkan ke dalam struktur akan menjadi data pertama yang dikeluarkan/diambil.',
    source: 'Buku Informatika SMP Kelas 9',
    status: 'active'
  },
  {
    id: 'Q003',
    question: 'Operasi untuk memasukkan elemen baru ke bagian atas (top) sebuah Stack disebut...',
    options: [
      { id: 'A', text: 'Pop' },
      { id: 'B', text: 'Push' },
      { id: 'C', text: 'Enqueue' },
      { id: 'D', text: 'Dequeue' }
    ],
    correctOptionId: 'B',
    material: 'Struktur Data',
    submaterial: 'Stack & LIFO',
    difficulty: 'Mudah',
    explanation: 'Pada struktur data Stack, operasi "Push" digunakan untuk menyisipkan/menambahkan elemen baru ke puncak tumpukan, sedangkan "Pop" digunakan untuk menghapus/mengambilnya.',
    source: 'Kurikulum Merdeka Informatika 9',
    status: 'active'
  },
  {
    id: 'Q004',
    question: 'Operasi untuk mengeluarkan atau menghapus elemen dari bagian depan sebuah Queue disebut...',
    options: [
      { id: 'A', text: 'Push' },
      { id: 'B', text: 'Pop' },
      { id: 'C', text: 'Enqueue' },
      { id: 'D', text: 'Dequeue' }
    ],
    correctOptionId: 'D',
    material: 'Struktur Data',
    submaterial: 'Queue & FIFO',
    difficulty: 'Mudah',
    explanation: 'Operasi "Dequeue" menghapus elemen di bagian depan (front) antrean, sedangkan "Enqueue" menambahkan elemen baru di bagian belakang (rear).',
    source: 'Kurikulum Merdeka Informatika 9',
    status: 'active'
  },
  {
    id: 'Q005',
    question: 'Dalam aplikasi pengolah kata seperti Microsoft Word, fitur "Undo" (Ctrl+Z) dan "Redo" mengimplementasikan struktur data...',
    options: [
      { id: 'A', text: 'Queue' },
      { id: 'B', text: 'Stack' },
      { id: 'C', text: 'Graph' },
      { id: 'D', text: 'Binary Search Tree' }
    ],
    correctOptionId: 'B',
    material: 'Struktur Data',
    submaterial: 'Stack & LIFO',
    difficulty: 'Sedang',
    explanation: 'Fitur Undo membatalkan perintah terakhir yang baru saja dieksekusi pengguna. Karena perintah terakhir yang pertama dibatalkan, mekanisme ini bekerja secara LIFO menggunakan Stack.',
    source: 'Penerapan Struktur Data Sehari-hari',
    status: 'active'
  },
  {
    id: 'Q006',
    question: 'Antrean pencetakan dokumen pada printer (Print Spooler) melayani dokumen berdasarkan urutan kedatangan. Ini merupakan contoh penerapan...',
    options: [
      { id: 'A', text: 'Stack (LIFO)' },
      { id: 'B', text: 'Queue (FIFO)' },
      { id: 'C', text: 'Tree' },
      { id: 'D', text: 'Hash Table' }
    ],
    correctOptionId: 'B',
    material: 'Struktur Data',
    submaterial: 'Queue & FIFO',
    difficulty: 'Mudah',
    explanation: 'Print spooler mencetak dokumen yang paling pertama dikirim oleh pengguna (FIFO), sehingga menggunakan struktur data Queue.',
    source: 'Penerapan Struktur Data Sehari-hari',
    status: 'active'
  },
  {
    id: 'Q007',
    question: 'Diberikan tumpukan kosong (Stack). Dilakukan operasi berturut-turut: Push(10), Push(20), Push(30), Pop(), Push(40). Elemen yang berada di posisi teratas tumpukan saat ini adalah...',
    options: [
      { id: 'A', text: '10' },
      { id: 'B', text: '20' },
      { id: 'C', text: '30' },
      { id: 'D', text: '40' }
    ],
    correctOptionId: 'D',
    material: 'Struktur Data',
    submaterial: 'Stack & LIFO',
    difficulty: 'Sedang',
    explanation: 'Langkah simulasi:\n1. Push(10) -> [10]\n2. Push(20) -> [10, 20]\n3. Push(30) -> [10, 20, 30]\n4. Pop() -> mengeluarkan 30, tumpukan menjadi [10, 20]\n5. Push(40) -> [10, 20, 40]\nElemen puncak teratas adalah 40.',
    source: 'Soal Evaluasi Logika Komputasi',
    status: 'active'
  },
  {
    id: 'Q008',
    question: 'Sebuah antrean (Queue) mula-mula kosong. Dilakukan operasi: Enqueue("A"), Enqueue("B"), Dequeue(), Enqueue("C"), Enqueue("D"), Dequeue(). Elemen yang tersisa di dalam antrean dari depan ke belakang adalah...',
    options: [
      { id: 'A', text: '"A" dan "B"' },
      { id: 'B', text: '"B" dan "C"' },
      { id: 'C', text: '"C" dan "D"' },
      { id: 'D', text: '"D" dan "C"' }
    ],
    correctOptionId: 'C',
    material: 'Struktur Data',
    submaterial: 'Queue & FIFO',
    difficulty: 'Sedang',
    explanation: 'Simulasi:\n1. Enqueue(A) -> [A]\n2. Enqueue(B) -> [A, B]\n3. Dequeue() -> mengeluarkan A, sisa [B]\n4. Enqueue(C) -> [B, C]\n5. Enqueue(D) -> [B, C, D]\n6. Dequeue() -> mengeluarkan B, sisa [C, D].',
    source: 'Soal Latihan Pemrograman Dasar',
    status: 'active'
  },
  {
    id: 'Q009',
    question: 'Fitur tombol "Back" (Kembali) pada web browser untuk membuka halaman web yang sebelumnya dikunjungi memanfaatkan konsep struktur data...',
    options: [
      { id: 'A', text: 'Stack' },
      { id: 'B', text: 'Queue' },
      { id: 'C', text: 'Array 2 Dimensi' },
      { id: 'D', text: 'Graph Berarah' }
    ],
    correctOptionId: 'A',
    material: 'Struktur Data',
    submaterial: 'Stack & LIFO',
    difficulty: 'Mudah',
    explanation: 'Riwayat URL yang dikunjungi disimpan dalam Stack. Saat menekan tombol Back, browser mem-pop URL terakhir untuk kembali ke halaman sebelumnya.',
    source: 'Aplikasi Komputasi Kelas 9',
    status: 'active'
  },
  {
    id: 'Q010',
    question: 'Kondisi error di mana kita mencoba melakukan operasi "Pop" pada Stack yang tidak memiliki elemen (kosong) disebut...',
    options: [
      { id: 'A', text: 'Stack Overflow' },
      { id: 'B', text: 'Stack Underflow' },
      { id: 'C', text: 'Out of Memory' },
      { id: 'D', text: 'Null Pointer Exception' }
    ],
    correctOptionId: 'B',
    material: 'Struktur Data',
    submaterial: 'Stack & LIFO',
    difficulty: 'Sedang',
    explanation: 'Stack Underflow terjadi jika program mencoba mengambil (Pop) data dari tumpukan yang kosong. Sebaliknya, Stack Overflow terjadi saat menambah data ke tumpukan yang kapasitas memorinya sudah penuh.',
    source: 'Dasar Pemrograman Komputer',
    status: 'active'
  },
  {
    id: 'Q011',
    question: 'Struktur data non-linier yang memiliki simpul utama (akar/root), cabang (edge), dan daun (leaf) tanpa membentuk siklus adalah...',
    options: [
      { id: 'A', text: 'Array' },
      { id: 'B', text: 'Queue' },
      { id: 'C', text: 'Tree (Pohon)' },
      { id: 'D', text: 'Stack' }
    ],
    correctOptionId: 'C',
    material: 'Struktur Data',
    submaterial: 'Tree & Graph',
    difficulty: 'Mudah',
    explanation: 'Tree adalah struktur data hierarkis non-linier yang terdiri dari simpul akar (root), simpul anak (child nodes), dan simpul daun (leaf nodes).',
    source: 'Informatika SMP Bab 1',
    status: 'active'
  },
  {
    id: 'Q012',
    question: 'Struktur direktori folder dan file pada sistem operasi komputer (seperti File Explorer di Windows) paling tepat direpresentasikan menggunakan struktur data...',
    options: [
      { id: 'A', text: 'Queue' },
      { id: 'B', text: 'Tree' },
      { id: 'C', text: 'Stack' },
      { id: 'D', text: 'Array 1 Dimensi' }
    ],
    correctOptionId: 'B',
    material: 'Struktur Data',
    submaterial: 'Tree & Graph',
    difficulty: 'Mudah',
    explanation: 'Direktori komputer tersusun hierarkis (Drive C: sebagai root, berakar ke folder-folder, subfolder, hingga file sebagai leaf), yang mencerminkan struktur Tree.',
    source: 'Informatika SMP Bab 1',
    status: 'active'
  },
  {
    id: 'Q013',
    question: 'Struktur data yang terdiri dari kumpulan simpul (vertex/node) yang dihubungkan oleh sisi (edge) dan dapat memuat jalur sirkuler/siklus adalah...',
    options: [
      { id: 'A', text: 'Graph (Graf)' },
      { id: 'B', text: 'Stack' },
      { id: 'C', text: 'Queue' },
      { id: 'D', text: 'Linear Array' }
    ],
    correctOptionId: 'A',
    material: 'Struktur Data',
    submaterial: 'Tree & Graph',
    difficulty: 'Mudah',
    explanation: 'Graph terdiri dari simpul (vertex) dan garis penghubung (edge), serta memungkinkan hubungan majemuk dan siklus antar simpul.',
    source: 'Informatika SMP Bab 1',
    status: 'active'
  },
  {
    id: 'Q014',
    question: 'Aplikasi peta digital seperti Google Maps yang memodelkan persimpangan jalan sebagai simpul dan ruas jalan sebagai penghubung untuk mencari rute terpendek menggunakan konsep struktur data...',
    options: [
      { id: 'A', text: 'Stack' },
      { id: 'B', text: 'Queue' },
      { id: 'C', text: 'Graph' },
      { id: 'D', text: 'Array' }
    ],
    correctOptionId: 'C',
    material: 'Struktur Data',
    submaterial: 'Tree & Graph',
    difficulty: 'Sedang',
    explanation: 'Jaringan jalan raya, rute penerbangan, dan jaringan sosial dimodelkan dengan struktur data Graph dengan bobot jarak/waktu pada sisinya.',
    source: 'Penerapan Struktur Data Sehari-hari',
    status: 'active'
  },
  {
    id: 'Q015',
    question: 'Kumpulan elemen data dengan tipe data yang sama yang disimpan dalam lokasi memori berurutan dan diakses melalui nomor indeks disebut...',
    options: [
      { id: 'A', text: 'Array (Larik)' },
      { id: 'B', text: 'Graph' },
      { id: 'C', text: 'Tree' },
      { id: 'D', text: 'Queue' }
    ],
    correctOptionId: 'A',
    material: 'Struktur Data',
    submaterial: 'Array & List',
    difficulty: 'Mudah',
    explanation: 'Array adalah struktur data linier yang menyimpan sekumpulan data bertipe sama secara berurutan dalam memori dengan pengindeksan (umumnya dimulai dari indeks 0).',
    source: 'Informatika SMP Bab 1',
    status: 'active'
  },
  {
    id: 'Q016',
    question: 'Jika sebuah Array bernama `Nilai` dideklarasikan dengan ukuran 5 elemen, maka indeks untuk elemen ke-4 (dengan indeks berbasis 0) adalah...',
    options: [
      { id: 'A', text: 'Nilai[4]' },
      { id: 'B', text: 'Nilai[3]' },
      { id: 'C', text: 'Nilai[5]' },
      { id: 'D', text: 'Nilai[2]' }
    ],
    correctOptionId: 'B',
    material: 'Struktur Data',
    submaterial: 'Array & List',
    difficulty: 'Sedang',
    explanation: 'Dengan 0-based indexing: Elemen 1 = [0], Elemen 2 = [1], Elemen 3 = [2], Elemen 4 = [3], Elemen 5 = [4]. Jadi elemen ke-4 berada pada indeks 3.',
    source: 'Dasar Pemrograman Komputer',
    status: 'active'
  },
  {
    id: 'Q017',
    question: 'Manakah dari situasi di dunia nyata berikut yang paling tepat menggambarkan mekanisme kerja LIFO?',
    options: [
      { id: 'A', text: 'Antrean kendaraan di gerbang tol otomatis' },
      { id: 'B', text: 'Tumpukan piring bersih di atas meja prasmanan' },
      { id: 'C', text: 'Pelanggan yang membeli tiket di loket bioskop' },
      { id: 'D', text: 'Panggilan telepon di call center customer service' }
    ],
    correctOptionId: 'B',
    material: 'Struktur Data',
    submaterial: 'Stack & LIFO',
    difficulty: 'Mudah',
    explanation: 'Tumpukan piring prasmanan adalah contoh LIFO: piring yang paling terakhir ditaruh di atas tumpukan adalah piring yang pertama kali diambil oleh tamu.',
    source: 'Buku Siswa Informatika SMP',
    status: 'active'
  },
  {
    id: 'Q018',
    question: 'Manakah dari situasi berikut yang paling tepat memodelkan struktur data Queue (FIFO)?',
    options: [
      { id: 'A', text: 'Tumpukan buku di dalam kardus sempit' },
      { id: 'B', text: 'Antrean pasien pendaftaran di poliklinik rumah sakit' },
      { id: 'C', text: 'Peluru di dalam magazin senjata' },
      { id: 'D', text: 'Fitur undo pada aplikasi pengeditan foto' }
    ],
    correctOptionId: 'B',
    material: 'Struktur Data',
    submaterial: 'Queue & FIFO',
    difficulty: 'Mudah',
    explanation: 'Antrean pasien di rumah sakit memprioritaskan pasien yang datang paling awal untuk dilayani terlebih dahulu (First-Come, First-Served / FIFO).',
    source: 'Buku Siswa Informatika SMP',
    status: 'active'
  },
  {
    id: 'Q019',
    question: 'Pada struktur pohon biner (Binary Tree), jumlah maksimum anak (children) yang dapat dimiliki oleh setiap simpul adalah...',
    options: [
      { id: 'A', text: '1 anak' },
      { id: 'B', text: '2 anak' },
      { id: 'C', text: '3 anak' },
      { id: 'D', text: 'Tidak terbatas' }
    ],
    correctOptionId: 'B',
    material: 'Struktur Data',
    submaterial: 'Tree & Graph',
    difficulty: 'Mudah',
    explanation: 'Binary Tree (Pohon Biner) secara definisi membatasi setiap simpul orang tua (parent) untuk memiliki paling banyak 2 anak (disebut left child dan right child).',
    source: 'Struktur Data Lanjut',
    status: 'active'
  },
  {
    id: 'Q020',
    question: 'Ketika kita mengevaluasi ekspresi matematika berformat postfix seperti "5 3 + 2 *", struktur data yang paling efektif digunakan oleh komputer adalah...',
    options: [
      { id: 'A', text: 'Queue' },
      { id: 'B', text: 'Stack' },
      { id: 'C', text: 'Graph' },
      { id: 'D', text: 'Tree tak berakar' }
    ],
    correctOptionId: 'B',
    material: 'Struktur Data',
    submaterial: 'Stack & LIFO',
    difficulty: 'Sulit',
    explanation: 'Evaluasi notasi postfix menggunakan Stack: operand (angka) di-push ke stack, dan ketika operator ditemukan (+, *), dua operand teratas di-pop untuk dihitung hasilnya lalu di-push kembali.',
    source: 'Olimpiade Informatika SMP',
    status: 'active'
  },

  // ==========================================
  // MATERI 2: GERBANG LOGIKA & LOGIKA INFORMATIKA (AND, OR, NOT, XOR, NAND, NOR, XNOR, TABEL KEBENARAN) - 22 SOAL
  // ==========================================
  {
    id: 'Q021',
    question: 'Gerbang logika yang hanya menghasilkan output bernilai 1 (TRUE) jika SEMUA input bernilai 1 (TRUE) adalah gerbang...',
    options: [
      { id: 'A', text: 'OR' },
      { id: 'B', text: 'AND' },
      { id: 'C', text: 'XOR' },
      { id: 'D', text: 'NOT' }
    ],
    correctOptionId: 'B',
    material: 'Logika Informatika',
    submaterial: 'Gerbang Logika Dasar',
    difficulty: 'Mudah',
    explanation: 'Gerbang AND menghasilkan keluaran bernilai 1 (TRUE) hanya apabila seluruh sinyal masukan bernilai 1. Jika ada satu saja yang 0, maka hasilnya 0.',
    source: 'Logika Informatika Kelas 9',
    status: 'active'
  },
  {
    id: 'Q022',
    question: 'Gerbang logika yang menghasilkan output bernilai 1 (TRUE) jika SALAH SATU atau KEDUA input bernilai 1 (TRUE) adalah gerbang...',
    options: [
      { id: 'A', text: 'AND' },
      { id: 'B', text: 'OR' },
      { id: 'C', text: 'NAND' },
      { id: 'D', text: 'NOR' }
    ],
    correctOptionId: 'B',
    material: 'Logika Informatika',
    submaterial: 'Gerbang Logika Dasar',
    difficulty: 'Mudah',
    explanation: 'Gerbang OR menghasilkan keluaran bernilai 1 jika setidaknya salah satu input bernilai 1. Output hanya bernilai 0 jika semua input bernilai 0.',
    source: 'Logika Informatika Kelas 9',
    status: 'active'
  },
  {
    id: 'Q023',
    question: 'Gerbang NOT (Inverter) memiliki 1 input dan 1 output. Jika inputnya bernilai TRUE (1), maka outputnya adalah...',
    options: [
      { id: 'A', text: 'TRUE (1)' },
      { id: 'B', text: 'FALSE (0)' },
      { id: 'C', text: 'Tidak terdefinisi' },
      { id: 'D', text: '2' }
    ],
    correctOptionId: 'B',
    material: 'Logika Informatika',
    submaterial: 'Gerbang Logika Dasar',
    difficulty: 'Mudah',
    explanation: 'Gerbang NOT berfungsi membalikkan nilai logika input. Jika input bernilai 1 (TRUE), maka output menjadi 0 (FALSE).',
    source: 'Logika Informatika Kelas 9',
    status: 'active'
  },
  {
    id: 'Q024',
    question: 'Gerbang XOR (Exclusive OR) dengan dua input A dan B akan menghasilkan output 1 (TRUE) apabila...',
    options: [
      { id: 'A', text: 'Kedua input bernilai sama (keduanya 0 atau keduanya 1)' },
      { id: 'B', text: 'Kedua input bernilai berbeda (satu bernilai 0 dan yang lain 1)' },
      { id: 'C', text: 'Kedua input harus bernilai 0' },
      { id: 'D', text: 'Kedua input harus bernilai 1' }
    ],
    correctOptionId: 'B',
    material: 'Logika Informatika',
    submaterial: 'Gerbang Logika Dasar',
    difficulty: 'Sedang',
    explanation: 'XOR (Exclusive OR) menghasilkan output 1 jika kedua sinyal input memiliki nilai yang berlainan/berbeda (0 XOR 1 = 1, 1 XOR 0 = 1). Jika inputnya sama, outputnya 0.',
    source: 'Logika Informatika Kelas 9',
    status: 'active'
  },
  {
    id: 'Q025',
    question: 'Diberikan nilai A = 1 dan B = 0. Berapakah hasil dari operasi logika `A AND B`?',
    options: [
      { id: 'A', text: '1 (TRUE)' },
      { id: 'B', text: '0 (FALSE)' },
      { id: 'C', text: 'Error' },
      { id: 'D', text: '10' }
    ],
    correctOptionId: 'B',
    material: 'Logika Informatika',
    submaterial: 'Tabel Kebenaran & Aljabar Boolean',
    difficulty: 'Mudah',
    explanation: 'Pada gerbang AND: 1 AND 0 menghasilkan 0 (FALSE), karena salah satu inputnya bernilai 0.',
    source: 'Evaluasi Logika Komputasi',
    status: 'active'
  },
  {
    id: 'Q026',
    question: 'Diberikan nilai A = 0 dan B = 1. Berapakah hasil dari operasi logika `A OR B`?',
    options: [
      { id: 'A', text: '1 (TRUE)' },
      { id: 'B', text: '0 (FALSE)' },
      { id: 'C', text: 'Null' },
      { id: 'D', text: '-1' }
    ],
    correctOptionId: 'A',
    material: 'Logika Informatika',
    submaterial: 'Tabel Kebenaran & Aljabar Boolean',
    difficulty: 'Mudah',
    explanation: 'Pada gerbang OR: 0 OR 1 menghasilkan 1 (TRUE), karena salah satu input bernilai 1.',
    source: 'Evaluasi Logika Komputasi',
    status: 'active'
  },
  {
    id: 'Q027',
    question: 'Diberikan nilai A = 1 dan B = 1. Berapakah hasil dari operasi `A XOR B`?',
    options: [
      { id: 'A', text: '1 (TRUE)' },
      { id: 'B', text: '0 (FALSE)' },
      { id: 'C', text: '2' },
      { id: 'D', text: 'Tidak diketahui' }
    ],
    correctOptionId: 'B',
    material: 'Logika Informatika',
    submaterial: 'Tabel Kebenaran & Aljabar Boolean',
    difficulty: 'Sedang',
    explanation: 'Pada gerbang XOR: jika kedua input bernilai sama (1 dan 1), maka outputnya adalah 0 (FALSE).',
    source: 'Evaluasi Logika Komputasi',
    status: 'active'
  },
  {
    id: 'Q028',
    question: 'Gerbang NAND merupakan kombinasi dari dua gerbang, yaitu...',
    options: [
      { id: 'A', text: 'Gerbang NOT yang diikuti oleh gerbang AND' },
      { id: 'B', text: 'Gerbang AND yang outputnya disambungkan ke gerbang NOT' },
      { id: 'C', text: 'Gerbang OR yang disambungkan ke gerbang NOT' },
      { id: 'D', text: 'Gerbang XOR yang disambungkan ke gerbang AND' }
    ],
    correctOptionId: 'B',
    material: 'Logika Informatika',
    submaterial: 'Gerbang Logika Dasar',
    difficulty: 'Sedang',
    explanation: 'NAND adalah kependekan dari NOT AND. Artinya, output dari gerbang AND dibalikkan (inversi) oleh gerbang NOT.',
    source: 'Sistem Komputer Kelas 9',
    status: 'active'
  },
  {
    id: 'Q029',
    question: 'Tabel kebenaran untuk gerbang NAND dengan input A dan B akan menghasilkan output 0 (FALSE) hanya pada saat...',
    options: [
      { id: 'A', text: 'A = 0 dan B = 0' },
      { id: 'B', text: 'A = 0 dan B = 1' },
      { id: 'C', text: 'A = 1 dan B = 0' },
      { id: 'D', text: 'A = 1 dan B = 1' }
    ],
    correctOptionId: 'D',
    material: 'Logika Informatika',
    submaterial: 'Tabel Kebenaran & Aljabar Boolean',
    difficulty: 'Sedang',
    explanation: 'Pada gerbang AND, output 1 hanya saat A=1 dan B=1. Karena NAND membalikkan hasil AND, maka NAND menghasilkan 0 hanya ketika A=1 dan B=1.',
    source: 'Sistem Komputer Kelas 9',
    status: 'active'
  },
  {
    id: 'Q030',
    question: 'Gerbang NOR menghasilkan keluaran bernilai 1 (TRUE) hanya jika...',
    options: [
      { id: 'A', text: 'Semua input bernilai 0 (FALSE)' },
      { id: 'B', text: 'Semua input bernilai 1 (TRUE)' },
      { id: 'C', text: 'Salah satu input bernilai 1' },
      { id: 'D', text: 'Input A dan B bernilai berlawanan' }
    ],
    correctOptionId: 'A',
    material: 'Logika Informatika',
    submaterial: 'Gerbang Logika Dasar',
    difficulty: 'Sedang',
    explanation: 'Gerbang NOR (NOT OR) membalikkan hasil OR. OR bernilai 0 jika kedua input 0, maka NOR menghasilkan 1 hanya jika kedua input bernilai 0.',
    source: 'Sistem Komputer Kelas 9',
    status: 'active'
  },
  {
    id: 'Q031',
    question: 'Hitunglah nilai dari ekspresi logika: `NOT ( (1 AND 0) OR (1 AND 1) )`',
    options: [
      { id: 'A', text: '1 (TRUE)' },
      { id: 'B', text: '0 (FALSE)' },
      { id: 'C', text: 'Error Sintaks' },
      { id: 'D', text: '2' }
    ],
    correctOptionId: 'B',
    material: 'Logika Informatika',
    submaterial: 'Kombinasi Logika & Aplikasi',
    difficulty: 'Sedang',
    explanation: 'Langkah pengerjaan:\n1. (1 AND 0) = 0\n2. (1 AND 1) = 1\n3. (0 OR 1) = 1\n4. NOT (1) = 0.\nJadi hasilnya adalah 0 (FALSE).',
    source: 'Soal Pengayaan Logika SMP',
    status: 'active'
  },
  {
    id: 'Q032',
    question: 'Sebuah sistem alarm pintu brankas dirancang dengan aturan: "Alarm akan berbunyi (1) jika Kunci Utama diaktifkan (A=1) DAN Sensor Gerak mendeteksi orang (B=1)". Rangkaian gerbang logika yang sesuai adalah...',
    options: [
      { id: 'A', text: 'Gerbang OR' },
      { id: 'B', text: 'Gerbang AND' },
      { id: 'C', text: 'Gerbang NOT' },
      { id: 'D', text: 'Gerbang XOR' }
    ],
    correctOptionId: 'B',
    material: 'Logika Informatika',
    submaterial: 'Kombinasi Logika & Aplikasi',
    difficulty: 'Mudah',
    explanation: 'Kata hubung "DAN" yang mensyaratkan kedua kondisi terpenuhi sekaligus untuk menghasilkan output aktif (1) merepresentasikan gerbang logika AND.',
    source: 'Penerapan Logika Informatika',
    status: 'active'
  },
  {
    id: 'Q033',
    question: 'Lampu tangga dapat dinyalakan atau dimatikan dari saklar bawah maupun saklar atas. Mengubah posisi salah satu saklar selalu membalikkan status lampu (dari mati jadi nyala atau sebaliknya). Rangkaian saklar tangga ini mengadopsi prinsip gerbang...',
    options: [
      { id: 'A', text: 'AND' },
      { id: 'B', text: 'XOR (Exclusive OR)' },
      { id: 'C', text: 'NAND' },
      { id: 'D', text: 'NOT' }
    ],
    correctOptionId: 'B',
    material: 'Logika Informatika',
    submaterial: 'Kombinasi Logika & Aplikasi',
    difficulty: 'Sedang',
    explanation: 'Rangkaian saklar tukar (hotel/tangga dua arah) bekerja seperti gerbang XOR: ketika kedua saklar berada pada posisi yang berbeda (0,1 atau 1,0), sirkuit terhubung/nyala.',
    source: 'Penerapan Logika Informatika',
    status: 'active'
  },
  {
    id: 'Q034',
    question: 'Berapa banyak kemungkinan kombinasi baris input pada tabel kebenaran yang memiliki 3 buah variabel input (misalnya A, B, dan C)?',
    options: [
      { id: 'A', text: '3 baris' },
      { id: 'B', text: '6 baris' },
      { id: 'C', text: '8 baris' },
      { id: 'D', text: '9 baris' }
    ],
    correctOptionId: 'C',
    material: 'Logika Informatika',
    submaterial: 'Tabel Kebenaran & Aljabar Boolean',
    difficulty: 'Sedang',
    explanation: 'Jumlah kombinasi baris dalam tabel kebenaran dihitung dengan rumus 2^n, di mana n adalah jumlah variabel input. Untuk 3 variabel: 2^3 = 8 baris (000 hingga 111).',
    source: 'Dasar Logika Matematika',
    status: 'active'
  },
  {
    id: 'Q035',
    question: 'Hukum De Morgan dalam aljabar Boolean menyatakan bahwa ekspresi `NOT (A AND B)` ekuivalen (sama nilainya) dengan...',
    options: [
      { id: 'A', text: '(NOT A) OR (NOT B)' },
      { id: 'B', text: '(NOT A) AND (NOT B)' },
      { id: 'C', text: 'NOT A AND B' },
      { id: 'D', text: 'A OR B' }
    ],
    correctOptionId: 'A',
    material: 'Logika Informatika',
    submaterial: 'Tabel Kebenaran & Aljabar Boolean',
    difficulty: 'Sulit',
    explanation: 'Hukum De Morgan Pertama: NOT(A AND B) = (NOT A) OR (NOT B). Hukum De Morgan Kedua: NOT(A OR B) = (NOT A) AND (NOT B).',
    source: 'Aljabar Boolean & Rangkaian Digital',
    status: 'active'
  },
  {
    id: 'Q036',
    question: 'Dalam penulisan pemrograman, simbol operator logika untuk operasi AND, OR, dan NOT pada bahasa C++/Java/JavaScript berturut-turut adalah...',
    options: [
      { id: 'A', text: '&, |, ~' },
      { id: 'B', text: '&&, ||, !' },
      { id: 'C', text: 'AND, OR, NOT' },
      { id: 'D', text: '+, *, -' }
    ],
    correctOptionId: 'B',
    material: 'Logika Informatika',
    submaterial: 'Kombinasi Logika & Aplikasi',
    difficulty: 'Mudah',
    explanation: 'Operator logika dalam banyak bahasa pemrograman standar adalah: `&&` untuk AND, `||` untuk OR, dan `!` untuk NOT.',
    source: 'Informatika SMP Pemrograman',
    status: 'active'
  },
  {
    id: 'Q037',
    question: 'Jika ekspresi logika dalam bahasa pemrograman adalah: `(umur >= 15) AND (ada_izin == TRUE)`. Jika umur = 14 dan ada_izin = TRUE, maka hasil evaluasi kondisinya adalah...',
    options: [
      { id: 'A', text: 'TRUE' },
      { id: 'B', text: 'FALSE' },
      { id: 'C', text: '14' },
      { id: 'D', text: 'Null' }
    ],
    correctOptionId: 'B',
    material: 'Logika Informatika',
    submaterial: 'Kombinasi Logika & Aplikasi',
    difficulty: 'Mudah',
    explanation: 'Kondisi 1: (14 >= 15) adalah FALSE.\nKondisi 2: (TRUE == TRUE) adalah TRUE.\nOperasi: FALSE AND TRUE menghasilkan FALSE.',
    source: 'Logika Pemrograman Percabangan',
    status: 'active'
  },
  {
    id: 'Q038',
    question: 'Gerbang XNOR (Exclusive NOR) merupakan kebalikan dari gerbang XOR. Gerbang XNOR akan menghasilkan output 1 (TRUE) apabila...',
    options: [
      { id: 'A', text: 'Kedua input memiliki nilai logika yang sama' },
      { id: 'B', text: 'Kedua input memiliki nilai logika yang berbeda' },
      { id: 'C', text: 'Input A harus bernilai 1 dan B bernilai 0' },
      { id: 'D', text: 'Semua input harus selalu bernilai 0' }
    ],
    correctOptionId: 'A',
    material: 'Logika Informatika',
    submaterial: 'Gerbang Logika Dasar',
    difficulty: 'Sedang',
    explanation: 'Gerbang XNOR menghasilkan 1 jika nilai kedua inputnya sama (0 XNOR 0 = 1, dan 1 XNOR 1 = 1). Gerbang ini sering disebut gerbang komparator kesamaan sinyal.',
    source: 'Sistem Komputer Kelas 9',
    status: 'active'
  },
  {
    id: 'Q039',
    question: 'Diberikan tabel kebenaran suatu gerbang dengan 2 input: jika input (0,0)->1, (0,1)->0, (1,0)->0, (1,1)->0. Gerbang logika tersebut adalah...',
    options: [
      { id: 'A', text: 'AND' },
      { id: 'B', text: 'NAND' },
      { id: 'C', text: 'NOR' },
      { id: 'D', text: 'XOR' }
    ],
    correctOptionId: 'C',
    material: 'Logika Informatika',
    submaterial: 'Tabel Kebenaran & Aljabar Boolean',
    difficulty: 'Sedang',
    explanation: 'Gerbang yang menghasilkan output 1 hanya saat kedua input bernilai 0, dan bernilai 0 pada kondisi lainnya adalah gerbang NOR (NOT OR).',
    source: 'Evaluasi Logika Komputasi',
    status: 'active'
  },
  {
    id: 'Q040',
    question: 'Perhatikan pernyataan: "Sebuah mobil pintar hanya akan menyalakan wiper otomatis jika: (Sensor Hujan Aktif) AND (Saklar Wiper Nyala OR Kaca Berembun)". Jika Sensor Hujan Aktif (1), Saklar Wiper Mati (0), dan Kaca Berembun (1), apakah wiper akan menyala?',
    options: [
      { id: 'A', text: 'Ya, wiper menyala (Output 1)' },
      { id: 'B', text: 'Tidak, wiper mati (Output 0)' },
      { id: 'C', text: 'Terjadi korsleting' },
      { id: 'D', text: 'Kondisi tidak dapat dihitung' }
    ],
    correctOptionId: 'A',
    material: 'Logika Informatika',
    submaterial: 'Kombinasi Logika & Aplikasi',
    difficulty: 'Sulit',
    explanation: 'Sub-ekspresi 1: (Saklar Wiper Nyala OR Kaca Berembun) = (0 OR 1) = 1.\nEkspresi total: (Sensor Hujan Aktif) AND (1) = 1 AND 1 = 1 (Menyala).',
    source: 'Studi Kasus Sistem Tertanam Kelas 9',
    status: 'active'
  },
  {
    id: 'Q041',
    question: 'Pada sistem memori komputer, jenis struktur data yang digunakan oleh CPU untuk melacak urutan pemanggilan fungsi (Function Call Stack) dan variabel lokal adalah...',
    options: [
      { id: 'A', text: 'Queue' },
      { id: 'B', text: 'Call Stack (LIFO)' },
      { id: 'C', text: 'Graph Berarah' },
      { id: 'D', text: 'Doubly Linked List' }
    ],
    correctOptionId: 'B',
    material: 'Struktur Data',
    submaterial: 'Stack & LIFO',
    difficulty: 'Sedang',
    explanation: 'Ketika suatu fungsi memanggil fungsi lain (termasuk rekursi), alamat kembali dan variabel lokal disimpan dalam Call Stack secara LIFO.',
    source: 'Arsitektur Komputer SMP',
    status: 'active'
  },
  {
    id: 'Q042',
    question: 'Gerbang logika dasar yang hanya memerlukan 1 input terminal adalah...',
    options: [
      { id: 'A', text: 'AND' },
      { id: 'B', text: 'OR' },
      { id: 'C', text: 'NOT' },
      { id: 'D', text: 'XOR' }
    ],
    correctOptionId: 'C',
    material: 'Logika Informatika',
    submaterial: 'Gerbang Logika Dasar',
    difficulty: 'Mudah',
    explanation: 'Gerbang NOT (Inverter) hanya mempunyai satu terminal masukan dan satu terminal keluaran.',
    source: 'Sistem Komputer Kelas 9',
    status: 'active'
  }
];

import { OFFICIAL_STUDENTS } from './studentsData';

export const INITIAL_STUDENTS = OFFICIAL_STUDENTS;

export const INITIAL_EXAMS = [
  {
    id: 'EXAM-UH1-INF9',
    name: 'Ulangan Harian 1: Struktur Data & Logika Informatika',
    subject: 'Informatika',
    grade: 'IX',
    semester: '1 (Ganjil)',
    material: 'Struktur Data (LIFO, FIFO, Stack, Queue) & Gerbang Logika (AND, OR, NOT, XOR)',
    totalQuestions: 20,
    durationMinutes: 40,
    kkm: 75,
    status: 'ACTIVE' as const,
    accessCode: 'INF9UH1',
    allowReview: true,
    createdAt: new Date().toISOString()
  }
];
