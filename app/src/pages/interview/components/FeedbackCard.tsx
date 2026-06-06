import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  Award,
  MessageSquare,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import type { InterviewResponse } from '../types';

interface FeedbackCardProps {
  response: InterviewResponse;
  questionNumber: number;
  totalQuestions: number;
  onNext: () => void;
  isLastQuestion: boolean;
}

function getScoreConfig(score: number) {
  if (score >= 8) {
    return {
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      label: 'Excellent',
      icon: Award,
    };
  }
  if (score >= 5) {
    return {
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      label: 'Good',
      icon: TrendingUp,
    };
  }
  return {
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'Needs Work',
    icon: AlertTriangle,
  };
}

export default function FeedbackCard({
  response,
  questionNumber,
  totalQuestions,
  onNext,
  isLastQuestion,
}: FeedbackCardProps) {
  const scoreConfig = getScoreConfig(response.score);
  const ScoreIcon = scoreConfig.icon;

  return (
    <div className="space-y-4">
      {/* Score Header */}
      <Card className={`border ${scoreConfig.border} ${scoreConfig.bg} shadow-md`}>
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Score Circle */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${scoreConfig.border} ${scoreConfig.bg}`}
                role="img"
                aria-label={`Score: ${response.score} out of 10`}
              >
                <div className="text-center">
                  <span className={`text-3xl font-bold ${scoreConfig.color}`}>
                    {response.score}
                  </span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
              </div>
              {/* Pulse animation for high scores */}
              {response.score >= 8 && (
                <span className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping opacity-20" />
              )}
            </div>

            {/* Score Details */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <ScoreIcon className={`w-5 h-5 ${scoreConfig.color}`} />
                <span className={`text-lg font-semibold ${scoreConfig.color}`}>
                  {scoreConfig.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {response.detailedFeedback}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      {response.strengths.length > 0 && (
        <Card className="border-green-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2.5" role="list">
              {response.strengths.map((strength, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Improvements */}
      {response.improvements.length > 0 && (
        <Card className="border-amber-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-700">
              <Lightbulb className="w-5 h-5" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2.5" role="list">
              {response.improvements.map((improvement, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Model Answer Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="model-answer" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4">
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Model Answer — What an excellent response looks like
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pb-4 text-sm leading-relaxed text-muted-foreground bg-muted/30 rounded-lg p-4">
              <MessageSquare className="w-4 h-4 text-primary/60 mb-2" />
              <p className="text-foreground whitespace-pre-line">
                {response.modelAnswer}
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Next Button */}
      <Button
        onClick={onNext}
        className="w-full h-11 font-semibold shadow-md hover:shadow-lg transition-shadow"
        size="lg"
        aria-label={isLastQuestion ? 'View final results' : 'Go to next question'}
      >
        <span className="flex items-center gap-2">
          {isLastQuestion ? 'View Final Results' : 'Next Question'}
          <ChevronRight className="w-4 h-4" />
        </span>
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Question {questionNumber} of {totalQuestions} completed
      </p>
    </div>
  );
}
