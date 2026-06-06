import { supabase } from '@/integrations/supabase/client';
import type {
  InterviewQuestion,
  InterviewResponse,
  InterviewFeedback,
  Interview,
  InterviewSession,
} from './types';

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Get the current auth token from Supabase session
 */
async function getAuthToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/**
 * Wrapper around fetch that adds auth header and handles errors
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Try to get error details from response
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }

    if (response.status === 401) {
      throw new Error('Your session has expired. Please sign in again.');
    }
    if (response.status === 429) {
      throw new Error(
        'Too many requests. Please wait a moment before trying again.'
      );
    }
    if (response.status >= 500) {
      throw new Error(
        'Our servers are experiencing issues. Please try again later.'
      );
    }

    throw new Error(errorMessage);
  }

  // Handle empty responses
  const contentLength = response.headers.get('content-length');
  if (contentLength === '0' || response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

/**
 * Start a new interview session
 */
export async function startInterview(
  jobRole: string,
  experienceLevel: string
): Promise<InterviewSession> {
  return apiFetch<InterviewSession>('/api/interview/start', {
    method: 'POST',
    body: JSON.stringify({ jobRole, experienceLevel }),
  });
}

/**
 * Submit an answer for grading
 */
export async function submitAnswer(
  interviewId: string,
  questionId: string,
  answer: string
): Promise<InterviewResponse> {
  return apiFetch<InterviewResponse>('/api/interview/submit', {
    method: 'POST',
    body: JSON.stringify({ interviewId, questionId, answer }),
  });
}

/**
 * Get overall feedback for a completed interview
 */
export async function getFeedback(
  interviewId: string
): Promise<InterviewFeedback> {
  return apiFetch<InterviewFeedback>(`/api/interview/${interviewId}/feedback`);
}

/**
 * Get interview history for the current user
 */
export async function getInterviewHistory(): Promise<Interview[]> {
  return apiFetch<Interview[]>('/api/interview/history');
}

// ── Demo / Development Mode ──────────────────────────────────────────
// When the API is not available, these functions generate realistic
// mock data so the UI can still be developed and demonstrated.

const MOCK_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'q1',
    question:
      'Tell me about a time when you had to deal with a difficult bug in production. How did you approach it?',
    category: 'behavioral',
    difficulty: 'medium',
    context: 'Looking for problem-solving skills and calm under pressure.',
  },
  {
    id: 'q2',
    question:
      'Design a URL shortening service like bit.ly. What are the key components and how would you handle scaling?',
    category: 'technical',
    difficulty: 'hard',
    context: 'Assess system design knowledge and scalability thinking.',
  },
  {
    id: 'q3',
    question:
      'Your team is behind schedule on a critical project. The stakeholders are asking for a demo tomorrow. What do you do?',
    category: 'situational',
    difficulty: 'medium',
    context: 'Tests prioritization, communication, and stakeholder management.',
  },
  {
    id: 'q4',
    question:
      'Explain the difference between REST and GraphQL APIs. When would you choose one over the other?',
    category: 'technical',
    difficulty: 'medium',
    context: 'Evaluate API design knowledge and trade-off analysis.',
  },
  {
    id: 'q5',
    question:
      'Describe a situation where you had a conflict with a team member. How did you resolve it?',
    category: 'behavioral',
    difficulty: 'easy',
    context: 'Assess conflict resolution and interpersonal skills.',
  },
];

