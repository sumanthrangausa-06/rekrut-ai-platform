import { Request } from "express";
import { UserRole } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  supabaseUid: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GradingResult {
  score: number;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
}

export interface InterviewFeedback {
  overallScore: number;
  summary: string;
  strengths: string[];
  keyImprovements: string[];
  nextSteps: string[];
}

export interface GeneratedQuestion {
  question: string;
  category: string;
  difficulty: string;
  followUps?: string[];
}

export interface AIGradingResult {
  score: number;
  feedback: string;
  isCorrect?: boolean;
}

export interface MCQQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface OpenEndedQuestion {
  question: string;
  rubric: string;
}

export interface AssessmentQuestionData {
  question: string;
  options?: string[];
  correctAnswer?: string;
  type: "MULTIPLE_CHOICE" | "OPEN_ENDED" | "CODING";
  explanation?: string;
  rubric?: string;
  order: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
