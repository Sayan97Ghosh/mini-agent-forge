import dotenv from "dotenv";
import router from "./api/routes";
import Fastify from "fastify";
import fs from "fs";
import path from "path";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyCors from "@fastify/cors";

dotenv.config();

const isDev = process.env.NODE_ENV === "development";

const fastifyOptions: any = {
  logger: {
    level: process.env.LOG_LEVEL || "info",
    transport: isDev ? { target: "pino-pretty" } : undefined,
  },
  bodyLimit: 1024 * 1024, // 1MB
  trustProxy: true,
  keepAliveTimeout: 72000,
  connectionTimeout: 10000,
};

if (!isDev) {
  try {
    fastifyOptions.https = {
      key: fs.readFileSync(path.resolve(process.env.SSL_KEY_PATH || " ")),
      cert: fs.readFileSync(path.resolve(process.env.SSL_CERT_PATH || " ")),
    };
  } catch (err) {
    const error = err as Error;
    console.error("Failed to load SSL certificates:", error.message);
    process.exit(1);
  }
}

const fastify = Fastify(fastifyOptions);

async function registerPlugins() {
  await fastify.register(fastifyCors, {
    origin: process.env.CLIENT_ORIGIN || (isDev ? "*" : false),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    credentials: true,
  });
  if (!isDev) {
    await fastify.register(fastifyHelmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: isDev ? [] : ["https:"],
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true }, // Strict-Transport-Security in prod
      xFrameOptions: { action: "deny" }, // Prevent clickjacking
      xContentTypeOptions: true, // Prevent MIME-type sniffing
      xXssProtection: true, // Enable XSS filtering
    });

    await fastify.register(fastifyRateLimit, {
      max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
      timeWindow: process.env.RATE_LIMIT_WINDOW || "1 minute",
      errorResponseBuilder: () => ({
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
      })
    });
  }
}

async function registerRoutes() {
  await fastify.register(router, { prefix: "/api/v1" });
}
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    const PORT = parseInt(process.env.PORT || "8082", 10);
    const HOST = process.env.HOST || "0.0.0.0";

    await fastify.listen({ port: PORT, host: HOST });
    console.log(
      `Server running at ${isDev ? "http" : "https"}://${HOST}:${PORT}`
    );
  } catch (err) {
    console.error('Fastify failed to start:', err);
    fastify.log.error(err);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("Received SIGINT, shutting down gracefully...");
  await fastify.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  await fastify.close();
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}
