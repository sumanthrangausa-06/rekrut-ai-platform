import { Response, NextFunction } from "express";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { AuthenticatedRequest, AuthenticatedUser, UserRole, ApiResponse } from "../types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabase;
}

/**
 * Authentication middleware - verifies Bearer token with Supabase
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const response: ApiResponse = {
        success: false,
        error: "Authentication required. Please provide a valid Bearer token.",
      };
      res.status(401).json(response);
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid token format.",
      };
      res.status(401).json(response);
      return;
    }

    // In development mode, allow a mock token for testing
    if (process.env.NODE_ENV === "development" && token === "mock-token") {
      req.user = {
        id: "dev-user-id",
        email: "dev@rekrut.ai",
        role: UserRole.CANDIDATE,
        supabaseUid: "dev-supabase-uid",
      };
      next();
      return;
    }

    const sb = getSupabase();
    const { data, error } = await sb.auth.getUser(token);

    if (error || !data.user) {
      console.error("Supabase auth error:", error);
      const response: ApiResponse = {
        success: false,
        error: "Invalid or expired token. Please sign in again.",
      };
      res.status(401).json(response);
      return;
    }

    // Find or create user in our database
    let dbUser = await prisma.user.findUnique({
      where: { supabaseUid: data.user.id },
    });

    if (!dbUser) {
      // Create user if not exists
      dbUser = await prisma.user.create({
        data: {
          supabaseUid: data.user.id,
          email: data.user.email || "",
          firstName: data.user.user_metadata?.first_name || "",
          lastName: data.user.user_metadata?.last_name || "",
        },
      });
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      supabaseUid: dbUser.supabaseUid,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Authentication failed. Please try again.",
    };
    res.status(500).json(response);
  }
}

/**
 * Optional auth - attaches user if token is valid, but doesn't require it
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    if (process.env.NODE_ENV === "development" && token === "mock-token") {
      req.user = {
        id: "dev-user-id",
        email: "dev@rekrut.ai",
        role: UserRole.CANDIDATE,
        supabaseUid: "dev-supabase-uid",
      };
      next();
      return;
    }

    const sb = getSupabase();
    const { data, error } = await sb.auth.getUser(token);

    if (error || !data.user) {
      next();
      return;
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUid: data.user.id },
    });

    if (dbUser) {
      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        supabaseUid: dbUser.supabaseUid,
      };
    }

    next();
  } catch {
    // Silently continue without auth
    next();
  }
}

/**
 * Role-based access control middleware
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: "Authentication required.",
      };
      res.status(401).json(response);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      const response: ApiResponse = {
        success: false,
        error: "Insufficient permissions for this action.",
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
}
