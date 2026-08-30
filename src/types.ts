export type QuestionDifficulty = 'Mudah' | 'Sedang' | 'Sulit';
export type QuestionMaterial = 'Struktur Data' | 'Logika Informatika';
export type ExamStatus = 'DRAFT' | 'READY' | 'ACTIVE' | 'FINISHED' | 'ARCHIVED';

export interface QuestionOption {
  id: string; // e.g. 'A', 'B', 'C', 'D' or unique opt ID
  text: string;
}

export interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
  correctOptionId: string;
  material: QuestionMaterial;
  submaterial: string;
  difficulty: QuestionDifficulty;
  explanation: string;
  source: string;
  status: 'active' | 'draft';
  createdAt?: string;
}

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  name: string;
  className: string; // e.g., '9A', '9B', '9C', '9D', '9E', '9F', '9G'
  rombel?: string;
  gender?: 'L' | 'P';
}

export interface Exam {
  id: string;
  name: string;
  subject: string;
  grade: string;
  semester: string;
  materials: string;
  totalQuestions: number; // typically 20
  durationMinutes: number; // e.g. 40 or 60
  kkm: number; // standard e.g. 75
  status: ExamStatus;
  accessCode: string;
  allowReview?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  lockFullscreen?: boolean;
  questionIds?: string[];
  createdAt: string;
}

export interface StudentExamSession {
  id?: string;
  examId: string;
  studentId: string;
  studentName: string;
  className: string;
  nisn?: string;
  studentNisn?: string;
  startTime: number; // timestamp
  endTime?: number; // timestamp
  durationMinutes: number;
  questions: {
    questionId: string;
    originalQuestion: Question;
    shuffledOptions: QuestionOption[];
  }[];
  answers: Record<string, string>; // questionId -> selectedOptionId
  submitted: boolean;
  submittedAt?: number;
  score?: number;
  correctCount?: number;
  wrongCount?: number;
  passed?: boolean;
  violations: ViolationRecord[];
}

export interface ViolationRecord {
  id: string;
  studentName: string;
  className: string;
  timestamp: number;
  timeFormatted: string;
  activity: string; // e.g. 'Keluar fullscreen', 'Berpindah tab/window', 'Mencoba klik kanan', 'Mencoba copy shortcut'
  severity: 'low' | 'medium' | 'high';
}

export interface ExamResultSummary {
  examId: string;
  examName: string;
  totalParticipants: number;
  submittedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passedCount: number;
  failedCount: number;
  passPercentage: number;
}
