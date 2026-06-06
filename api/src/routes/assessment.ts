import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { validateBody, validateParams } from "../middleware/validate";
import {
  generateAssessment,
  gradeMCQ,
  gradeOpenEnded,
  calculateOverallScore,
  getAssessmentWithResponses,
  getUserAssessmentHistory,
  verifyAssessmentOwnership,
} from "../services/assessmentService";
import { ApiResponse, AuthenticatedRequest } from "../types";

const router = Router();

// Validation schemas
const createAssessmentSchema = z.object({
  jobRole: z.string().min(1, "Job role is required").max(100),
  experienceLevel: z.enum(["entry", "junior", "mid", "senior", "lead", "principal"], {
    errorMap: () => ({ message: "Experience level must be one of: entry, junior, mid, senior, lead, principal" }),
  }),
});

const submitMCQSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  answer: z.string().min(1, "Answer is required").max(1, "MCQ answer must be a single character (A, B, C, or D)"),
});

const submitOpenEndedSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  answer: z.string().min(1, "Answer is required").max(10000, "Answer is too long"),
});

const submitAnswersSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1, "Question ID is required"),
      answer: z.string().min(1, "Answer is required"),
    })
  ).min(1, "At least one answer is required"),
});

const assessmentIdParamsSchema = z.object({
  assessmentId: z.string().min(1, "Assessment ID is required"),
});

/**
 * POST /api/assessment/create
 * Create a new assessment
 */
router.post(
  "/create",
  authMiddleware,
  validateBody(createAssessmentSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { jobRole, experienceLevel } = req.body;
      const userId = req.user!.id;

      const result = await generateAssessment(userId, jobRole, experienceLevel);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Create assessment error:", error);

      const isOpenAIError =
        error instanceof Error &&
        (error.message.includes("AI service") || error.message.includes("OpenAI"));

      const response: ApiResponse = {
        success: false,
        error: isOpenAIError
          ? "AI service is temporarily unavailable. Please try again in a moment."
          : error instanceof Error
            ? error.message
            : "Failed to create assessment",
      };

      res.status(isOpenAIError ? 503 : 500).json(response);
    }
  }
);

/**
 * POST /api/assessment/:assessmentId/submit-mcq
 * Submit an MCQ answer
 */
router.post(
  "/:assessmentId/submit-mcq",
  authMiddleware,
  validateParams(assessmentIdParamsSchema),
  validateBody(submitMCQSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { assessmentId } = req.params;
      const { questionId, answer } = req.body;
      const userId = req.user!.id;

      const isOwner = await verifyAssessmentOwnership(assessmentId, userId);
      if (!isOwner) {
        const response: ApiResponse = {
          success: false,
          error: "Assessment not found or access denied.",
        };
        res.status(404).json(response);
        return;
      }

      const result = await gradeMCQ(questionId, answer);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Submit MCQ error:", error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : "Failed to grade MCQ",
      };

      res.status(500).json(response);
    }
  }
);

/**
 * POST /api/assessment/:assessmentId/submit-open
 * Submit an open-ended answer
 */
router.post(
  "/:assessmentId/submit-open",
  authMiddleware,
  validateParams(assessmentIdParamsSchema),
  validateBody(submitOpenEndedSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { assessmentId } = req.params;
      const { questionId, answer } = req.body;
      const userId = req.user!.id;

      const isOwner = await verifyAssessmentOwnership(assessmentId, userId);
      if (!isOwner) {
        const response: ApiResponse = {
          success: false,
          error: "Assessment not found or access denied.",
        };
        res.status(404).json(response);
        return;
      }

      const result = await gradeOpenEnded(questionId, answer);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Submit open-ended error:", error);

      const isOpenAIError =
        error instanceof Error &&
        (error.message.includes("AI service") || error.message.includes("OpenAI"));

      const response: ApiResponse = {
        success: false,
        error: isOpenAIError
          ? "AI grading service is temporarily unavailable. Your answer has been saved."
          : error instanceof Error
            ? error.message
            : "Failed to grade answer",
      };

      res.status(isOpenAIError ? 503 : 500).json(response);
    }
  }
);

/**
 * POST /api/assessment/:assessmentId/submit
 * Submit all answers at once and calculate final score
 */
router.post(
  "/:assessmentId/submit",
  authMiddleware,
  validateParams(assessmentIdParamsSchema),
  validateBody(submitAnswersSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { assessmentId } = req.params;
      const { answers } = req.body;
      const userId = req.user!.id;

      const isOwner = await verifyAssessmentOwnership(assessmentId, userId);
      if (!isOwner) {
        const response: ApiResponse = {
          success: false,
          error: "Assessment not found or access denied.",
        };
        res.status(404).json(response);
        return;
      }

      // Get all questions to determine type
      const assessment = await getAssessmentWithResponses(assessmentId);
      if (!assessment) {
        const response: ApiResponse = {
          success: false,
          error: "Assessment not found.",
        };
        res.status(404).json(response);
        return;
      }

      // Process each answer
      const results: Array<{
        questionId: string;
        isCorrect?: boolean;
        aiScore?: number;
        feedback?: string;
      }> = [];

      for (const answer of answers) {
        const question = assessment.questions.find((q) => q.id === answer.questionId);
        if (!question) continue;

        if (question.type === "MULTIPLE_CHOICE") {
          const mcqResult = await gradeMCQ(answer.questionId, answer.answer);
          results.push({
            questionId: answer.questionId,
            isCorrect: mcqResult.isCorrect,
          });
        } else {
          const openResult = await gradeOpenEnded(answer.questionId, answer.answer);
          results.push({
            questionId: answer.questionId,
            aiScore: openResult.score,
            feedback: openResult.feedback,
          });
        }
      }

      // Calculate overall score
      const scoreResult = await calculateOverallScore(assessmentId);

      const response: ApiResponse<typeof scoreResult & { results: typeof results }> = {
        success: true,
        data: {
          ...scoreResult,
          results,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Submit assessment error:", error);

      const isOpenAIError =
        error instanceof Error &&
        (error.message.includes("AI service") || error.message.includes("OpenAI"));

      const response: ApiResponse = {
        success: false,
        error: isOpenAIError
          ? "AI grading is temporarily unavailable. Your answers have been saved."
          : error instanceof Error
            ? error.message
            : "Failed to submit assessment",
      };

      res.status(isOpenAIError ? 503 : 500).json(response);
    }
  }
);

/**
 * GET /api/assessment/:assessmentId
 * Get assessment details with questions
 */
router.get(
  "/:assessmentId",
  authMiddleware,
  validateParams(assessmentIdParamsSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { assessmentId } = req.params;
      const userId = req.user!.id;

      const isOwner = await verifyAssessmentOwnership(assessmentId, userId);
      if (!isOwner) {
        const response: ApiResponse = {
          success: false,
          error: "Assessment not found or access denied.",
        };
        res.status(404).json(response);
        return;
      }

      const assessment = await getAssessmentWithResponses(assessmentId);

      if (!assessment) {
        const response: ApiResponse = {
          success: false,
          error: "Assessment not found.",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof assessment> = {
        success: true,
        data: assessment,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Get assessment error:", error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch assessment",
      };

      res.status(500).json(response);
    }
  }
);

/**
 * GET /api/assessment/user/history
 * Get user's assessment history
 */
router.get(
  "/user/history",
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;

      const assessments = await getUserAssessmentHistory(userId);

      const response: ApiResponse<typeof assessments> = {
        success: true,
        data: assessments,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Get assessment history error:", error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch assessment history",
      };

      res.status(500).json(response);
    }
  }
);

export default router;
