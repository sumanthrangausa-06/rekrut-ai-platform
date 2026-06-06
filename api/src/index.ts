import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { ApiResponse } from "./types";

// Import routes
import interviewRoutes from "./routes/interview";
import assessmentRoutes from "./routes/assessment";
import userRoutes from "./routes/user";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["DATABASE_URL"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`ERROR: Required environment variable ${envVar} is not set.`);
    process.exit(1);
  }
}

// Initialize Prisma
export const prisma = new PrismaClient();

// Create Express app
const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
const NODE_ENV = process.env.NODE_ENV || "development";

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:5173", // Vite dev server
  "http://localhost:4321", // Astro dev server
  "https://rekrutai.vercel.app",
  "https://rekrut.ai",
  "https://www.rekrut.ai",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || NODE_ENV === "development") {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Security middleware
app.use(helmet());

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware (development only)
if (NODE_ENV === "development") {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ─── Health Check ───────────────────────────────────────────

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      version: process.env.npm_package_version || "1.0.0",
    },
  });
});

// ─── API Routes ─────────────────────────────────────────────

app.use("/api/interview", interviewRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/user", userRoutes);

// ─── Root Route ─────────────────────────────────────────────

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      name: "Rekrut AI API",
      version: "1.0.0",
      description: "AI Interview Coach Backend API",
      status: "running",
      documentation: "/health",
    },
  });
});

// ─── 404 Handler ────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: "Route not found. Please check the API documentation.",
  };
  res.status(404).json(response);
});

// ─── Global Error Handler ───────────────────────────────────

interface ErrorWithStatus extends Error {
  status?: number;
  code?: string;
}

app.use((err: ErrorWithStatus, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Global error handler:", err);

  // Handle CORS errors
  if (err.message === "Not allowed by CORS") {
    const response: ApiResponse = {
      success: false,
      error: "CORS policy violation. Origin not allowed.",
    };
    res.status(403).json(response);
    return;
  }

  // Handle Prisma errors
  if (err.code?.startsWith("P")) {
    const prismaErrorMessages: Record<string, string> = {
      P2002: "A record with this value already exists.",
      P2025: "Record not found.",
      P2003: "Related record does not exist.",
      P2014: "Invalid relation operation.",
    };

    const response: ApiResponse = {
      success: false,
      error: prismaErrorMessages[err.code] || "Database error occurred.",
    };
    res.status(400).json(response);
    return;
  }

  // Handle JSON parse errors
  if (err instanceof SyntaxError && "body" in err) {
    const response: ApiResponse = {
      success: false,
      error: "Invalid JSON in request body.",
    };
    res.status(400).json(response);
    return;
  }

  // Generic error
  const statusCode = err.status || 500;
  const response: ApiResponse = {
    success: false,
    error:
      NODE_ENV === "production"
        ? "An unexpected error occurred. Please try again later."
        : err.message || "Internal server error",
  };

  res.status(statusCode).json(response);
});

// ─── Start Server ───────────────────────────────────────────

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
  ╔══════════════════════════════════════════════════╗
  ║          Rekrut AI API Server                    ║
  ║                                                  ║
  ║  Environment: ${NODE_ENV.padEnd(34)}║
  ║  Port: ${String(PORT).padEnd(43)}║
  ║  Health: http://localhost:${PORT}/health${"".padEnd(11)}║
  ╚══════════════════════════════════════════════════╝
  `);
});

// ─── Graceful Shutdown ─────────────────────────────────────

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing HTTP server and Prisma...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Closing HTTP server and Prisma...");
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
