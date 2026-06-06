/**
 * Interview Prompts - Rekrut AI Interview Coach
 *
 * Production-ready prompts for GPT-4o-mini to generate interview questions,
 * grade candidate answers, and provide comprehensive feedback.
 *
 * Cost-optimized: All prompts use GPT-4o-mini ($0.15/M input, $0.60/M output)
 */

/**
 * System message pattern for the interview coach.
 * Use as: { role: "system", content: getInterviewSystemMessage(jobRole) }
 */
export function getInterviewSystemMessage(jobRole: string): string {
  return `You are an expert technical interviewer with 15 years of experience hiring for ${jobRole} positions. You have conducted thousands of interviews at top tech companies and have deep expertise in evaluating candidates fairly and thoroughly. You provide constructive, actionable feedback that helps candidates improve. You always respond in valid JSON format with no markdown or explanatory text outside the JSON.`;
}

/**
 * Generates a prompt to create 5 role-specific interview questions.
 * Mix: 2 behavioral, 2 technical, 1 situational.
 */
export function generateInterviewQuestions(
  jobRole: string,
  experienceLevel: string
): string {
  return `You are an expert technical interviewer with 15 years of experience hiring for ${jobRole} positions. Generate 5 interview questions for a ${experienceLevel}-level ${jobRole} candidate.

## Requirements

1. **Question Mix** (strict):
   - 2 Behavioral questions (past experiences, teamwork, conflict resolution)
   - 2 Technical questions (role-specific skills, problem-solving, architecture)
   - 1 Situational question (hypothetical scenario relevant to the role)

2. **Role Specificity**: Questions must be tailored to a ${jobRole} role. Do NOT use generic questions like "tell me about yourself" or "what are your strengths." Every question should require domain knowledge or experience specific to ${jobRole} work.

3. **Experience Level**: Target ${experienceLevel} level. ${getExperienceLevelGuidance(experienceLevel)}

4. **Real-World Focus**: Use realistic scenarios, not textbook definitions. Questions should probe how candidates have handled (or would handle) situations they will actually encounter as a ${jobRole}.

5. **Challenging but Fair**: Questions should make candidates think but not be trick questions or unrealistically difficult.

## Response Format

Respond ONLY with valid JSON. No markdown, no explanations outside JSON. Use this exact structure:

{
  "questions": [
    {
      "id": "q1",
      "question": "Behavioral question text here?",
      "category": "behavioral",
      "difficulty": "medium",
      "context": "Why this question matters for a ${jobRole} role (1-2 sentences)",
      "followUpPrompts": ["Follow-up 1?", "Follow-up 2?"]
    }
  ]
}

Category must be one of: "technical", "behavioral", "situational", "culture_fit"
Difficulty must be one of: "easy", "medium", "hard"
Include exactly 5 questions in the order: behavioral, behavioral, technical, technical, situational.`;
}

/**
 * Generates a prompt to grade a candidate's interview answer.
 * Uses encouraging but honest scoring for practice purposes.
 */
export function gradeInterviewAnswer(
  question: string,
  answer: string,
  jobRole: string
): string {
  return `You are an expert technical interviewer with 15 years of experience hiring for ${jobRole} positions. Evaluate this candidate's answer to an interview question. This is a PRACTICE interview — your goal is to help the candidate learn and improve, not to screen them out.

## Grading Scale (be generous — this is practice, not a hiring decision)

- 1-3 Poor: Missed key points, unclear, irrelevant, or extremely brief
- 4-5 Fair: Basic understanding shown but lacking depth, specific examples, or structure
- 6-7 Good: Solid answer with specific examples, reasonable structure, good understanding
- 8-9 Excellent: Comprehensive, well-structured, strong specific examples, shows expertise
- 10 Outstanding: Exceeds expectations, demonstrates leadership/strategic thinking, memorable answer

Bias toward encouragement. If the answer shows effort and some understanding, score at least 5. Reserve scores below 4 for answers that are clearly off-topic or show no effort.

## The Interview Question
"""
${question}
"""

## Candidate's Answer
"""
${answer}
"""

## Response Format

Respond ONLY with valid JSON. No markdown, no explanations outside JSON. Use this exact structure:

{
  "score": 7,
  "strengths": [
    "Specific strength with detail (e.g., 'You provided a concrete example of refactoring the auth service, which shows hands-on experience')",
    "Another strength"
  ],
  "improvements": [
    "Actionable improvement (e.g., 'Include metrics — mention how your solution improved performance by 40%')",
    "Another actionable improvement"
  ],
  "modelAnswer": "An exemplary answer that a top candidate would give. This should be detailed, structured (STAR method for behavioral), and demonstrate expertise specific to a ${jobRole} role. Write it as if spoken naturally in an interview.",
  "detailedFeedback": "2-3 sentences of personalized feedback. Start with what they did well, then specific suggestions for improvement. Be encouraging and constructive."
}

Score must be an integer 1-10. Provide 2-3 strengths and 2-3 improvements. The model answer should be exemplary — what a top candidate would say.`;
}

