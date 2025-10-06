export interface Question {
  id: string;
  question: string;
  type: 'single' | 'multiple' | 'judgment'; // 单选、多选、判断
  options: string[];
  correctAnswer: number | number[]; // 单选是number，多选是number[]
  category?: string;
  difficulty?: string;
  explanation?: string;
}

export interface QuestionBank {
  id: string;
  name: string;
  questions: Question[];
  createdAt: number;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: number | number[]; // 支持多选
  isCorrect: boolean;
  timestamp: number;
}

export interface StudySession {
  id: string;
  bankId: string;
  answers: UserAnswer[];
  startTime: number;
  endTime?: number;
  mode: 'practice' | 'exam';
  score?: number;
}

export interface StudyProgress {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
}

export interface DailyRecord {
  date: string;
  questionsAnswered: number;
  correctAnswers: number;
  studyTime: number;
}
