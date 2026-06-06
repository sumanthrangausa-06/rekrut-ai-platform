import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Keyboard, AlertCircle } from 'lucide-react';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  isLoading: boolean;
  minLength?: number;
}

export default function AnswerInput({
  onSubmit,
  isLoading,
  minLength = 50,
}: AnswerInputProps) {
  const [answer, setAnswer] = useState('');
  const [touched, setTouched] = useState(false);

  const charCount = answer.trim().length;
  const isValid = charCount >= minLength;
  const showError = touched && !isValid && charCount > 0;

  // Reset when component mounts (new question)
  useEffect(() => {
    setAnswer('');
    setTouched(false);
  }, []);

  const handleSubmit = useCallback(() => {
    setTouched(true);
    if (isValid) {
      onSubmit(answer.trim());
    }
  }, [answer, isValid, onSubmit]);

  // Keyboard shortcut: Ctrl/Cmd + Enter to submit
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isValid && !isLoading) {
        e.preventDefault();
        onSubmit(answer.trim());
      }
    },
    [answer, isValid, isLoading, onSubmit]
  );

  return (
    <Card className="border-border/60 shadow-md">
      <CardContent className="pt-6 space-y-4">
        {/* Text Area */}
        <div className="space-y-2">
          <label
            htmlFor="interview-answer"
            className="text-sm font-medium text-foreground flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-muted-foreground" />
              Your Answer
            </span>
            <span
              className={`text-xs font-mono transition-colors ${
                isValid
                  ? 'text-green-600'
                  : charCount > 0
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/60'
              }`}
              aria-live="polite"
            >
              {charCount} / {minLength} min characters
            </span>
          </label>

          <Textarea
            id="interview-answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => setTouched(true)}
            placeholder="Type your answer here... Be specific and use examples from your experience. Aim for at least 2-3 sentences."
            className="min-h-[180px] resize-y text-sm leading-relaxed"
            disabled={isLoading}
            aria-label="Your interview answer"
            aria-describedby="answer-help"
          />

          <p id="answer-help" className="text-xs text-muted-foreground">
            Tip: Use the STAR method (Situation, Task, Action, Result) for behavioral questions.
            Press Ctrl+Enter to submit.
          </p>
        </div>

        {/* Validation Error */}
        {showError && (
          <Alert variant="destructive" className="text-sm py-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your answer must be at least {minLength} characters long.
              Currently {charCount} characters.
            </AlertDescription>
          </Alert>
        )}

        {/* Character Progress Bar */}
        <div className="space-y-1">
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isValid ? 'bg-green-500' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, (charCount / minLength) * 100)}%` }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          className="w-full h-11 font-semibold shadow-md hover:shadow-lg transition-shadow"
          size="lg"
          aria-label="Submit your answer for AI feedback"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-40" />
                <span className="relative inline-flex h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              </span>
              Analyzing your answer...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Submit Answer
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
