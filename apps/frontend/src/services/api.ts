// services/api.ts
import axios from "axios";
import { BASE_URL, QUERY_ENDPOINT } from "../utils/constants";

export interface RunRequest {
  prompt: string;
  tool: "calculator" | "web-search";
  userId: string;
}

export interface RunResponse {
  response: object;
  summary: string;
  totalTokenCount: number;
  timestamp: string;
}

export const runPrompt = async (data: RunRequest): Promise<RunResponse> => {
  try {
    const res = await axios.post<RunResponse>(
      `${BASE_URL}/api/v1/${QUERY_ENDPOINT}`,
      data
    );
    // console.log("line 20", res.data);
    return res.data;
  } catch (error: unknown) {
    console.error("Error in runPrompt:", error);
    throw new Error("An unexpected error occurred.");
  }
};
