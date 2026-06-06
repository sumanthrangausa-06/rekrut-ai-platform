import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import { validateBody, validateParams } from "../middleware/validate";
import {
  generateQuestions,
  gradeAnswer,
  getInterviewWithResponses,
  getUserInterviewHistory,
  getInterviewFeedback,
  verifyInterviewOwnership,
} from "../services/interviewService";
import { ApiResponse } from "../types";
import { AuthenticatedRequest } from "../types";

const router = Router();

// Validation schemas
const startInterviewSchema = z.object({
  jobRole: z.string().min(1, "Job role is required").max(100),
  experienceLevel: z.enum(["entry", "junior", "mid", "senior", "lead", "principal"], {
    errorMap: () => ({ message: "Experience level must be one of: entry, junior, mid, senior, lead, principal" }),
  }),
});

const submitAnswerSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  answer: z.string().min(1, "Answer is required").max(10000, "Answer is too long"),
});

const interviewIdParamsSchema = z.object({
  interviewId: z.string().min(1, "Interview ID is required"),
});

/**
 * POST /api/interview/start
 * Start a new interview session and generate questions
 */
router.post(
  "/start",
  authMiddleware,
  validateBody(startInterviewSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { jobRole, experienceLevel } = req.body;
      const userId = req.user!.id;

      const result = await generateQuestions(userId, jobRole, experienceLevel);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Start interview error:", error);

      const isOpenAIError =
        error instanceof Error &&
        (error.message.includes("AI service") || error.message.includes("OpenAI"));

      const response: ApiResponse = {
        success: false,
        error: isOpenAIError
          ? "AI service is temporarily unavailable. Please try again in a moment."
          : error instanceof Error
            ? error.message
            : "Failed to start interview",
      };

      res.status(isOpenAIError ? 503 : 500).json(response);
    }
  }
);

/**
 * POST /api/interview/:interviewId/answer
 * Submit an answer to an interview question
 */
router.post(
  "/:interviewId/answer",
  authMiddleware,
  validateParams(interviewIdParamsSchema),
  validateBody(submitAnswerSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { interviewId } = req.params;
      const { questionId, answer } = req.body;
      const userId = req.user!.id;

      // Verify ownership
      const isOwner = await verifyInterviewOwnership(interviewId, userId);
      if (!isOwner) {
        const response: ApiResponse = {
          success: false,
          error: "Interview not found or access denied.",
        };
        res.status(404).json(response);
        return;
      }

      const result = await gradeAnswer(questionId, answer);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Submit answer error:", error);

      const isOpenAIError =
        error instanceof Error &&
        (error.message.includes("AI service") || error.message.includes("OpenAI"));

      const response: ApiResponse = {
        success: false,
        error: isOpenAIError
          ? "AI grading service is temporarily unavailable. Your answer has been saved and will be graded shortly."
          : error instanceof Error
            ? error.message
            : "Failed to grade answer",
      };

      res.status(isOpenAIError ? 503 : 500).json(response);
    }
  }
);

/**
 * GET /api/interview/:interviewId
 * Get interview with all questions and responses
 */
router.get(
  "/:interviewId",
  authMiddleware,
  validateParams(interviewIdParamsSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { interviewId } = req.params;
      const userId = req.user!.id;

      const isOwner = await verifyInterviewOwnership(interviewId, userId);
      if (!isOwner) {
        const response: ApiResponse = {
          success: false,
          error: "Interview not found or access denied.",
        };
        res.status(404).json(response);
        return;
      }

      const interview = await getInterviewWithResponses(interviewId);

      if (!interview) {
        const response: ApiResponse = {
          success: false,
          error: "Interview not found.",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof interview> = {
        success: true,
        data: interview,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Get interview error:", error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch interview",
      };

      res.status(500).json(response);
    }
  }
);

/**
 * GET /api/interview/:interviewId/feedback
 * Get final interview feedback
 */
router.get(
  "/:interviewId/feedback",
  authMiddleware,
  validateParams(interviewIdParamsSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { interviewId } = req.params;
      const userId = req.user!.id;

      const isOwner = await verifyInterviewOwnership(interviewId, userId);
      if (!isOwner) {
        const response: ApiResponse = {
          success: false,
          error: "Interview not found or access denied.",
        };
        res.status(404).json(response);
        return;
      }

      const feedback = await getInterviewFeedback(interviewId);

      const response: ApiResponse<typeof feedback> = {
        success: true,
        data: feedback,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Get feedback error:", error);

      const isOpenAIError =
        error instanceof Error &&
        (error.message.includes("AI service") || error.message.includes("OpenAI"));

      const response: ApiResponse = {
        success: false,
        error: isOpenAIError
          ? "AI feedback service is temporarily unavailable. Please try again later."
          : error instanceof Error
            ? error.message
            : "Failed to generate feedback",
      };

      res.status(isOpenAIError ? 503 : 500).json(response);
    }
  }
);

/**
 * GET /api/interview/user/history
 * Get current user's interview history
 */
router.get(
  "/user/history",
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;

      const interviews = await getUserInterviewHistory(userId);

      const response: ApiResponse<typeof interviews> = {
        success: true,
        data: interviews,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Get interview history error:", error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch interview history",
      };

      res.status(500).json(response);
    }
  }
);

export default router;
