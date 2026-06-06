import { PrismaClient } from "@prisma/client";
import { openai, AI_MODEL, callOpenAI, safeJsonParse } from "../utils/openai";
import {
  GradingResult,
  InterviewFeedback,
  GeneratedQuestion,
} from "../types";

const prisma = new PrismaClient();

/**
 * Generate interview questions using OpenAI
 */
export async function generateQuestions(
  userId: string,
  jobRole: string,
  experienceLevel: string
): Promise<{ interviewId: string; questions: GeneratedQuestion[] }> {
  // Create the interview record
  const interview = await prisma.interview.create({
    data: {
      userId,
      jobRole,
      experienceLevel,
    },
  });

  // Generate questions via OpenAI
  const prompt = `You are an expert technical interviewer specializing in ${jobRole} positions. 
Generate exactly 5 interview questions for a candidate with ${experienceLevel} experience level.

The questions should be diverse:
- 2 technical questions relevant to ${jobRole}
- 1 behavioral question
- 1 situational/case study question
- 1 culture fit / soft skills question

Return ONLY a JSON array in this exact format (no markdown, no explanation):
[
  {
    "question": "The interview question text here",
    "category": "technical|behavioral|situational|culture_fit",
    "difficulty": "easy|medium|hard",
    "followUps": ["Follow-up question 1", "Follow-up question 2"]
  }
]

Make questions realistic, challenging, and tailored to ${jobRole} at the ${experienceLevel} level.`;

  const aiResult = await callOpenAI(async () =>
    openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a senior hiring manager and interview coach. Generate realistic, challenging interview questions. Always return valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })
  );

  if (!aiResult.success) {
    throw new Error(aiResult.response.error || "Failed to generate questions");
  }

  const content = aiResult.data.choices[0]?.message?.content || "[]";
  const questions = safeJsonParse<GeneratedQuestion[]>(content, []);

  // Default questions if AI fails to return valid JSON
  const defaultQuestions: GeneratedQuestion[] = [
    {
      question: `Walk me through your experience with ${jobRole} technologies and tools.`,
      category: "technical",
      difficulty: "medium",
      followUps: ["What was the most challenging project?", "How do you stay updated?"],
    },
    {
      question: "Describe a time you had to deal with a tight deadline. How did you handle it?",
      category: "behavioral",
      difficulty: "medium",
      followUps: ["What was the outcome?", "What would you do differently?"],
    },
    {
      question: `How would you approach designing a scalable ${jobRole} solution for a growing startup?`,
      category: "situational",
      difficulty: "hard",
      followUps: ["What trade-offs would you consider?", "How would you measure success?"],
    },
    {
      question: "Tell me about a time you disagreed with a team member. How did you resolve it?",
      category: "behavioral",
      difficulty: "medium",
      followUps: ["What was the result?", "How did it affect your relationship?"],
    },
    {
      question: "What excites you most about this role and our company?",
      category: "culture_fit",
      difficulty: "easy",
      followUps: ["Where do you see yourself in 3 years?"],
    },
  ];

  const finalQuestions = questions.length === 5 ? questions : defaultQuestions;

  // Store questions in database
  const categoryMap: Record<string, string> = {
    technical: "technical",
    behavioral: "behavioral",
    situational: "situational",
    culture_fit: "culture_fit",
  };

  const createdQuestions = await Promise.all(
    finalQuestions.map(async (q, index) => {
      const created = await prisma.interviewQuestion.create({
        data: {
          interviewId: interview.id,
          question: q.question,
          category: categoryMap[q.category] || q.category,
          order: index + 1,
        },
      });
      return {
        id: created.id,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty || "medium",
        followUps: q.followUps || [],
        order: index + 1,
      };
    })
  );

  return {
    interviewId: interview.id,
    questions: createdQuestions,
  };
}

/**
 * Grade an interview answer using OpenAI
 */
export async function gradeAnswer(
  questionId: string,
  answer: string
): Promise<GradingResult & { questionId: string }> {
  // Get the question details
  const question = await prisma.interviewQuestion.findUnique({
    where: { id: questionId },
    include: { interview: true },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  const prompt = `You are evaluating a candidate's interview response.

Job Role: ${question.interview.jobRole}
Experience Level: ${question.interview.experienceLevel}
Question Category: ${question.category}
Question: ${question.question}

Candidate's Answer: "${answer}"

Evaluate the response and return ONLY a JSON object in this exact format:
{
  "score": 7,
  "strengths": ["Strength point 1", "Strength point 2"],
  "improvements": ["Improvement suggestion 1", "Improvement suggestion 2"],
  "modelAnswer": "An example of a strong answer to this question..."
}

Scoring criteria (1-10):
- 1-3: Poor answer, misses key points, no structure
- 4-5: Below average, partially addresses the question
- 6-7: Good answer, covers main points adequately
- 8-9: Excellent answer, well-structured with specific examples
- 10: Outstanding answer, demonstrates deep expertise

Be fair but thorough in your evaluation.`;

  const aiResult = await callOpenAI(async () =>
    openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert interviewer and career coach. Evaluate responses fairly and provide constructive feedback. Always return valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 1500,
    })
  );

  if (!aiResult.success) {
    throw new Error(aiResult.response.error || "Failed to grade answer");
  }

  const content = aiResult.data.choices[0]?.message?.content || "{}";
  const grading = safeJsonParse<GradingResult>(content, {
    score: 5,
    strengths: ["Attempted to answer the question"],
    improvements: ["Provide more specific examples", "Structure your answer using the STAR method"],
    modelAnswer: "A strong answer would include specific examples, clear structure, and demonstrate relevant expertise.",
  });

  // Store the response in database
  await prisma.interviewResponse.create({
    data: {
      questionId,
      answer,
      score: Math.max(1, Math.min(10, grading.score)),
      strengths: grading.strengths,
      improvements: grading.improvements,
      modelAnswer: grading.modelAnswer,
    },
  });

  return {
    questionId,
    score: Math.max(1, Math.min(10, grading.score)),
    strengths: grading.strengths,
    improvements: grading.improvements,
    modelAnswer: grading.modelAnswer,
  };
}

