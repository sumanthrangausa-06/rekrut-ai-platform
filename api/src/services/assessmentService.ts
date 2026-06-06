import { PrismaClient, QuestionType } from "@prisma/client";
import { openai, AI_MODEL, callOpenAI, safeJsonParse } from "../utils/openai";
import { AssessmentQuestionData, AIGradingResult } from "../types";

const prisma = new PrismaClient();

interface MCQData {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface OpenEndedData {
  question: string;
  rubric: string;
}

interface GeneratedAssessment {
  mcqQuestions: MCQData[];
  openEndedQuestions: OpenEndedData[];
}

/**
 * Generate a new assessment with MCQ and open-ended questions
 */
export async function generateAssessment(
  userId: string,
  jobRole: string,
  experienceLevel: string
): Promise<{ assessmentId: string; questions: AssessmentQuestionData[] }> {
  // Create assessment record
  const assessment = await prisma.assessment.create({
    data: {
      userId,
      jobRole,
      title: `${jobRole} - ${experienceLevel} Level Assessment`,
      maxScore: 100,
    },
  });

  const prompt = `You are an expert technical assessor specializing in ${jobRole} positions.
Create a comprehensive assessment for ${experienceLevel} level candidates.

Generate exactly 7 multiple choice questions and 3 open-ended questions.

For MCQ questions:
- Each must have exactly 4 options (A, B, C, D)
- Only one correct answer
- Cover different aspects of ${jobRole}: fundamentals, practical scenarios, best practices, problem-solving

For open-ended questions:
- Focus on practical application and reasoning
- Should require detailed, thoughtful responses
- Include implicit grading criteria in the question

Return ONLY a JSON object in this exact format (no markdown, no explanation):
{
  "mcqQuestions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A",
      "explanation": "Brief explanation of why A is correct"
    }
  ],
  "openEndedQuestions": [
    {
      "question": "Open-ended question text here?",
      "rubric": "Grading criteria: 8-10 points for..., 5-7 points for..., 1-4 points for..."
    }
  ]
}

Make questions realistic, relevant to ${jobRole}, and appropriate for ${experienceLevel} level.`;

  const aiResult = await callOpenAI(async () =>
    openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a senior technical assessor. Create challenging, realistic assessment questions. Always return valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    })
  );

  let generated: GeneratedAssessment;

  if (aiResult.success) {
    const content = aiResult.data.choices[0]?.message?.content || "{}";
    const parsed = safeJsonParse<GeneratedAssessment>(content, {
      mcqQuestions: [],
      openEndedQuestions: [],
    });

    // Validate we got the right number of questions
    if (parsed.mcqQuestions.length === 7 && parsed.openEndedQuestions.length === 3) {
      generated = parsed;
    } else {
      generated = getDefaultAssessment(jobRole, experienceLevel);
    }
  } else {
    generated = getDefaultAssessment(jobRole, experienceLevel);
  }

  // Store MCQ questions
  const mcqPromises = generated.mcqQuestions.map(async (q, index) => {
    const created = await prisma.assessmentQuestion.create({
      data: {
        assessmentId: assessment.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        type: QuestionType.MULTIPLE_CHOICE,
        order: index + 1,
      },
    });
    return {
      id: created.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      type: "MULTIPLE_CHOICE" as const,
      explanation: q.explanation,
      order: index + 1,
    };
  });

  // Store open-ended questions
  const openEndedPromises = generated.openEndedQuestions.map(async (q, index) => {
    const created = await prisma.assessmentQuestion.create({
      data: {
        assessmentId: assessment.id,
        question: q.question,
        type: QuestionType.OPEN_ENDED,
        order: index + 8,
      },
    });
    return {
      id: created.id,
      question: q.question,
      rubric: q.rubric,
      type: "OPEN_ENDED" as const,
      order: index + 8,
    };
  });

  const [storedMCQ, storedOpenEnded] = await Promise.all([
    Promise.all(mcqPromises),
    Promise.all(openEndedPromises),
  ]);

  const questions: AssessmentQuestionData[] = [
    ...storedMCQ.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      type: q.type,
      explanation: q.explanation,
      order: q.order,
    })),
    ...storedOpenEnded.map((q) => ({
      id: q.id,
      question: q.question,
      rubric: q.rubric,
      type: q.type,
      order: q.order,
    })),
  ];

  return {
    assessmentId: assessment.id,
    questions: questions.sort((a, b) => a.order - b.order),
  };
}

/**
 * Grade an MCQ answer
 */