const MOCK_FEEDBACK_TEMPLATES: InterviewResponse[] = [
  {
    score: 8,
    strengths: [
      'Clear and structured response with a logical flow',
      'Provided specific examples that demonstrated real experience',
      'Showed awareness of team dynamics and communication',
    ],
    improvements: [
      'Could have quantified the impact of your solution with metrics',
      'Mention testing strategies earlier in your explanation',
    ],
    modelAnswer:
      'A strong answer follows the STAR method: Situation, Task, Action, Result. Start by briefly setting the context (1-2 sentences), explain the specific challenge, detail the concrete actions you took, and conclude with measurable results. For example: "At Company X, we faced a memory leak affecting 20% of users (Situation). I was tasked with identifying the root cause within 48 hours (Task). I instrumented the code with profiling tools, identified a caching issue in the auth middleware, and implemented a fix with proper TTL (Action). This reduced error rates by 95% and improved average response time by 200ms (Result)."',
    detailedFeedback:
      'Your answer was well-structured and demonstrated solid technical depth. You effectively communicated the problem space and your approach to solving it. To reach a score of 9-10, focus on adding quantifiable metrics and mentioning how you prevented similar issues in the future through process improvements or automated testing.',
  },
  {
    score: 6,
    strengths: [
      'Good understanding of the core concepts',
      'Answer was relevant to the question asked',
      'Demonstrated some practical knowledge',
    ],
    improvements: [
      'Structure your answer more clearly with a beginning, middle, and end',
      'Provide a concrete example from your experience rather than speaking in generalities',
      'Elaborate on the "why" behind your decisions',
    ],
    modelAnswer:
      'Use the STAR framework to structure behavioral answers. For technical questions, start with a high-level overview, then dive into specifics. Always tie your answer back to the business impact or team value. Concrete examples from your past experience make your answer significantly more credible and memorable.',
    detailedFeedback:
      'Your answer showed you understood the topic but lacked the depth and structure that would make it truly compelling. Interviewers are looking for evidence of how you have applied your knowledge in real situations. Try to prepare 3-5 strong stories from your career that you can adapt to various behavioral questions.',
  },
  {
    score: 9,
    strengths: [
      'Exceptional clarity and confidence in delivery',
      'Provided multiple perspectives and considered trade-offs',
      'Demonstrated both technical depth and business awareness',
      'Included follow-up considerations and scalability thinking',
    ],
    improvements: [
      'Could briefly mention alternative approaches you considered but rejected',
    ],
    modelAnswer:
      'This is an exemplary answer that balances technical accuracy with clear communication. You thoroughly covered the requirements, considered edge cases, and demonstrated awareness of system constraints. The inclusion of monitoring and observability considerations shows senior-level thinking.',
    detailedFeedback:
      'Outstanding response that demonstrates senior-level expertise. Your ability to communicate complex technical concepts clearly while considering business implications is exactly what top-tier companies look for. Minor improvement: explicitly discussing alternatives you considered shows even greater depth of thought.',
  },
  {
    score: 7,
    strengths: [
      'Structured approach to the problem',
      'Mentioned relevant technologies and best practices',
      'Considered security implications',
    ],
    improvements: [
      'Dive deeper into the trade-offs of your architectural decisions',
      'Discuss cost implications and resource optimization',
      'Mention how you would handle monitoring and alerting',
    ],
    modelAnswer:
      'A strong system design answer covers: requirements clarification, capacity estimation, API design, data model, high-level architecture, component details, and trade-off analysis. Always ask clarifying questions about scale, read/write ratios, and latency requirements before diving into your solution.',
    detailedFeedback:
      'Your answer was solid and demonstrated good technical fundamentals. To elevate your responses, practice discussing non-functional requirements like cost, operational complexity, and team expertise constraints. Senior roles require balancing technical excellence with pragmatic delivery.',
  },
  {
    score: 5,
    strengths: [
      'Attempted to address all parts of the question',
      'Showed some awareness of the topic area',
    ],
    improvements: [
      'Your answer was too brief — aim for 2-3 minutes of speaking time',
      'Use a specific example rather than general statements',
      'Demonstrate the outcome or result of your actions',
      'Show reflection on what you learned from the experience',
    ],
    modelAnswer:
      'Behavioral questions require concrete stories. Prepare using the STAR method and practice delivering each story in 90-120 seconds. Focus on your specific contributions (use "I" not "we") and always include a measurable result or key learning.',
    detailedFeedback:
      'Your answer touched on the topic but lacked the depth and specificity that interviewers need to evaluate your skills. Behavioral interviews are about evidence — specific stories from your experience that demonstrate your capabilities. Consider preparing a story bank of 8-10 experiences that cover common competency areas.',
  },
];

const MOCK_FINAL_FEEDBACK: InterviewFeedback = {
  overallScore: 7.2,
  summary:
    'You demonstrated solid technical knowledge and good communication skills throughout the interview. Your strongest area was system design, where you showed clear architectural thinking. Focus on adding more quantifiable results to your behavioral answers and diving deeper into trade-off analysis.',
  topStrengths: [
    'Clear and logical communication style',
    'Strong system design and architectural thinking',
    'Good balance of technical depth and high-level overview',
    'Calm and composed approach to challenging questions',
  ],
  keyImprovements: [
    'Add quantifiable metrics and outcomes to behavioral answers',
    'Dive deeper into trade-offs and alternative approaches',
    'Prepare more concrete examples from past experience',
    'Practice concise delivery — some answers ran longer than needed',
  ],
  roleSpecificAdvice:
    'For senior-level positions, interviewers expect you to demonstrate not just technical competence, but also mentorship abilities, cross-team collaboration experience, and strategic thinking. Practice discussing how you have influenced technical decisions beyond your immediate team and how you balance technical debt against feature delivery.',
  nextSteps: [
    'Prepare 5-8 STAR-format stories covering leadership, conflict resolution, failure, and success scenarios',
    'Practice system design interviews with a focus on non-functional requirements and trade-offs',
    'Research the specific technologies and scale the company operates at',
    'Schedule a mock interview with a peer to practice verbalizing your thought process',
    'Review common coding patterns and be ready to discuss time/space complexity trade-offs',
  ],
};

/**
 * Start a mock interview for development/demo purposes
 */
export async function startMockInterview(
  _jobRole: string,
  _experienceLevel: string
): Promise<InterviewSession> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1200));

  // Return a copy of mock questions with randomized order
  const shuffled = [...MOCK_QUESTIONS].sort(() => Math.random() - 0.5);

  return {
    interviewId: `mock-${Date.now()}`,
    questions: shuffled.slice(0, 5),
  };
}

/**
 * Submit a mock answer for development/demo purposes
 */
export async function submitMockAnswer(
  _interviewId: string,
  _questionId: string,
  _answer: string
): Promise<InterviewResponse> {
  // Simulate AI grading delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Return a random feedback template
  const template =
    MOCK_FEEDBACK_TEMPLATES[Math.floor(Math.random() * MOCK_FEEDBACK_TEMPLATES.length)];

  return {
    ...template,
    // Slightly vary the score to feel dynamic
    score: Math.min(10, Math.max(1, template.score + (Math.random() > 0.5 ? 1 : -1))),
  };
}

/**
 * Get mock final feedback for development/demo purposes
 */
export async function getMockFeedback(
  _interviewId: string
): Promise<InterviewFeedback> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    ...MOCK_FINAL_FEEDBACK,
    overallScore: Math.round((6 + Math.random() * 3) * 10) / 10,
  };
}

/**
 * Detect if we're in development/demo mode (no real API)
 */
function isDemoMode(): boolean {
  return !API_URL || API_URL === '';
}

// ── Smart exports that auto-switch between real API and mocks ────────

export { isDemoMode };