/**
 * Get interview with all questions and responses
 */
export async function getInterviewWithResponses(interviewId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          response: true,
        },
      },
    },
  });

  return interview;
}

/**
 * Get user's interview history
 */
export async function getUserInterviewHistory(userId: string) {
  const interviews = await prisma.interview.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      questions: {
        include: {
          response: {
            select: {
              score: true,
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

  return interviews.map((interview) => ({
    id: interview.id,
    jobRole: interview.jobRole,
    experienceLevel: interview.experienceLevel,
    status: interview.status,
    score: interview.score,
    feedback: interview.feedback,
    totalQuestions: interview._count.questions,
    answeredQuestions: interview.questions.filter((q) => q.response).length,
    createdAt: interview.createdAt,
    updatedAt: interview.updatedAt,
  }));
}

/**
 * Get interview feedback by aggregating all responses
 */
export async function getInterviewFeedback(
  interviewId: string
): Promise<InterviewFeedback> {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      questions: {
        include: {
          response: true,
        },
      },
    },
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  const responses = interview.questions
    .map((q) => q.response)
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (responses.length === 0) {
    throw new Error("No responses found for this interview");
  }

  // Calculate overall score
  const avgScore = Math.round(
    responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length
  );

  // Collect all strengths and improvements
  const allStrengths = responses.flatMap((r) => r.strengths);
  const allImprovements = responses.flatMap((r) => r.improvements);

  // Use OpenAI to generate overall feedback
  const strengthsText = allStrengths.join("; ");
  const improvementsText = allImprovements.join("; ");

  const prompt = `You are providing overall feedback for an interview.

Job Role: ${interview.jobRole}
Experience Level: ${interview.experienceLevel}
Overall Score: ${avgScore}/10

All strengths observed: ${strengthsText}
All areas for improvement: ${improvementsText}

Generate a comprehensive interview feedback summary.
Return ONLY a JSON object in this exact format:
{
  "summary": "A 2-3 sentence summary of the overall performance...",
  "strengths": ["Top strength 1", "Top strength 2", "Top strength 3"],
  "keyImprovements": ["Key improvement 1", "Key improvement 2", "Key improvement 3"],
  "nextSteps": ["Actionable next step 1", "Actionable next step 2"]
}

Be encouraging but honest. Focus on actionable advice.`;

  const aiResult = await callOpenAI(async () =>
    openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a senior career coach providing interview feedback. Be constructive and encouraging. Always return valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1200,
    })
  );

  // Build feedback from AI or fallback
  let feedback: InterviewFeedback;

  if (aiResult.success) {
    const content = aiResult.data.choices[0]?.message?.content || "{}";
    const aiFeedback = safeJsonParse<InterviewFeedback>(content, {
      summary: `Overall score: ${avgScore}/10. Keep practicing to improve your interview performance.`,
      strengths: allStrengths.slice(0, 3),
      keyImprovements: allImprovements.slice(0, 3),
      nextSteps: ["Practice with more mock interviews", "Review common questions for your role"],
    });

    feedback = {
      overallScore: avgScore,
      ...aiFeedback,
    };
  } else {
    feedback = {
      overallScore: avgScore,
      summary: `Your overall interview score is ${avgScore}/10. You demonstrated several strengths but there are areas to improve.`,
      strengths: [...new Set(allStrengths)].slice(0, 5),
      keyImprovements: [...new Set(allImprovements)].slice(0, 5),
      nextSteps: [
        "Practice answering questions using the STAR method",
        "Review and strengthen your technical knowledge",
        "Prepare specific examples from your experience",
      ],
    };
  }

  // Update interview with score and feedback
  await prisma.interview.update({
    where: { id: interviewId },
    data: {
      score: avgScore,
      feedback: feedback.summary,
      status: "COMPLETED",
    },
  });

  return feedback;
}

/**
 * Check if user owns the interview
 */
export async function verifyInterviewOwnership(
  interviewId: string,
  userId: string
): Promise<boolean> {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    select: { userId: true },
  });

  return interview?.userId === userId;
}