export async function gradeMCQ(
  questionId: string,
  selectedAnswer: string
): Promise<{ isCorrect: boolean; explanation: string; correctAnswer: string }> {
  const question = await prisma.assessmentQuestion.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  const isCorrect = question.correctAnswer?.toUpperCase() === selectedAnswer.toUpperCase();

  // Store the response
  await prisma.assessmentResponse.create({
    data: {
      questionId,
      answer: selectedAnswer,
      isCorrect,
    },
  });

  return {
    isCorrect,
    explanation: isCorrect
      ? "Correct! " + (question.correctAnswer || "")
      : `Incorrect. The correct answer is ${question.correctAnswer || "N/A"}.`,
    correctAnswer: question.correctAnswer || "",
  };
}

/**
 * Grade an open-ended answer using AI
 */
export async function gradeOpenEnded(
  questionId: string,
  answer: string
): Promise<AIGradingResult> {
  const question = await prisma.assessmentQuestion.findUnique({
    where: { id: questionId },
    include: { assessment: true },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  const prompt = `You are grading a candidate's assessment response.

Job Role: ${question.assessment.jobRole}
Question: ${question.question}

Candidate's Answer: "${answer}"

Grade this response and return ONLY a JSON object in this exact format:
{
  "score": 7,
  "feedback": "Detailed feedback explaining the grade, strengths, and what could be improved..."
}

Scoring (1-10):
- 1-3: Poor, missing key concepts, incorrect information
- 4-5: Below average, partially addresses the question
- 6-7: Good, covers main points with adequate explanation
- 8-9: Excellent, thorough and well-reasoned response
- 10: Outstanding, demonstrates deep expertise and insight

Be fair but thorough.`;

  const aiResult = await callOpenAI(async () =>
    openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a senior technical assessor. Grade responses fairly and provide constructive feedback. Always return valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 1000,
    })
  );

  let result: AIGradingResult;

  if (aiResult.success) {
    const content = aiResult.data.choices[0]?.message?.content || "{}";
    const parsed = safeJsonParse<{ score: number; feedback: string }>(content, {
      score: 5,
      feedback: "Response received. Detailed feedback will be provided shortly.",
    });

    result = {
      score: Math.max(1, Math.min(10, parsed.score)),
      feedback: parsed.feedback,
    };
  } else {
    result = {
      score: 5,
      feedback: "Your response has been recorded. AI grading is temporarily unavailable.",
    };
  }

  // Store the response
  await prisma.assessmentResponse.create({
    data: {
      questionId,
      answer,
      aiScore: result.score,
      aiFeedback: result.feedback,
    },
  });

  return result;
}

/**
 * Calculate overall assessment score
 */
export async function calculateOverallScore(
  assessmentId: string
): Promise<{
  totalScore: number;
  percentage: number;
  mcqScore: number;
  openEndedScore: number;
  feedback: string;
}> {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      questions: {
        include: {
          response: true,
        },
      },
    },
  });

  if (!assessment) {
    throw new Error("Assessment not found");
  }

  let mcqCorrect = 0;
  let mcqTotal = 0;
  let openEndedTotal = 0;
  let openEndedCount = 0;

  for (const question of assessment.questions) {
    if (question.type === QuestionType.MULTIPLE_CHOICE) {
      mcqTotal++;
      if (question.response?.isCorrect) {
        mcqCorrect++;
      }
    } else if (question.type === QuestionType.OPEN_ENDED) {
      if (question.response?.aiScore) {
        openEndedTotal += question.response.aiScore;
        openEndedCount++;
      }
    }
  }

  // MCQ: each correct = 10 points max (7 questions = 70 max)
  const mcqPoints = mcqCorrect * 10;
  const mcqMax = 70;

  // Open-ended: each score maps to 0-10 points (3 questions = 30 max)
  const openEndedPoints = openEndedCount > 0 ? (openEndedTotal / openEndedCount) * 3 : 0;
  const openEndedMax = 30;

  const totalScore = Math.round(mcqPoints + openEndedPoints);
  const percentage = Math.round((totalScore / 100) * 100);

  // Determine feedback based on percentage
  let feedback: string;
  if (percentage >= 90) {
    feedback = "Outstanding performance! You demonstrated exceptional knowledge and skills.";
  } else if (percentage >= 80) {
    feedback = "Great job! You have a strong understanding of the key concepts.";
  } else if (percentage >= 70) {
    feedback = "Good work. You have a solid foundation with some areas to improve.";
  } else if (percentage >= 60) {
    feedback = "Fair performance. Consider reviewing the areas where you struggled.";
  } else {
    feedback = "Keep practicing! Review the fundamentals and try again.";
  }

  // Update assessment
  await prisma.assessment.update({
    where: { id: assessmentId },
    data: {
      totalScore,
      status: "COMPLETED",
    },
  });

  return {
    totalScore,
    percentage,
    mcqScore: mcqCorrect,
    openEndedScore: openEndedCount > 0 ? Math.round((openEndedTotal / openEndedCount) * 10) / 10 : 0,
    feedback,
  };
}