/**
 * Generates a prompt for overall interview feedback based on all Q&A pairs.
 */
export function generateInterviewFeedback(
  interviewData: { question: string; answer: string; score: number }[]
): string {
  const qaSummary = interviewData
    .map(
      (qa, i) =>
        `Question ${i + 1}: ${qa.question}\nAnswer: ${qa.answer}\nScore: ${qa.score}/10`
    )
    .join("\n\n---\n\n");

  return `You are an expert interview coach with 15 years of experience helping candidates improve. Review this complete practice interview and provide comprehensive, actionable feedback.

## Interview Transcript

${qaSummary}

## Instructions

1. **Be Encouraging**: This is practice. Frame feedback as growth opportunities.
2. **Be Specific**: Reference actual answers from the transcript, not generic advice.
3. **Be Actionable**: Every piece of advice should be something the candidate can practice.

## Response Format

Respond ONLY with valid JSON. No markdown, no explanations outside JSON. Use this exact structure:

{
  "overallScore": 7.5,
  "summary": "2-3 sentences summarizing overall performance. Highlight the strongest aspect and the main area for growth.",
  "topStrengths": [
    "Specific strength backed by evidence from their answers",
    "Another strength",
    "A third strength if present"
  ],
  "keyImprovements": [
    "Specific, actionable improvement with context from their answers",
    "Another improvement",
    "A third improvement if needed"
  ],
  "roleSpecificAdvice": "Tailored advice for their target role based on the types of questions they answered well or struggled with. 2-3 sentences.",
  "nextSteps": [
    "Concrete next step (e.g., 'Practice the STAR method for behavioral questions — structure your answers with Situation, Task, Action, Result')",
    "Another next step (e.g., 'Review system design fundamentals — your architecture answer lacked discussion of scalability and trade-offs')"
  ]
}

overallScore should be the average of individual scores rounded to 1 decimal place, possibly adjusted up by 0.5 if they showed strong improvement during the interview. Include 2-3 topStrengths and 2-3 keyImprovements.`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getExperienceLevelGuidance(level: string): string {
  const guidance: Record<string, string> = {
    junior:
      "Focus on foundational knowledge, willingness to learn, basic problem-solving, and collaboration. Questions should test core concepts and growth potential, not deep architectural decisions.",
    mid:
      "Focus on independent execution, mentoring junior colleagues, system design at moderate scale, and balancing technical debt with delivery. Questions should test real-world judgment.",
    senior:
      "Focus on architectural decisions, cross-team leadership, technical strategy, trade-off analysis, and handling ambiguity. Questions should probe depth of experience and ability to influence without authority.",
    lead:
      "Focus on team leadership, technical vision, organizational impact, stakeholder management, and building engineering culture. Questions should test ability to drive outcomes through others.",
    staff:
      "Focus on org-wide technical strategy, cross-functional influence, long-term technical planning, and handling the most complex technical challenges. Questions should test executive presence and strategic thinking.",
    principal:
      "Focus on company-wide technical direction, industry-level expertise, innovation, and shaping engineering culture at scale. Questions should demonstrate thought leadership.",
  };

  const normalized = level.toLowerCase().trim();
  return (
    guidance[normalized] ??
    "Adjust difficulty to be appropriate for the stated experience level."
  );
}
