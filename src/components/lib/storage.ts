import { QuestionBank, UserAnswer, StudySession, DailyRecord } from '@/types';

const STORAGE_KEYS = {
  QUESTION_BANKS: 'questionBanks',
  USER_ANSWERS: 'userAnswers',
  STUDY_SESSIONS: 'studySessions',
  FAVORITES: 'favorites',
  DAILY_RECORDS: 'dailyRecords',
};

export const storage = {
  // Question Banks
  getQuestionBanks: (): QuestionBank[] => {
    const data = localStorage.getItem(STORAGE_KEYS.QUESTION_BANKS);
    return data ? JSON.parse(data) : [];
  },

  saveQuestionBank: (bank: QuestionBank): void => {
    const banks = storage.getQuestionBanks();
    const index = banks.findIndex(b => b.id === bank.id);
    if (index >= 0) {
      banks[index] = bank;
    } else {
      banks.push(bank);
    }
    localStorage.setItem(STORAGE_KEYS.QUESTION_BANKS, JSON.stringify(banks));
  },

  deleteQuestionBank: (bankId: string): void => {
    const banks = storage.getQuestionBanks().filter(b => b.id !== bankId);
    localStorage.setItem(STORAGE_KEYS.QUESTION_BANKS, JSON.stringify(banks));
  },

  // User Answers
  getUserAnswers: (): UserAnswer[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_ANSWERS);
    return data ? JSON.parse(data) : [];
  },

  saveUserAnswer: (answer: UserAnswer): void => {
    const answers = storage.getUserAnswers();
    answers.push(answer);
    localStorage.setItem(STORAGE_KEYS.USER_ANSWERS, JSON.stringify(answers));
  },

  // Study Sessions
  getStudySessions: (): StudySession[] => {
    const data = localStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);
    return data ? JSON.parse(data) : [];
  },

  saveStudySession: (session: StudySession): void => {
    const sessions = storage.getStudySessions();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(sessions));
  },

  // Favorites
  getFavorites: (): string[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  },

  toggleFavorite: (questionId: string): boolean => {
    const favorites = storage.getFavorites();
    const index = favorites.indexOf(questionId);
    if (index >= 0) {
      favorites.splice(index, 1);
    } else {
      favorites.push(questionId);
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return index < 0;
  },

  isFavorite: (questionId: string): boolean => {
    return storage.getFavorites().includes(questionId);
  },

  // Daily Records
  getDailyRecords: (): DailyRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_RECORDS);
    return data ? JSON.parse(data) : [];
  },

  updateDailyRecord: (questionsAnswered: number, correctAnswers: number, studyTime: number): void => {
    const today = new Date().toISOString().split('T')[0];
    const records = storage.getDailyRecords();
    const todayRecord = records.find(r => r.date === today);
    
    if (todayRecord) {
      todayRecord.questionsAnswered += questionsAnswered;
      todayRecord.correctAnswers += correctAnswers;
      todayRecord.studyTime += studyTime;
    } else {
      records.push({
        date: today,
        questionsAnswered,
        correctAnswers,
        studyTime,
      });
    }
    
    localStorage.setItem(STORAGE_KEYS.DAILY_RECORDS, JSON.stringify(records));
  },

  getTodayRecord: (): DailyRecord | null => {
    const today = new Date().toISOString().split('T')[0];
    const records = storage.getDailyRecords();
    return records.find(r => r.date === today) || null;
  },
};
