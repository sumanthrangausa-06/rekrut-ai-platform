import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { JOB_ROLES, EXPERIENCE_LEVELS } from '../types';
import {
  Mic2,
  Briefcase,
  Clock,
  Award,
  TrendingUp,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface RoleSelectorProps {
  onStart: (jobRole: string, experienceLevel: string) => void;
  isLoading: boolean;
}

const FEATURES = [
  {
    icon: Mic2,
    label: 'AI-Powered Questions',
    description: 'Tailored to your role and level',
  },
  {
    icon: TrendingUp,
    label: 'Instant Feedback',
    description: 'Detailed scoring and analysis',
  },
  {
    icon: Award,
    label: 'Model Answers',
    description: 'Learn from best-practice responses',
  },
  {
    icon: Users,
    label: 'Unlimited Practice',
    description: 'Practice as many times as you want',
  },
];

export default function RoleSelector({ onStart, isLoading }: RoleSelectorProps) {
  const [jobRole, setJobRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleStart = () => {
    setValidationError('');
    if (!jobRole) {
      setValidationError('Please select a job role');
      return;
    }
    if (!experienceLevel) {
      setValidationError('Please select an experience level');
      return;
    }
    onStart(jobRole, experienceLevel);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/50 bg-muted/20">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="container max-w-4xl mx-auto px-4 py-12 md:py-20 relative">
          <div className="flex flex-col items-center text-center space-y-6">
            <Badge
              variant="secondary"
              className="w-fit px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              AI-Powered Practice
            </Badge>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Practice with{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                AI Interview Coach
              </span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Get real interview questions, instant feedback, and detailed analysis
              tailored to your target role and experience level.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              {FEATURES.map((feature) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border/50 shadow-sm"
                >
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selection Card */}
      <div className="container max-w-xl mx-auto px-4 py-8 md:py-12">
        <Card className="border-border/60 shadow-lg shadow-muted/20">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold">Configure Your Interview</CardTitle>
            <CardDescription>
              Select your target role and experience level to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Job Role Selector */}
            <div className="space-y-2.5">
              <label
                htmlFor="job-role"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Job Role
              </label>
              <Select value={jobRole} onValueChange={setJobRole}>
                <SelectTrigger
                  id="job-role"
                  aria-label="Select job role"
                  className="h-11"
                >
                  <SelectValue placeholder="Choose a job role..." />
                </SelectTrigger>
                <SelectContent>
                  {JOB_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Experience Level Selector */}
            <div className="space-y-2.5">
              <label
                htmlFor="experience-level"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-muted-foreground" />
                Experience Level
              </label>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger
                  id="experience-level"
                  aria-label="Select experience level"
                  className="h-11"
                >
                  <SelectValue placeholder="Choose your experience level..." />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label} ({level.range})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Validation Error */}
            {validationError && (
              <div
                role="alert"
                className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3 border border-destructive/20"
              >
                {validationError}
              </div>
            )}

            {/* Start Button */}
            <Button
              onClick={handleStart}
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-shadow"
              size="lg"
              aria-label="Start interview practice"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                  Preparing your interview...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Start Interview
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-1">
              You will answer 5 questions and receive detailed AI feedback
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
