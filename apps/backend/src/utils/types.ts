export type ToolType = 'web-search' | 'calculator';

export interface RunRequest {
  prompt: string;
  tool: ToolType;
}

export interface RunLog extends RunRequest {
  userId:string,
  response: string;
  timestamp?: Date;
  tokens?: number;
}

export interface GeminiResponse {
  response: string;
  tokensUsed: number;
}