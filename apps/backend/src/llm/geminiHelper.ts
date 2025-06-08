import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "";

if (!GEMINI_API_KEY || !GEMINI_MODEL) {
  throw new Error(
    "GEMINI_API_KEY or GEMINI_MODEL is not set in environment variables."
  );
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
export async function generateFriendlyReply(
  type: "search" | "calc",
  prompt: string,
  result: string | { title: string; link: string }[]
): Promise<{ text: string; totalTokenCount: number }> {
  const instruction = `You are a concise assistant. Respond only in the following format, and do not add anything else.\n`;
  const promptMap = {
    search:
      `${instruction} Based on the prompt "${prompt}", here’s what I found: ` +
      (Array.isArray(result)
        ? result.map((r, i) => `${i + 1}. ${r.title} (${r.link})`).join("\n")
        : result),
    calc: `${instruction} Based on the prompt "${prompt}", the answer to your calculation is ${result}.`,
  };

  const geminiResponse = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: promptMap[type] }] }],
  });
  const text = geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const totalTokenCount = geminiResponse?.usageMetadata?.totalTokenCount || 0;
  // console.log(geminiResponse);
  return { text, totalTokenCount };
}
