import { FastifyInstance } from "fastify";
import { RunRequestSchema } from "../validators/runSchema";
import { performWebSearch } from "../services/webSearch";
import { evaluateExpression } from "../services/calculator";
import { generateFriendlyReply } from "../llm/geminiHelper";
import { cacheRun, getCachedRun } from "../db/redis";
import { saveRunLog } from "../db/postgres";
import { RunLog } from "../utils/types";

// Convert Zod schema to JSON Schema for Fastify,

const requestBodySchema = {
  type: "object",
  required: ["prompt", "tool", "userId"],
  properties: {
    prompt: { type: "string", minLength: 1, maxLength: 5000 },
    tool: { type: "string", enum: ["web-search", "calculator"] },
    userId: { type: "string", minLength: 1, maxLength: 100 },
  },
  additionalProperties: false,
};

const successResponseSchema = {
  type: "object",
  properties: {
    prompt: { type: "string" },
    tool: { type: "string" },
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          link: { type: "string" },
        },
        required: ["title", "link"],
      },
    },
    result: { type: "string" },
    totalTokenCount: { type: "number" },
    summary: { type: "string" },
    timestamp: { type: "string" },
  },
};

const errorResponseSchema = {
  type: "object",
  properties: {
    error: { type: "string" },
    code: { type: "string" },
    timestamp: { type: "string" },
  },
};

interface RunRequest {
  prompt: string;
  tool: "web-search" | "calculator";
  userId: string;
}

export default async function routes(fastify: FastifyInstance) {
  // routes for get API server health
  fastify.get(
    "/health",
    {
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              timestamp: { type: "string" },
              uptime: { type: "number" },
            },
          },
        },
      },
    },
    async () => {
      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    }
  );
// routes for Ai response based on user query
  fastify.post<{ Body: RunRequest }>(
    "/query",
    {
      schema: {
        body: requestBodySchema,
        response: {
          200: successResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
      preValidation: async (request, reply) => {
        const parseResult = RunRequestSchema.safeParse(request.body);
        if (!parseResult.success) {
          return reply.code(400).send({
            error: "Invalid input",
            code: "VALIDATION_ERROR",
            timestamp: new Date().toISOString(),
          });
        }
      },
    },
    async (request, reply) => {
      const { prompt, tool, userId } = request.body;
      const startTime = Date.now();

      try {
        const cachedUserQueryAndAiResponse = await getCachedRun(userId, tool, prompt);

        if (cachedUserQueryAndAiResponse) {
          fastify.log.info({ msg: "Cache hit", tool, prompt });
          return reply
            .code(200)
            .send(JSON.parse(cachedUserQueryAndAiResponse.response));
        }
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
            timestamp: new Date().toISOString(),
          };
        } else if (tool === "calculator") {
          const result = evaluateExpression(prompt).toString();
          const { text, totalTokenCount } = await generateFriendlyReply(
            "calc",
            prompt,
            result
          );

          responseData = {
            prompt,
            tool,
            result,
            totalTokenCount,
            summary: text,
            timestamp: new Date().toISOString(),
          };
        }

        fastify.log.info({
          method: request.method,
          url: request.url,
          tool,
          responseTime: Date.now() - startTime,
          tokenCount: responseData.totalTokenCount,
        });

        const log: RunLog = {
          userId,
          prompt,
          tool,
          response: JSON.stringify(responseData),
          timestamp: new Date(responseData.timestamp),
          tokens: responseData.totalTokenCount,
        };

        await Promise.all([cacheRun(log), saveRunLog(log)]);

        return reply.code(200).send(responseData);
      } catch (err) {
        const error = err as Error;

        fastify.log.error({
          method: request.method,
          url: request.url,
          error: error.message,
          stack: error.stack,
          tool,
          prompt: prompt.substring(0, 100),
        });

        return reply.code(500).send({
          error: error.message,
          code: "INTERNAL_ERROR",
          timestamp: new Date().toISOString(),
        });
      }
    }
  );
}
