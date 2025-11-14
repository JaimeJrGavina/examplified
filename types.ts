
export enum QuestionType {
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    TRUE_FALSE = 'TRUE_FALSE',
    ESSAY = 'ESSAY',
}

export interface Question {
    id: string;
    text: string; // This will contain the Fact Pattern
    type: QuestionType;
    options?: string[]; // Optional, not used for Bar Essays
    correctAnswerIndex?: number; // Optional
    modelAnswer?: string; // The correct answer / model answer for review
}

export interface Exam {
    id: string;
    title: string;
    subject: string;
    durationMinutes: number;
    description: string;
    questions?: Question[]; 
}

export interface ExamSession {
    examId: string;
    answers: Record<string, string>; // questionId -> answer text
    flaggedQuestions: Set<string>; 
    startTime: number;
    isCompleted: boolean;
    score?: number;
}

export type ViewState = 'DASHBOARD' | 'ADMIN_DASHBOARD' | 'LOADING_EXAM' | 'TAKING_EXAM' | 'RESULT';
