/**
 * Assessment Prompts - Rekrut AI Skill Assessment Engine
 *
 * Production-ready prompts for GPT-4o-mini to generate skill assessments
 * (7 MCQ + 3 open-ended) and grade open-ended answers against rubrics.
 *
 * Cost-optimized: All prompts use GPT-4o-mini ($0.15/M input, $0.60/M output)
 */

/**
 * System message pattern for the assessment engine.
 * Use as: { role: "system", content: getAssessmentSystemMessage(jobRole) }
 */
export function getAssessmentSystemMessage(jobRole: string): string {
  return `You are a senior technical assessment designer with 15 years of experience creating hiring assessments for ${jobRole} positions at leading technology companies. You design fair, comprehensive, and role-relevant assessments that accurately measure practical skills. You always respond in valid JSON format with no markdown or explanatory text outside the JSON.`;
}

/**
 * Generates a prompt to create a 10-question skill assessment.
 * Composition: 7 multiple-choice + 3 open-ended questions.
 */
export function generateSkillAssessment(
  jobRole: string,
  experienceLevel: string
): string {
  return `You are a senior technical assessment designer with 15 years of experience creating hiring assessments for ${jobRole} positions. Create a 10-question skill assessment for a ${experienceLevel}-level ${jobRole}.

## Assessment Composition (strict)

- 7 Multiple Choice Questions (MCQ): Test specific knowledge, best practices, problem diagnosis, tool familiarity, and decision-making
- 3 Open-Ended Questions: Test depth of understanding, communication, architecture/design thinking, and problem-solving approach

## Question Design Principles

1. **Role-Specific**: Every question must be directly relevant to ${jobRole} work. No generic CS trivia or puzzles unrelated to the role.
2. **Practical Focus**: Test applied knowledge, not memorization. MCQs should present realistic scenarios requiring judgment.
3. **Experience-Appropriate**: Target ${experienceLevel} level. ${getAssessmentLevelGuidance(experienceLevel)}
4. **No Tricks**: Distractors in MCQs should be plausible mistakes, not intentionally misleading.
5. **Balanced Coverage**: Cover different skill areas relevant to the role (e.g., for a Frontend Engineer: React, performance, accessibility, state management, testing, CSS, build tools).
6. **Progressive Difficulty**: Mix of easy (2-3), medium (4-5), and hard (2-3) questions.

## Open-Ended Question Rubrics

Each open-ended question must include a rubric with:
- 3-5 specific grading criteria
- maxPoints per question (10 or 20 points)
- A sampleGoodAnswer that demonstrates what a strong response looks like

## Response Format

Respond ONLY with valid JSON. No markdown, no explanations outside JSON. Use this exact structure:

{
  "title": "${jobRole} Skills Assessment",
  "description": "A comprehensive assessment evaluating key skills for ${experienceLevel}-level ${jobRole} positions. Covers [list 3-4 skill areas]. Estimated time: 45-60 minutes.",
  "questions": [
    {
      "id": "mcq1",
      "type": "multiple_choice",
      "question": "Scenario-based MCQ question text? Present a realistic situation and ask what the candidate should do.",
      "options": [
        "A) A plausible but incorrect approach",
        "B) Another plausible but incorrect approach",
        "C) The correct answer — best practice for the scenario",
        "D) A clearly wrong or dangerous approach"
      ],
      "correctAnswer": "C",
      "explanation": "Why C is correct and why others are wrong. 2-3 sentences of educational content.",
      "difficulty": "medium",
      "skillArea": "Specific skill area (e.g., 'System Design', 'React Patterns', 'Database Optimization')"
    },
    {
      "id": "oe1",
      "type": "open_ended",
      "question": "Open-ended question that requires explanation, design, or analysis. Should require multi-paragraph response.",
      "rubric": {
        "criteria": [
          "Criterion 1: Specific thing to evaluate (e.g., 'Identifies key architectural constraints')",
          "Criterion 2: Another evaluation dimension",
          "Criterion 3: Another evaluation dimension"
        ],
        "maxPoints": 10
      },
      "sampleGoodAnswer": "A strong response that demonstrates expertise. This should be detailed, well-structured, and show the depth of knowledge expected at ${experienceLevel} level. 3-5 sentences."
    }
  ]
}

Rules:
- MCQ ids: mcq1 through mcq7
- Open-ended ids: oe1 through oe3
- correctAnswer must be the letter (A, B, C, or D) matching the correct option
- difficulty must be one of: "easy", "medium", "hard"
- Include exactly 7 MCQs and exactly 3 open-ended questions (10 total)
- skillArea for each question should be specific and role-relevant`;
}

