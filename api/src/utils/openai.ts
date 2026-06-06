import OpenAI from "openai";
import { ApiResponse } from "../types";

if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY is not set. AI features will not work.");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const AI_MODEL = "gpt-4o-mini";

/**
 * Wrapper for OpenAI API calls with error handling
 */
export async function callOpenAI<T>(
  fn: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; response: ApiResponse }> {
  try {
    const result = await fn();
    return { success: true, data: result };
  } catch (error) {
    console.error("OpenAI API error:", error);

    const errorMessage =
      error instanceof OpenAI.APIError
        ? `AI service error: ${error.status} - ${error.message}`
        : "AI service is temporarily unavailable. Please try again later.";

    return {
      success: false,
      response: {
        success: false,
        error: errorMessage,
      },
    };
  }
}

/**
 * Parse JSON response from OpenAI with safety fallback
 */
export function safeJsonParse<T>(content: string | null, fallback: T): T {
  if (!content) return fallback;
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    return JSON.parse(jsonString) as T;
  } catch {
    console.warn("Failed to parse OpenAI JSON response, using fallback. Content:", content);
    return fallback;
  }
}
