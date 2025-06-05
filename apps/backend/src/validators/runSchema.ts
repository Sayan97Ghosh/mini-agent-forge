import { z } from "zod";

export const RunRequestSchema = z.object({
  prompt: z.string().max(500),
  tool: z.enum(['web-search', 'calculator']),
});

export type RunRequest = z.infer<typeof RunRequestSchema>;