/**
 * Generates a prompt to grade an open-ended assessment answer against a rubric.
 */
export function gradeOpenEndedAnswer(
  question: string,
  rubric: { criteria: string[]; maxPoints: number },
  answer: string
): string {
  const rubricText = rubric.criteria
    .map((c, i) => `${i + 1}. ${c}`)
    .join("\n");

  return `You are a senior technical assessor with 15 years of experience evaluating ${
    rubric.criteria[0]?.split(":")[0] ?? "technical"
  } skills. Grade this open-ended assessment answer against the provided rubric. This is a PRACTICE assessment — provide constructive feedback that helps the candidate improve.

## The Question
"""
${question}
"""

## Grading Rubric (Total: ${rubric.maxPoints} points)
${rubricText}

## Candidate's Answer
"""
${answer}
"""

## Grading Instructions

1. **Be Generous**: This is practice, not a gate. If the answer shows understanding and effort, award at least 50% of points.
2. **Partial Credit**: Award points for partially correct answers. Don't require perfection.
3. **Criteria-Based**: Score each criterion independently. A weak answer in one area shouldn't tank the entire score.
4. **Constructive Feedback**: Every score should include feedback explaining why points were awarded or withheld.

## Response Format

Respond ONLY with valid JSON. No markdown, no explanations outside JSON. Use this exact structure:

{
  "score": 7,
  "criteriaScores": [
    {
      "criterion": "Exact criterion text from rubric",
      "score": 8,
      "maxPoints": 3,
      "feedback": "Specific feedback on this criterion. What they did well or what was missing."
    }
  ],
  "overallFeedback": "2-3 sentences of encouraging, constructive feedback. Highlight what they did well first, then 1-2 specific suggestions for improvement.",
  "modelAnswer": "An exemplary answer that would earn full points. This should demonstrate the depth, clarity, and expertise expected. Write it as a natural, well-structured response."
}

Score must be an integer from 0 to ${rubric.maxPoints}. The sum of all criteria maxPoints should equal ${rubric.maxPoints}. Distribute maxPoints fairly across criteria (e.g., 3+4+3 = 10 or 4+4+4+4+4 = 20).`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAssessmentLevelGuidance(level: string): string {
  const guidance: Record<string, string> = {
    junior:
      "Focus on core concepts, common tools, basic debugging, and standard practices. Avoid architecture questions or advanced optimization. Test for solid foundations and learning ability.",
    mid:
      "Include some architecture questions, performance considerations, and trade-off analysis. Test for independent decision-making and ability to explain reasoning.",
    senior:
      "Include system design, scalability, cross-system impact, and mentoring considerations. Test for strategic thinking and ability to handle ambiguity.",
    lead:
      "Focus on technical leadership, team-level decisions, and balancing technical excellence with business delivery. Test for ability to drive outcomes through technical direction.",
    staff:
      "Include org-wide technical strategy, long-term technical planning, and handling the most complex technical challenges. Test for executive presence in technical decisions.",
    principal:
      "Focus on company-wide technical direction, industry-level expertise, innovation, and shaping engineering culture. Test for thought leadership.",
  };

  const normalized = level.toLowerCase().trim();
  return (
    guidance[normalized] ??
    "Adjust question difficulty to be appropriate for the stated experience level. Include a mix of conceptual and practical questions."
  );
}
