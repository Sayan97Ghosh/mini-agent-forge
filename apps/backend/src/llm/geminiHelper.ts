import { GoogleGenAI } from "@google/genai";
import { GeminiResponse } from "../utils/types";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "";

if (!GEMINI_API_KEY || GEMINI_MODEL) {
  throw new Error("GEMINI_API_KEY or GEMINI_MODEL is not set in environment variables.");
}

const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function generateGeminiResponse(
  prompt: string,
  tool: string
): Promise<GeminiResponse> {
  try {
    const fullPrompt = `Use the "${tool}" tool to help answer this: ${prompt}`;

    const result = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
    });

    const responseText = result.text ?? "";
    let tokensUsed = 0;
    if (result.usageMetadata) {
      tokensUsed = result.usageMetadata.totalTokenCount || 0;
    } else {
      console.warn(
        "usageMetadata not found in Gemini API response. Token count may not be accurate."
      );
    }

    console.log("Full Gemini API Response:", result);
    console.log("Tokens Used:", tokensUsed);

    return {
      response: responseText,
      tokensUsed: tokensUsed,
    };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}
