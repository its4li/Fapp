import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";
import { prisma } from "./config/database";
import { redis } from "./config/redis";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(","),
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use("/api", routes);

app.use(errorHandler);

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected");

    await redis.ping();
    console.log("Redis connected");

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});

bootstrap();
