// services/api.ts
import axios from "axios";

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

const baseUrl: string =
  process.env.NODE_ENV == "development"
    ? "http://localhost:3000"
    : "Example of production base URL";
console.log("line 16", baseUrl);
const queryEndpoint: string = "query";
export const runPrompt = async (data: RunRequest): Promise<RunResponse> => {
  try {
    const res = await axios.post<RunResponse>(
      `${baseUrl}/api/v1/${queryEndpoint}`,
      data
    );
    console.log("line 20", res.data);
    return res.data;
  } catch (error: unknown) {
    console.error("Error in runPrompt:", error);
    throw new Error("An unexpected error occurred.");
  }
};
