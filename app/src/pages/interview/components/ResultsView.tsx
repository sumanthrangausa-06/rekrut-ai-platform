import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Award,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  Briefcase,
  Share2,
  Check,
  ArrowRight,
  Target,
  TrendingUp,
  Zap,
  ChevronRight,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react';
import type { InterviewFeedback } from '../types';

interface ResultsViewProps {
  feedback: InterviewFeedback;
  jobRole: string;
  experienceLevel: string;
  onPracticeAgain: () => void;
  onDifferentRole: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600';
  if (score >= 5) return 'text-amber-600';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 8) return 'bg-green-50 border-green-200';
  if (score >= 5) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

function getScoreLabel(score: number): string {
  if (score >= 9) return 'Outstanding';
  if (score >= 8) return 'Excellent';
  if (score >= 7) return 'Very Good';
  if (score >= 5) return 'Good';
  if (score >= 3) return 'Needs Improvement';
  return 'Keep Practicing';
}

// Circular progress component
function CircularProgress({
  score,
  size = 140,
  strokeWidth = 10,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 10) * circumference;
  const colorClass =
    score >= 8 ? 'text-green-500' : score >= 5 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90 w-full h-full"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Overall score: ${score} out of 10`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${colorClass} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
        <span className="text-xs text-muted-foreground">/ 10</span>
      </div>
    </div>
  );
}

export default function ResultsView({
  feedback,
  jobRole,
  experienceLevel,
  onPracticeAgain,
  onDifferentRole,
}: ResultsViewProps) {
  const [copied, setCopied] = useState(false);

  // Format experience level label
  const expLabel =
    experienceLevel === 'entry'
      ? 'Entry Level'
      : experienceLevel === 'mid'
      ? 'Mid Level'
      : experienceLevel === 'senior'
      ? 'Senior Level'
      : 'Executive';

  const handleShare = useCallback(() => {
    const shareText = `
AI Interview Practice Results — Rekrut AI
Role: ${expLabel} ${jobRole}
Overall Score: ${feedback.overallScore}/10

Top Strengths:
${feedback.topStrengths.map((s) => `  ${s}`).join('\n')}

Key Improvements:
${feedback.keyImprovements.map((i) => `  ${i}`).join('\n')}

${feedback.summary}
    `.trim();

    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(() => {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
  }, [feedback, jobRole, experienceLevel, expLabel]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 pb-12">
      {/* Header */}
      <div className="border-b border-border/50 bg-muted/20">
        <div className="container max-w-3xl mx-auto px-4 py-8 md:py-12 text-center">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary/20"
          >
            <Award className="w-3.5 h-3.5 mr-1.5" />
            Interview Complete
          </Badge>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">
            Great Job!
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            You completed a practice interview for{' '}
            <span className="font-semibold text-foreground">
              {expLabel} {jobRole}
            </span>
          </p>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Overall Score Card */}
        <Card className={`border shadow-lg ${getScoreBg(feedback.overallScore)}`}>
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center gap-6">
              <CircularProgress score={feedback.overallScore} />
              <div className="text-center space-y-1">
                <h2
                  className={`text-xl font-bold ${getScoreColor(feedback.overallScore)}`}
                >
                  {getScoreLabel(feedback.overallScore)}
                </h2>
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                  {feedback.summary}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Strengths */}
        <Card className="border-green-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-green-700">
              <ThumbsUp className="w-5 h-5" />
              Top Strengths
            </CardTitle>
            <CardDescription>
              Areas where you performed well across all answers
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3" role="list">
              {feedback.topStrengths.slice(0, 3).map((strength, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <span className="text-foreground">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Key Improvements */}
        <Card className="border-amber-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-700">
              <Target className="w-5 h-5" />
              Key Improvements
            </CardTitle>
            <CardDescription>
              Focus on these areas for your next practice session
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3" role="list">
              {feedback.keyImprovements.slice(0, 3).map((improvement, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <span className="text-foreground">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Role-Specific Advice */}
        <Card className="border-primary/20 shadow-sm bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
              <Briefcase className="w-5 h-5" />
              Role-Specific Advice
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm leading-relaxed text-foreground">
              {feedback.roleSpecificAdvice}
            </p>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ol className="space-y-2.5" role="list">
              {feedback.nextSteps.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm leading-relaxed"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={onPracticeAgain}
            className="w-full h-12 font-semibold shadow-md hover:shadow-lg transition-shadow"
            size="lg"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Practice Same Role Again
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={onDifferentRole}
              variant="outline"
              className="flex-1 h-11 font-medium"
              size="lg"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Try Different Role
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex-1 h-11 font-medium"
              size="lg"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Results
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
