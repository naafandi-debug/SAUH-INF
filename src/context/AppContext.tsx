import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Question, 
  QuestionOption,
  Student, 
  Exam, 
  StudentExamSession, 
  ViolationRecord
} from '../types';
import { INITIAL_QUESTIONS, INITIAL_EXAMS } from '../data/questionsData';
import { OFFICIAL_STUDENTS } from '../data/studentsData';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc, 
  updateDoc, 
  writeBatch
} from 'firebase/firestore';

interface AppContextType {
  questions: Question[];
  students: Student[];
  exams: Exam[];
  activeExam: Exam | null;
  sessions: Record<string, StudentExamSession>; // key: `${examId}_${studentId}`
  violations: ViolationRecord[];
  isFirebaseConnected: boolean;
  firebaseSyncStatus: 'synced' | 'syncing' | 'error';
  
  // Teacher Authentication
  isTeacherLoggedIn: boolean;
  teacherName: string;
  loginTeacher: (username?: string) => void;
  logoutTeacher: () => void;
  
  // Question management
  addQuestion: (question: Omit<Question, 'id'>) => Promise<Question>;
  updateQuestion: (id: string, updated: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  importQuestions: (newQuestions: Question[]) => Promise<void>;
  
  // Student management
  addStudent: (student: Omit<Student, 'id'>) => Promise<Student>;
  updateStudent: (id: string, updated: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  importStudents: (newStudents: Student[]) => Promise<void>;
  resetStudentsToOfficialList: () => Promise<void>;
  
  // Exam management
  createExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => Promise<Exam>;
  updateExam: (id: string, updated: Partial<Exam>) => Promise<void>;
  setActiveExam: (exam: Exam | null) => void;
  
  // Session & Grading
  startStudentExam: (examId: string, studentId: string) => Promise<StudentExamSession>;
  saveStudentAnswer: (examId: string, studentId: string, questionId: string, answerOptionId: string) => Promise<void>;
  submitStudentExam: (examId: string, studentId: string) => Promise<StudentExamSession>;
  recordViolation: (studentName: string, className: string, activity: string, severity?: 'low' | 'medium' | 'high') => Promise<void>;
  getStudentSession: (examId: string, studentId: string) => StudentExamSession | null;
  resetAllDataToDefault: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  QUESTIONS: 'inf9_assessment_questions',
  STUDENTS: 'inf9_assessment_students',
  EXAMS: 'inf9_assessment_exams',
  SESSIONS: 'inf9_assessment_sessions',
  VIOLATIONS: 'inf9_assessment_violations',
  TEACHER_AUTH: 'inf9_teacher_auth',
  TEACHER_NAME: 'inf9_teacher_name'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Teacher Authentication state
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.TEACHER_AUTH) === 'true' ||
           sessionStorage.getItem(STORAGE_KEYS.TEACHER_AUTH) === 'true';
  });

  const [teacherName, setTeacherName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.TEACHER_NAME) || 'Guru Informatika';
  });

  const loginTeacher = (user: string = 'Guru Informatika') => {
    setIsTeacherLoggedIn(true);
    setTeacherName(user);
    localStorage.setItem(STORAGE_KEYS.TEACHER_AUTH, 'true');
    localStorage.setItem(STORAGE_KEYS.TEACHER_NAME, user);
  };

  const logoutTeacher = () => {
    setIsTeacherLoggedIn(false);
    localStorage.removeItem(STORAGE_KEYS.TEACHER_AUTH);
    sessionStorage.removeItem(STORAGE_KEYS.TEACHER_AUTH);
  };

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load questions from localStorage', e);
    }
    return INITIAL_QUESTIONS;
  });

  // Students: default to the official 220 students (9A-9G)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only accept saved if it's the updated large dataset (>= 50 students)
        if (Array.isArray(parsed) && parsed.length >= 50) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load students from localStorage', e);
    }
    return OFFICIAL_STUDENTS;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load exams from localStorage', e);
    }
    return INITIAL_EXAMS;
  });

  const [activeExam, setActiveExam] = useState<Exam | null>(() => exams[0] || null);

  const [sessions, setSessions] = useState<Record<string, StudentExamSession>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load sessions', e);
    }
    return {};
  });

  const [violations, setViolations] = useState<ViolationRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIOLATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load violations', e);
    }
    return [];
  });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<'synced' | 'syncing' | 'error'>('syncing');

  const initializedRef = useRef<boolean>(false);

  // Local storage sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIOLATIONS, JSON.stringify(violations));
  }, [violations]);

  // Real-time Firestore Sync & Initial Seeding
  useEffect(() => {
    let isMounted = true;

    const initAndSubscribe = async () => {
      try {
        setFirebaseSyncStatus('syncing');

        // 1. Ensure Questions Collection
        const questionsColl = collection(db, 'questions');
        const qSnap = await getDocs(questionsColl);

        if (qSnap.empty) {
          console.log('Seeding initial questions to Firestore...');
          const batch = writeBatch(db);
          INITIAL_QUESTIONS.forEach(q => {
            batch.set(doc(db, 'questions', q.id), q);
          });
          await batch.commit();
        }

        // 2. Ensure Official Students Collection (9A - 9G: 220 Students)
        const studentsColl = collection(db, 'students');
        const sSnap = await getDocs(studentsColl);

        // If collection is empty or has old mock students (< 100 students)
        if (sSnap.empty || sSnap.size < 100) {
          console.log('Replacing student database with 220 official students (9A, 9B, 9C, 9D, 9E, 9F, 9G)...');
          
          // Delete old mock documents
          if (!sSnap.empty) {
            const delBatch = writeBatch(db);
            sSnap.docs.forEach(d => delBatch.delete(d.ref));
            await delBatch.commit();
          }

          // Insert 220 official students in batches
          const insertBatch = writeBatch(db);
          OFFICIAL_STUDENTS.forEach(std => {
            insertBatch.set(doc(db, 'students', std.id), std);
          });
          await insertBatch.commit();
        }

        // 3. Ensure Exams Collection
        const examsColl = collection(db, 'exams');
        const eSnap = await getDocs(examsColl);
        if (eSnap.empty) {
          const batch = writeBatch(db);
          INITIAL_EXAMS.forEach(ex => {
            batch.set(doc(db, 'exams', ex.id), ex);
          });
          await batch.commit();
        }

        if (!isMounted) return;
        setIsFirebaseConnected(true);
        setFirebaseSyncStatus('synced');
      } catch (err) {
        console.error('Error during Firestore initialization:', err);
        if (isMounted) {
          setIsFirebaseConnected(false);
          setFirebaseSyncStatus('error');
        }
      }
    };

    initAndSubscribe();

    // 1. Subscribe to Questions
    const unsubQuestions = onSnapshot(collection(db, 'questions'), (snapshot) => {
      if (!snapshot.empty) {
        const loadedQuestions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
        loadedQuestions.sort((a, b) => a.id.localeCompare(b.id));
        setQuestions(loadedQuestions);
      }
      setIsFirebaseConnected(true);
      setFirebaseSyncStatus('synced');
    }, (error) => {
      console.warn('Firestore questions listener error:', error);
    });

    // 2. Subscribe to Students
    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      if (!snapshot.empty) {
        const loadedStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        // Sort students by class then name
        loadedStudents.sort((a, b) => {
          if (a.className !== b.className) return a.className.localeCompare(b.className);
          return a.name.localeCompare(b.name);
        });
        setStudents(loadedStudents);
      }
    }, (error) => {
      console.warn('Firestore students listener error:', error);
    });

    // 3. Subscribe to Exams
    const unsubExams = onSnapshot(collection(db, 'exams'), (snapshot) => {
      if (!snapshot.empty) {
        const loadedExams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
        setExams(loadedExams);
        setActiveExam(prev => {
          if (!prev) return loadedExams[0] || null;
          const found = loadedExams.find(e => e.id === prev.id);
          return found || loadedExams[0] || null;
        });
      }
    }, (error) => {
      console.warn('Firestore exams listener error:', error);
    });

    // 4. Subscribe to Sessions
    const unsubSessions = onSnapshot(collection(db, 'sessions'), (snapshot) => {
      const map: Record<string, StudentExamSession> = {};
      snapshot.forEach(doc => {
        map[doc.id] = doc.data() as StudentExamSession;
      });
      setSessions(map);
    }, (error) => {
      console.warn('Firestore sessions listener error:', error);
    });

    // 5. Subscribe to Violations
    const unsubViolations = onSnapshot(collection(db, 'violations'), (snapshot) => {
      const loadedViolations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ViolationRecord));
      loadedViolations.sort((a, b) => b.timestamp - a.timestamp);
      setViolations(loadedViolations);
    }, (error) => {
      console.warn('Firestore violations listener error:', error);
    });

    return () => {
      isMounted = false;
      unsubQuestions();
      unsubStudents();
      unsubExams();
      unsubSessions();
      unsubViolations();
    };
  }, []);

  // Helper shuffle
  function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // --- CRUD ACTIONS WITH FIRESTORE PERSISTENCE ---

  const addQuestion = async (newQ: Omit<Question, 'id'>): Promise<Question> => {
    const id = `Q${String(questions.length + 1).padStart(3, '0')}`;
    const question: Question = { ...newQ, id, status: 'active', createdAt: new Date().toISOString() };
    
    setQuestions(prev => [question, ...prev]);

    try {
      await setDoc(doc(db, 'questions', id), question);
    } catch (e) {
      console.error('Failed to save question to Firestore:', e);
    }

    return question;
  };

  const updateQuestion = async (id: string, updated: Partial<Question>): Promise<void> => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updated } : q));

    try {
      await updateDoc(doc(db, 'questions', id), updated);
    } catch (e) {
      console.error('Failed to update question in Firestore:', e);
    }
  };

  const deleteQuestion = async (id: string): Promise<void> => {
    setQuestions(prev => prev.filter(q => q.id !== id));

    try {
      await deleteDoc(doc(db, 'questions', id));
    } catch (e) {
      console.error('Failed to delete question from Firestore:', e);
    }
  };

  const importQuestions = async (newQuestions: Question[]): Promise<void> => {
    const existingTexts = new Set(questions.map(q => q.question.toLowerCase().trim()));
    const filtered = newQuestions.filter(q => !existingTexts.has(q.question.toLowerCase().trim()));
    if (filtered.length === 0) return;

    setQuestions(prev => [...filtered, ...prev]);

    try {
      const batch = writeBatch(db);
      filtered.forEach(q => {
        const ref = doc(db, 'questions', q.id);
        batch.set(ref, q);
      });
      await batch.commit();
    } catch (e) {
      console.error('Failed to batch import questions to Firestore:', e);
    }
  };

  const addStudent = async (newS: Omit<Student, 'id'>): Promise<Student> => {
    const id = `STD_${Date.now()}`;
    const student: Student = { ...newS, id };

    setStudents(prev => [...prev, student]);

    try {
      await setDoc(doc(db, 'students', id), student);
    } catch (e) {
      console.error('Failed to add student to Firestore:', e);
    }

    return student;
  };

  const updateStudent = async (id: string, updated: Partial<Student>): Promise<void> => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));

    try {
      await updateDoc(doc(db, 'students', id), updated);
    } catch (e) {
      console.error('Failed to update student in Firestore:', e);
    }
  };

  const deleteStudent = async (id: string): Promise<void> => {
    setStudents(prev => prev.filter(s => s.id !== id));

    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (e) {
      console.error('Failed to delete student from Firestore:', e);
    }
  };

  const importStudents = async (newStudents: Student[]): Promise<void> => {
    const existingNISNs = new Set(students.map(s => s.nisn));
    const filtered = newStudents.filter(s => !existingNISNs.has(s.nisn));
    if (filtered.length === 0) return;

    setStudents(prev => [...prev, ...filtered]);

    try {
      const batch = writeBatch(db);
      filtered.forEach(std => {
        const ref = doc(db, 'students', std.id);
        batch.set(ref, std);
      });
      await batch.commit();
    } catch (e) {
      console.error('Failed to batch import students to Firestore:', e);
    }
  };

  const resetStudentsToOfficialList = async (): Promise<void> => {
    setStudents(OFFICIAL_STUDENTS);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(OFFICIAL_STUDENTS));

    try {
      // 1. Get all current student docs in firestore and remove
      const sSnap = await getDocs(collection(db, 'students'));
      const delBatch = writeBatch(db);
      sSnap.docs.forEach(d => delBatch.delete(d.ref));
      await delBatch.commit();

      // 2. Set all 220 official students
      const addBatch = writeBatch(db);
      OFFICIAL_STUDENTS.forEach(std => {
        addBatch.set(doc(db, 'students', std.id), std);
      });
      await addBatch.commit();
      console.log('Reset to official 220 students completed.');
    } catch (e) {
      console.error('Failed to reset students in Firestore:', e);
    }
  };

  const createExam = async (newE: Omit<Exam, 'id' | 'createdAt'>): Promise<Exam> => {
    const id = `EXAM-${Date.now().toString(36).toUpperCase()}`;
    const exam: Exam = {
      ...newE,
      id,
      createdAt: new Date().toISOString()
    };

    setExams(prev => [exam, ...prev]);
    setActiveExam(exam);

    try {
      await setDoc(doc(db, 'exams', id), exam);
    } catch (e) {
      console.error('Failed to create exam in Firestore:', e);
    }

    return exam;
  };

  const updateExam = async (id: string, updated: Partial<Exam>): Promise<void> => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    if (activeExam && activeExam.id === id) {
      setActiveExam(prev => prev ? { ...prev, ...updated } : null);
    }

    try {
      await updateDoc(doc(db, 'exams', id), updated);
    } catch (e) {
      console.error('Failed to update exam in Firestore:', e);
    }
  };

  const startStudentExam = async (examId: string, studentId: string): Promise<StudentExamSession> => {
    const sessionKey = `${examId}_${studentId}`;
    if (sessions[sessionKey] && !sessions[sessionKey].submitted) {
      return sessions[sessionKey];
    }

    const exam = exams.find(e => e.id === examId) || exams[0];
    const student = students.find(s => s.id === studentId) || students[0];

    // Pick 20 questions (or exam.totalQuestions) from bank
    let pool = questions.filter(q => q.status === 'active');
    if (pool.length < (exam.totalQuestions || 20)) {
      pool = questions; // fallback
    }

    // Shuffle and pick 20
    const selectedQuestions: Question[] = shuffleArray<Question>(pool).slice(0, exam.totalQuestions || 20);

    // Shuffle choices options so options are randomized per student
    const studentQuestions = selectedQuestions.map(q => ({
      questionId: q.id,
      originalQuestion: q,
      shuffledOptions: shuffleArray<QuestionOption>(q.options)
    }));

    const newSession: StudentExamSession = {
      examId,
      studentId,
      studentName: student.name,
      className: student.className,
      nisn: student.nisn,
      studentNisn: student.nisn,
      startTime: Date.now(),
      endTime: Date.now() + (exam.durationMinutes || 40) * 60 * 1000,
      durationMinutes: exam.durationMinutes || 40,
      questions: studentQuestions,
      answers: {},
      submitted: false,
      violations: []
    };

    setSessions(prev => ({
      ...prev,
      [sessionKey]: newSession
    }));

    try {
      await setDoc(doc(db, 'sessions', sessionKey), newSession);
    } catch (e) {
      console.error('Failed to save session to Firestore:', e);
    }

    return newSession;
  };

  const saveStudentAnswer = async (examId: string, studentId: string, questionId: string, answerOptionId: string): Promise<void> => {
    const sessionKey = `${examId}_${studentId}`;
    const current = sessions[sessionKey];
    if (!current || current.submitted) return;

    const updatedAnswers = {
      ...current.answers,
      [questionId]: answerOptionId
    };

    setSessions(prev => ({
      ...prev,
      [sessionKey]: {
        ...current,
        answers: updatedAnswers
      }
    }));

    try {
      await updateDoc(doc(db, 'sessions', sessionKey), {
        answers: updatedAnswers
      });
    } catch (e) {
      console.error('Failed to update student answer in Firestore:', e);
    }
  };

  const submitStudentExam = async (examId: string, studentId: string): Promise<StudentExamSession> => {
    const sessionKey = `${examId}_${studentId}`;
    const current = sessions[sessionKey];
    const exam = exams.find(e => e.id === examId) || exams[0];

    if (!current) throw new Error('Session not found');

    // Auto evaluation logic
    let correctCount = 0;
    current.questions.forEach(item => {
      const chosenOptionId = current.answers[item.questionId];
      if (chosenOptionId && chosenOptionId === item.originalQuestion.correctOptionId) {
        correctCount += 1;
      }
    });

    const totalQ = current.questions.length || 20;
    const wrongCount = totalQ - correctCount;
    const score = Math.round((correctCount / totalQ) * 100);
    const passed = score >= (exam.kkm || 75);

    const finishedSession: StudentExamSession = {
      ...current,
      submitted: true,
      submittedAt: Date.now(),
      score,
      correctCount,
      wrongCount,
      passed
    };

    setSessions(prev => ({
      ...prev,
      [sessionKey]: finishedSession
    }));

    try {
      await setDoc(doc(db, 'sessions', sessionKey), finishedSession);
    } catch (e) {
      console.error('Failed to submit session to Firestore:', e);
    }

    return finishedSession;
  };

  const recordViolation = async (studentName: string, className: string, activity: string, severity: 'low' | 'medium' | 'high' = 'medium'): Promise<void> => {
    const now = new Date();
    const timeFormatted = now.toTimeString().split(' ')[0];
    const violation: ViolationRecord = {
      id: `viol_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      studentName,
      className,
      timestamp: Date.now(),
      timeFormatted,
      activity,
      severity
    };

    setViolations(prev => [violation, ...prev]);

    try {
      await setDoc(doc(db, 'violations', violation.id), violation);
    } catch (e) {
      console.error('Failed to record violation to Firestore:', e);
    }

    // Also link into active session if found
    if (activeExam) {
      const student = students.find(s => s.name === studentName);
      if (student) {
        const sessionKey = `${activeExam.id}_${student.id}`;
        const currentSession = sessions[sessionKey];
        if (currentSession) {
          const updatedViolations = [violation, ...(currentSession.violations || [])];
          setSessions(prev => ({
            ...prev,
            [sessionKey]: {
              ...currentSession,
              violations: updatedViolations
            }
          }));

          try {
            await updateDoc(doc(db, 'sessions', sessionKey), {
              violations: updatedViolations
            });
          } catch (e) {}
        }
      }
    }
  };

  const getStudentSession = (examId: string, studentId: string): StudentExamSession | null => {
    const sessionKey = `${examId}_${studentId}`;
    return sessions[sessionKey] || null;
  };

  const resetAllDataToDefault = async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.EXAMS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.VIOLATIONS);

    setQuestions(INITIAL_QUESTIONS);
    setStudents(OFFICIAL_STUDENTS);
    setExams(INITIAL_EXAMS);
    setActiveExam(INITIAL_EXAMS[0]);
    setSessions({});
    setViolations([]);

    try {
      const batch = writeBatch(db);
      INITIAL_QUESTIONS.forEach(q => {
        batch.set(doc(db, 'questions', q.id), q);
      });
      OFFICIAL_STUDENTS.forEach(std => {
        batch.set(doc(db, 'students', std.id), std);
      });
      INITIAL_EXAMS.forEach(ex => {
        batch.set(doc(db, 'exams', ex.id), ex);
      });
      await batch.commit();
    } catch (e) {
      console.error('Failed to reset Firestore:', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        questions,
        students,
        exams,
        activeExam,
        sessions,
        violations,
        isFirebaseConnected,
        firebaseSyncStatus,
        isTeacherLoggedIn,
        teacherName,
        loginTeacher,
        logoutTeacher,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        importQuestions,
        addStudent,
        updateStudent,
        deleteStudent,
        importStudents,
        resetStudentsToOfficialList,
        createExam,
        updateExam,
        setActiveExam,
        startStudentExam,
        saveStudentAnswer,
        submitStudentExam,
        recordViolation,
        getStudentSession,
        resetAllDataToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
