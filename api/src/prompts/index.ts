/**
 * Rekrut AI — Prompt Engineering Layer
 * ======================================
 * Central export for all AI prompts used by the Interview Coach,
 * Skill Assessment, and Profile Matching features.
 *
 * All prompts are optimized for GPT-4o-mini:
 *   Input:  $0.15 / million tokens
 *   Output: $0.60 / million tokens
 *
 * Usage:
 *   import { generateInterviewQuestions, gradeInterviewAnswer } from './prompts';
 *
 *   const prompt = generateInterviewQuestions('Frontend Engineer', 'senior');
 *   const response = await openai.chat.completions.create({
 *     model: 'gpt-4o-mini',
 *     messages: [
 *       { role: 'system', content: getInterviewSystemMessage('Frontend Engineer') },
 *       { role: 'user', content: prompt },
 *     ],
 *     response_format: { type: 'json_object' },
 *   });
 */

// Interview Coach Prompts
export {
  getInterviewSystemMessage,
  generateInterviewQuestions,
  gradeInterviewAnswer,
  generateInterviewFeedback,
} from "./interviewPrompts";

// Skill Assessment Prompts
export {
  getAssessmentSystemMessage,
  generateSkillAssessment,
  gradeOpenEndedAnswer,
} from "./assessmentPrompts";

// Profile Matching Prompts
export {
  getMatchingSystemMessage,
  generateProfileSummary,
  calculateJobMatch,
} from "./matchingPrompts";
