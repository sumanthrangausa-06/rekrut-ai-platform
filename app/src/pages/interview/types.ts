export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'behavioral' | 'situational' | 'culture_fit';
  difficulty: 'easy' | 'medium' | 'hard';
  context?: string;
}

export interface InterviewResponse {
  score: number;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  detailedFeedback: string;
}

export interface InterviewFeedback {
  overallScore: number;
  summary: string;
  topStrengths: string[];
  keyImprovements: string[];
  roleSpecificAdvice: string;
  nextSteps: string[];
}

export interface InterviewSession {
  interviewId: string;
  questions: InterviewQuestion[];
}

export interface Interview {
  id: string;
  jobRole: string;
  experienceLevel: string;
  overallScore: number;
  completedAt: string;
  questionsCount: number;
}

export type InterviewStep = 'role-selection' | 'in-progress' | 'feedback' | 'results';

export interface AnswerSubmission {
  questionId: string;
  answer: string;
  response: InterviewResponse;
}

export const JOB_ROLES = [
  'Software Engineer',
  'Product Manager',
  'Data Analyst',
  'Data Scientist',
  'UX Designer',
  'Sales Representative',
  'Marketing Manager',
  'Project Manager',
  'DevOps Engineer',
  'QA Engineer',
  'Business Analyst',
  'HR Manager',
] as const;

export type JobRole = (typeof JOB_ROLES)[number];

export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level', range: '0-2 years' },
  { value: 'mid', label: 'Mid Level', range: '3-5 years' },
  { value: 'senior', label: 'Senior Level', range: '6-10 years' },
  { value: 'executive', label: 'Executive', range: '10+ years' },
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]['value'];
