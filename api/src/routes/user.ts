import { Router } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { ApiResponse, AuthenticatedRequest } from "../types";

const prisma = new PrismaClient();
const router = Router();

// Validation schemas
const syncUserSchema = z.object({
  supabaseUid: z.string().min(1, "Supabase UID is required"),
  email: z.string().email("Valid email is required"),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  role: z.enum(["CANDIDATE", "RECRUITER", "ADMIN"]).optional(),
});

const updateProfileSchema = z.object({
  resumeText: z.string().max(50000, "Resume text is too long").optional(),
  skills: z.array(z.string().max(50)).max(50, "Maximum 50 skills allowed").optional(),
  experienceLevel: z.enum(["entry", "junior", "mid", "senior", "lead", "principal"]).optional(),
  currentRole: z.string().max(100).optional(),
  desiredRole: z.string().max(100).optional(),
  yearsOfExperience: z.number().int().min(0).max(60).optional(),
});

/**
 * POST /api/user/sync
 * Sync user from Supabase auth to our database
 */
router.post(
  "/sync",
  validateBody(syncUserSchema),
  async (req, res) => {
    try {
      const { supabaseUid, email, firstName, lastName, role } = req.body;

      // Upsert user - create if not exists, update if exists
      const user = await prisma.user.upsert({
        where: { supabaseUid },
        update: {
          email,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          role: role || undefined,
        },
        create: {
          supabaseUid,
          email,
          firstName: firstName || "",
          lastName: lastName || "",
          role: role || "CANDIDATE",
        },
      });

      // Create empty candidate profile if it doesn't exist
      await prisma.candidateProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          skills: [],
        },
      });

      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Sync user error:", error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : "Failed to sync user",
      };

      res.status(500).json(response);
    }
  }
);

/**
 * PUT /api/user/profile
 * Update candidate profile
 */
router.put(
  "/profile",
  authMiddleware,
  validateBody(updateProfileSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const updateData = req.body;

      const profile = await prisma.candidateProfile.upsert({
        where: { userId },
        update: {
          resumeText: updateData.resumeText,
          skills: updateData.skills,
          experienceLevel: updateData.experienceLevel,
          currentRole: updateData.currentRole,
          desiredRole: updateData.desiredRole,
          yearsOfExperience: updateData.yearsOfExperience,
        },
        create: {
          userId,
          resumeText: updateData.resumeText || null,
          skills: updateData.skills || [],
          experienceLevel: updateData.experienceLevel || null,
          currentRole: updateData.currentRole || null,
          desiredRole: updateData.desiredRole || null,
          yearsOfExperience: updateData.yearsOfExperience || null,
        },
      });

      const response: ApiResponse<typeof profile> = {
        success: true,
        data: profile,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Update profile error:", error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update profile",
      };

      res.status(500).json(response);
    }
  }
);

/**
 * GET /api/user/profile
 * Get current user's profile
 */
router.get(
  "/profile",
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        },
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: "User not found.",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Get profile error:", error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch profile",
      };

      res.status(500).json(response);
    }
  }
);

/**
 * GET /api/user/me
 * Get current authenticated user info
 */
router.get(
  "/me",
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        const response: ApiResponse = {
          success: false,
          error: "User not found.",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Get user error:", error);

      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch user",
      };

      res.status(500).json(response);
    }
  }
);

export default router;
