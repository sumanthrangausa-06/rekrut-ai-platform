import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Mic2,
  Loader2,
  AlertCircle,
  Terminal,
} from 'lucide-react';
import { useInterview } from './hooks/useInterview';
import {
  RoleSelector,
  QuestionCard,
  AnswerInput,
  FeedbackCard,
  ResultsView,
} from './components';
import type { InterviewStep } from './types';

/* ── Step Transition Wrapper ─────────────────────────────────────── */

function StepTransition({
  children,
  step,
}: {
  children: React.ReactNode;
  step: InterviewStep;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger CSS transition
    const timer = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      {children}
    </div>
  );
}

/* ── Loading Skeleton for Interview Start ────────────────────────── */

function InterviewLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="container max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-6">
        {/* Progress skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-2 w-full" />

        {/* Question card skeleton */}
        <Card className="border-border/60 shadow-md">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer input skeleton */}
        <Card className="border-border/60 shadow-md">
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-[180px] w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ── Analyzing Loading State ─────────────────────────────────────── */

function AnalyzingState() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[300px] flex flex-col items-center justify-center space-y-6 py-16">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Mic2 className="w-8 h-8 text-primary" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Analyzing your answer{dots}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Our AI is evaluating your response for clarity, relevance, structure,
          and depth. This takes just a moment.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 text-primary animate-spin" />
        <span className="text-xs text-muted-foreground">Processing with AI</span>
      </div>
    </div>
  );
}

/* ── Interview Error State ───────────────────────────────────────── */

function InterviewError({
  message,
  onRetry,
  onBack,
}: {
  message: string;
  onRetry: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-destructive/30 shadow-lg">
        <CardContent className="pt-8 pb-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Something went wrong
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {message}
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Button onClick={onRetry} className="font-semibold">
              <Loader2 className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            {onBack && (
              <Button variant="outline" onClick={onBack} className="font-medium">
                Go Back
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Main Interview Coach Page ───────────────────────────────────── */

export default function InterviewCoach() {
  const {
    step,
    currentQuestionIndex,
    questions,
    currentResponse,
    overallFeedback,
    jobRole,
    experienceLevel,
    isLoading,
    error,
    startInterview,
    submitAnswer,
    nextQuestion,
    restart,
  } = useInterview();

  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer for elapsed time during question
  useEffect(() => {
    if (step === 'in-progress') {
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [step, currentQuestionIndex]);

  // Handle starting the interview
  const handleStart = async (role: string, level: string) => {
    await startInterview(role, level);
  };

  // Handle submitting an answer
  const handleSubmit = async (answer: string) => {
    await submitAnswer(answer);
  };

  // Handle going to next question or finishing
  const handleNext = () => {
    nextQuestion();
  };

  // Handle practice again with same role
  const handlePracticeAgain = () => {
    if (jobRole && experienceLevel) {
      startInterview(jobRole, experienceLevel);
    } else {
      restart();
    }
  };

  // Handle back navigation during interview
  const handleBackToStart = () => {
    restart();
  };

  // ── Render Error State ─────────────────────────────────────────
  if (error && step === 'role-selection') {
    return (
      <InterviewError
        message={error}
        onRetry={() => startInterview(jobRole, experienceLevel)}
        onBack={handleBackToStart}
      />
    );
  }

  // ── Render Step: Role Selection ────────────────────────────────
  if (step === 'role-selection') {
    return (
      <StepTransition step="role-selection">
        <RoleSelector onStart={handleStart} isLoading={isLoading} />
      </StepTransition>
    );
  }

  // ── Render Step: Loading Initial Questions ─────────────────────
  if (isLoading && step === 'in-progress' && questions.length === 0) {
    return <InterviewLoadingSkeleton />;
  }

  // ── Render Step: Interview in Progress ─────────────────────────
  if (step === 'in-progress' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
        <div className="container max-w-3xl mx-auto px-4 py-6 md:py-10">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToStart}
              className="text-muted-foreground hover:text-foreground -ml-2"
              aria-label="Exit interview and return to role selection"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Exit Interview
            </Button>
          </div>

          <StepTransition step="in-progress">
            <div className="space-y-6">
              {/* Question */}
              <QuestionCard
                question={currentQuestion}
                currentIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                elapsedTime={elapsedTime}
              />

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Answer Input */}
              <AnswerInput
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </StepTransition>
        </div>
      </div>
    );
  }

  // ── Render Step: Analyzing / Submitting ────────────────────────
  if (isLoading && step === 'feedback') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
        <div className="container max-w-3xl mx-auto px-4 py-6 md:py-10">
          <AnalyzingState />
        </div>
      </div>
    );
  }

  // ── Render Step: Feedback ──────────────────────────────────────
  if (step === 'feedback' && currentResponse) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
        <div className="container max-w-3xl mx-auto px-4 py-6 md:py-10">
          <StepTransition step="feedback">
            <div className="space-y-6">
              <FeedbackCard
                response={currentResponse}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                onNext={handleNext}
                isLastQuestion={currentQuestionIndex === questions.length - 1}
              />
            </div>
          </StepTransition>
        </div>
      </div>
    );
  }

  // ── Render Step: Loading Final Results ─────────────────────────
  if (isLoading && step === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Generating your final report...</p>
        </div>
      </div>
    );
  }

  // ── Render Step: Final Results ─────────────────────────────────
  if (step === 'results' && overallFeedback) {
    return (
      <StepTransition step="results">
        <ResultsView
          feedback={overallFeedback}
          jobRole={jobRole}
          experienceLevel={experienceLevel}
          onPracticeAgain={handlePracticeAgain}
          onDifferentRole={restart}
        />
      </StepTransition>
    );
  }

  // ── Fallback: Should not reach here ────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-sm w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <Terminal className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Something unexpected happened.</p>
          <Button onClick={restart} variant="outline">
            Start Over
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
