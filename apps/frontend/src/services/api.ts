// services/api.ts
import axios from "axios";
import { queryEndpoint } from "../utils/constants";

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
const port:number = import.meta.env.VITE_PORT || 8082 ;
const baseUrl: string = import.meta.env.VITE_MODE == "development" ? `http://localhost:${port}`: "Example of production base URL";
export const runPrompt = async (data: RunRequest): Promise<RunResponse> => {
  try {
    const res = await axios.post<RunResponse>(
      `${baseUrl}/api/v1/${queryEndpoint}`,
      data
    );
    // console.log("line 20", res.data);
    return res.data;
  } catch (error: unknown) {
    console.error("Error in runPrompt:", error);
    throw new Error("An unexpected error occurred.");
  }
};
