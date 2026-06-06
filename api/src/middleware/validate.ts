import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiResponse } from "../types";

/**
 * Zod validation middleware factory
 * Validates request body against a Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const formattedErrors = result.error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        const response: ApiResponse = {
          success: false,
          error: `Validation failed: ${formattedErrors.map((e) => `${e.path}: ${e.message}`).join(", ")}`,
          data: { errors: formattedErrors },
        };

        res.status(400).json(response);
        return;
      }

      // Attach validated data to request
      req.body = result.data;
      next();
    } catch (error) {
      console.error("Validation middleware error:", error);
      const response: ApiResponse = {
        success: false,
        error: "Validation error occurred.",
      };
      res.status(400).json(response);
    }
  };
}

/**
 * Zod validation middleware for route parameters
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.params);

      if (!result.success) {
        const formattedErrors = result.error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        const response: ApiResponse = {
          success: false,
          error: `Invalid parameters: ${formattedErrors.map((e) => `${e.path}: ${e.message}`).join(", ")}`,
          data: { errors: formattedErrors },
        };

        res.status(400).json(response);
        return;
      }

      req.params = result.data as Record<string, string>;
      next();
    } catch (error) {
      console.error("Params validation error:", error);
      const response: ApiResponse = {
        success: false,
        error: "Invalid URL parameters.",
      };
      res.status(400).json(response);
    }
  };
}

/**
 * Zod validation middleware for query parameters
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const formattedErrors = result.error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        const response: ApiResponse = {
          success: false,
          error: `Invalid query: ${formattedErrors.map((e) => `${e.path}: ${e.message}`).join(", ")}`,
          data: { errors: formattedErrors },
        };

        res.status(400).json(response);
        return;
      }

      req.query = result.data as unknown as typeof req.query;
      next();
    } catch (error) {
      console.error("Query validation error:", error);
      const response: ApiResponse = {
        success: false,
        error: "Invalid query parameters.",
      };
      res.status(400).json(response);
    }
  };
}

/**
 * Format ZodError into a readable string
 */
export function formatZodError(error: ZodError): string {
  return error.errors
    .map((err) => {
      const path = err.path.length > 0 ? err.path.join(".") : "input";
      return `${path}: ${err.message}`;
    })
    .join("; ");
}