/**
 * Get assessment with all questions and responses
 */
export async function getAssessmentWithResponses(assessmentId: string) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          response: true,
        },
      },
    },
  });

  return assessment;
}

/**
 * Get user's assessment history
 */
export async function getUserAssessmentHistory(userId: string) {
  const assessments = await prisma.assessment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      questions: {
        include: {
          response: {
            select: {
              isCorrect: true,
              aiScore: true,
            },
          },
        },
      },
      _count: {
        select: {
          questions: true,
        },
      },
    },
  });

  return assessments.map((assessment) => ({
    id: assessment.id,
    jobRole: assessment.jobRole,
    title: assessment.title,
    status: assessment.status,
    totalScore: assessment.totalScore,
    maxScore: assessment.maxScore,
    totalQuestions: assessment._count.questions,
    answeredQuestions: assessment.questions.filter((q) => q.response).length,
    createdAt: assessment.createdAt,
    updatedAt: assessment.updatedAt,
  }));
}

/**
 * Check if user owns the assessment
 */
export async function verifyAssessmentOwnership(
  assessmentId: string,
  userId: string
): Promise<boolean> {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { userId: true },
  });

  return assessment?.userId === userId;
}

/**
 * Default assessment questions when AI is unavailable
 */
function getDefaultAssessment(jobRole: string, experienceLevel: string): GeneratedAssessment {
  return {
    mcqQuestions: [
      {
        question: `What is the primary responsibility of a ${jobRole}?`,
        options: [
          "Managing team schedules",
          `Core ${jobRole} functions and deliverables`,
          "Handling customer complaints",
          "Performing administrative tasks",
        ],
        correctAnswer: "B",
        explanation: `The primary responsibility focuses on core ${jobRole} functions and deliverables.`,
      },
      {
        question: "Which of the following best describes agile methodology?",
        options: [
          "Strict sequential development",
          "Iterative and incremental development",
          "No documentation required",
          "Only for small teams",
        ],
        correctAnswer: "B",
        explanation: "Agile is an iterative and incremental approach to software development.",
      },
      {
        question: "What is the purpose of code reviews?",
        options: [
          "To find someone to blame for bugs",
          "To learn team coding standards only",
          "To improve code quality and share knowledge",
          "To increase deployment time",
        ],
        correctAnswer: "C",
        explanation: "Code reviews improve code quality, catch bugs early, and facilitate knowledge sharing.",
      },
      {
        question: "Which data structure uses LIFO (Last In, First Out)?",
        options: ["Queue", "Array", "Stack", "Linked List"],
        correctAnswer: "C",
        explanation: "A Stack uses LIFO - the last element added is the first one removed.",
      },
      {
        question: "What does SOLID stand for in software engineering?",
        options: [
          "Single, Open, Liskov, Interface, Dependency",
          "Simple, Object, Link, Inherit, Data",
          "System, Operation, Logic, Input, Design",
          "Structure, Organization, Layering, Integration, Deployment",
        ],
        correctAnswer: "A",
        explanation: "SOLID: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.",
      },
      {
        question: "What is the primary benefit of unit testing?",
        options: [
          "Replaces integration testing",
          "Catches bugs early and ensures code works as expected",
          "Makes code run faster",
          "Eliminates the need for documentation",
        ],
        correctAnswer: "B",
        explanation: "Unit testing catches bugs early in development and ensures individual components work correctly.",
      },
      {
        question: "Which HTTP status code indicates a successful GET request?",
        options: ["201", "204", "200", "301"],
        correctAnswer: "C",
        explanation: "HTTP 200 OK indicates the request has succeeded.",
      },
    ],
    openEndedQuestions: [
      {
        question: `Describe a challenging ${jobRole} project you've worked on. What was your role, what challenges did you face, and how did you overcome them?`,
        rubric:
          "8-10: Clear description with specific details, demonstrates problem-solving and technical skills. 5-7: Adequate description with some details. 1-4: Vague or incomplete answer.",
      },
      {
        question: `How do you stay current with the latest trends and technologies in ${jobRole}? Give specific examples.`,
        rubric:
          "8-10: Multiple concrete examples showing proactive learning. 5-7: General examples of learning. 1-4: No specific examples or irrelevant answer.",
      },
      {
        question: "Explain how you would approach a situation where project requirements change significantly mid-development.",
        rubric:
          "8-10: Comprehensive approach covering communication, planning, and technical adaptation. 5-7: Basic approach with some key points. 1-4: Unclear or impractical approach.",
      },
    ],
  };
}
