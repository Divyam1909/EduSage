// Shared shapes of the data returned by the EduSage backend

export interface StudentProfile {
  _id?: string;
  name: string;
  rollno: string;
  branch: string;
  sem: number;
  dateOfBirth: string;
  phone: string;
  email: string;
  wisdomPoints?: number;
  experience?: number;
  rank?: number;
  questionsAnswered?: number;
  questionsAsked?: number;
  quizzesAttempted?: number;
  photoUrl?: string;
  showStats?: boolean;
  showDetailedAnalysis?: boolean;
}

export interface TeacherProfile {
  _id?: string;
  name: string;
  teacherId: string;
  dateOfBirth: string;
  dateOfJoining: string;
  phone: string;
  email: string;
  photoUrl?: string;
}

export interface QuizQuestion {
  questionText: string;
  isMCQ: boolean;
  options: string[];
  // Only sent to teachers and the quiz's creator
  correctAnswer?: string;
  marks: number;
}

export interface Quiz {
  _id: string;
  title: string;
  topic: string;
  difficulty: string;
  timeLimit: number;
  points: number;
  clearable: boolean;
  questions: QuizQuestion[];
  createdBy?: string;
}

export interface QuizAttemptAnswer {
  questionId: number;
  answer: string;
  correct: boolean;
  correctAnswer?: string;
  marksObtained: number;
}

export interface QuizAttempt {
  _id: string;
  quizId: Quiz | string | null;
  user: string;
  answers: QuizAttemptAnswer[];
  totalScore: number;
  timeTaken: number;
  submittedAt: string;
}

export interface Resource {
  _id: string;
  fileName: string;
  courseName: string;
  fileLink: string;
  bookmarked?: boolean;
  createdBy?: string;
}

export interface SubjectMark {
  _id: string;
  user?: string;
  subject: string;
  cia1: number;
  cia2: number;
  midSem: number;
  endSem: number;
}

export interface ForumQuestion {
  _id: string;
  title: string;
  details?: string;
  subject: string;
  askedBy: string;
  wisdomPoints: number;
  answers: number;
  askedAt: string;
  solved: boolean;
}

export interface TopSage {
  _id?: string;
  name: string;
  rollno?: string;
  photoUrl?: string;
  wisdomPoints?: number;
  rawWisdomPoints?: number;
}

export interface LeaderboardEntry {
  _id?: string;
  name: string;
  rollno: string;
  wisdomPoints: number;
}

// Average total marks per subject, from /api/teacher/class/graph
export interface SubjectAverage {
  _id: string;
  avgMarks: number;
}

export interface PendingNotification {
  id: string;
  eventId: string;
  message: string;
  type: string;
  seen?: boolean;
}
