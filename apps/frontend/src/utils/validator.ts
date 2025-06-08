export interface HistoryEntry {
  question: string;
  tool: "web-search" | "calculator";
  response: string;
  displayedResponse: string;
  tokens: number | null;
  loading: boolean;
  responseTimeStamp: string;
}