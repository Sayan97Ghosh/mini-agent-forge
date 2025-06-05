import express from "express";
import { RunRequestSchema } from "../validators/runSchema";
import { performWebSearch } from "../services/webSearch";
import { evaluateExpression } from "../services/calculator";
import { generateFriendlyReply } from "../llm/geminiHelper";

const router = express.Router();

router.post("/", async (req: any, res: any) => {
  const parseResult = RunRequestSchema.safeParse(req.body);
  if (!parseResult.success) return res.status(400).json({ error: "Invalid input" });
  const { prompt, tool } = parseResult.data;

  try {
    let responseData: any;

    if (tool === "web-search") {
      const results = await performWebSearch(prompt);
      const { text, totalTokenCount } = await generateFriendlyReply(
        "search",
        prompt,
        results
      );
      responseData = {
        prompt,
        tool,
        results,
        totalTokenCount,
        summary: text,
      };
    } else if (tool === "calculator") {
      const result = evaluateExpression(prompt).toString();
      const { text, totalTokenCount } = await generateFriendlyReply(
        "calc",
        prompt,
        result
      );
      responseData = { prompt, tool, result, totalTokenCount, summary: text };
    }
    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
