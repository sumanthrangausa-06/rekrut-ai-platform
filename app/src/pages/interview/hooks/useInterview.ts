import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  startInterview,
  submitAnswer,
  getFeedback,
  startMockInterview,
  submitMockAnswer,
  getMockFeedback,
  isDemoMode,
} from '../api';
import type {
  InterviewStep,
  InterviewQuestion,
  InterviewResponse,
  InterviewFeedback,
  AnswerSubmission,
} from '../types';

export interface UseInterviewReturn {
  // State
  step: InterviewStep;
  currentQuestionIndex: number;
  questions: InterviewQuestion[];
  currentResponse: InterviewResponse | null;
  overallFeedback: InterviewFeedback | null;
  jobRole: string;
  experienceLevel: string;
  isLoading: boolean;
  error: string | null;
  submissions: AnswerSubmission[];

  // Actions
  startInterview: (jobRole: string, experienceLevel: string) => Promise<void>;
  submitAnswer: (answer: string) => Promise<void>;
  nextQuestion: () => void;
  restart: () => void;
}

export function useInterview(): UseInterviewReturn {
  const [step, setStep] = useState<InterviewStep>('role-selection');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentResponse, setCurrentResponse] = useState<InterviewResponse | null>(null);
  const [overallFeedback, setOverallFeedback] = useState<InterviewFeedback | null>(null);
  const [jobRole, setJobRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [interviewId, setInterviewId] = useState('');
  const [submissions, setSubmissions] = useState<AnswerSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Start interview mutation
  const startMutation = useMutation({
    mutationFn: async ({
      role,
      level,
    }: {
      role: string;
      level: string;
    }) => {
      if (isDemoMode()) {
        return startMockInterview(role, level);
      }
      return startInterview(role, level);
    },
    onSuccess: (data, variables) => {
      setQuestions(data.questions);
      setInterviewId(data.interviewId);
      setJobRole(variables.role);
      setExperienceLevel(variables.level);
      setCurrentQuestionIndex(0);
      setCurrentResponse(null);
      setOverallFeedback(null);
      setSubmissions([]);
      setError(null);
      setStep('in-progress');
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to start interview. Please try again.');
    },
  });

  // Submit answer mutation
  const submitMutation = useMutation({
    mutationFn: async ({ answer }: { answer: string }) => {
      const currentQuestion = questions[currentQuestionIndex];
      if (!currentQuestion) throw new Error('No current question');

      if (isDemoMode()) {
        return submitMockAnswer(interviewId, currentQuestion.id, answer);
      }
      return submitAnswer(interviewId, currentQuestion.id, answer);
    },
    onSuccess: (data, variables) => {
      const currentQuestion = questions[currentQuestionIndex];
      setCurrentResponse(data);
      setSubmissions((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          answer: variables.answer,
          response: data,
        },
      ]);
      setError(null);
      setStep('feedback');
    },
    onError: (err: Error) => {
      setError(
        err.message || 'Failed to submit answer. Please check your connection and try again.'
      );
    },
  });

  // Get final feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async () => {
      if (isDemoMode()) {
        return getMockFeedback(interviewId);
      }
      return getFeedback(interviewId);
    },
    onSuccess: (data) => {
      setOverallFeedback(data);
      setError(null);
      setStep('results');
    },
    onError: (err: Error) => {
      setError(
        err.message || 'Failed to load final feedback. Please try again.'
      );
    },
  });

  const handleStartInterview = useCallback(
    async (role: string, level: string) => {
      if (!role || !level) {
        setError('Please select both a job role and experience level.');
        return;
      }
      setError(null);
      await startMutation.mutateAsync({ role, level });
    },
    [startMutation]
  );

  const handleSubmitAnswer = useCallback(
    async (answer: string) => {
      if (!answer || answer.trim().length < 50) {
        setError('Your answer must be at least 50 characters long.');
        return;
      }
      setError(null);
      await submitMutation.mutateAsync({ answer });
    },
    [submitMutation]
  );

  const handleNextQuestion = useCallback(() => {
    setError(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setCurrentResponse(null);
      setStep('in-progress');
    } else {
      // All questions answered — fetch final feedback
      feedbackMutation.mutate();
    }
  }, [currentQuestionIndex, questions.length, feedbackMutation]);

  const handleRestart = useCallback(() => {
    setStep('role-selection');
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setCurrentResponse(null);
    setOverallFeedback(null);
    setJobRole('');
    setExperienceLevel('');
    setInterviewId('');
    setSubmissions([]);
    setError(null);
  }, []);

  const isLoading =
    startMutation.isPending ||
    submitMutation.isPending ||
    feedbackMutation.isPending;

  return {
    step,
    currentQuestionIndex,
    questions,
    currentResponse,
    overallFeedback,
    jobRole,
    experienceLevel,
    isLoading,
    error,
    submissions,
    startInterview: handleStartInterview,
    submitAnswer: handleSubmitAnswer,
    nextQuestion: handleNextQuestion,
    restart: handleRestart,
  };
}
