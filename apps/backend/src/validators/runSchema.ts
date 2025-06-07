import { z } from "zod";

export const RunRequestSchema = z.object({
  prompt: z.string().max(500),
  tool: z.enum(['web-search', 'calculator']),
  userId:z.string().max(16)
});

export type RunRequest = z.infer<typeof RunRequestSchema>;