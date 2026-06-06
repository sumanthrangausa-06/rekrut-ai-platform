import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  HelpCircle,
  Code2,
  Users,
  Puzzle,
  Heart,
  BarChart3,
  Clock,
} from 'lucide-react';
import type { InterviewQuestion } from '../types';

interface QuestionCardProps {
  question: InterviewQuestion;
  currentIndex: number;
  totalQuestions: number;
  elapsedTime: number;
}

const CATEGORY_CONFIG = {
  technical: {
    label: 'Technical',
    icon: Code2,
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  behavioral: {
    label: 'Behavioral',
    icon: Users,
    variant: 'secondary' as const,
    className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  },
  situational: {
    label: 'Situational',
    icon: Puzzle,
    variant: 'secondary' as const,
    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  },
  culture_fit: {
    label: 'Culture Fit',
    icon: Heart,
    variant: 'secondary' as const,
    className: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  },
};

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy', className: 'text-green-600 bg-green-50' },
  medium: { label: 'Medium', className: 'text-amber-600 bg-amber-50' },
  hard: { label: 'Hard', className: 'text-red-600 bg-red-50' },
};

function formatElapsedTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  elapsedTime,
}: QuestionCardProps) {
  const category = CATEGORY_CONFIG[question.category];
  const CategoryIcon = category.icon;
  const difficulty = DIFFICULTY_CONFIG[question.difficulty];
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-xs">
            Question {currentIndex + 1} of {totalQuestions}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">{formatElapsedTime(elapsedTime)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={difficulty.className}>
            {difficulty.label}
          </Badge>
          <Badge className={category.className}>
            <CategoryIcon className="w-3 h-3 mr-1" />
            {category.label}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-2" aria-label={`Progress: ${currentIndex + 1} of ${totalQuestions} questions`} />

      {/* Question Card */}
      <Card className="border-border/60 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg md:text-xl font-semibold leading-relaxed text-foreground">
                {question.question}
              </h2>
              {question.context && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {question.context}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

export function QuestionCardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-2 w-full" />
      <Card>
        <CardContent className="pt-6 space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>
    </div>
  );
}
