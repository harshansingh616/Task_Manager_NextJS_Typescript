import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "../config/env";
import { errorHandler } from "../middleware/errorHandler";
import { healthRouter } from "../routes/health.route";
import { authRouter } from "../routes/auth.route";
import { taskRouter } from "../routes/task.route";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(morgan("dev"));

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(cookieParser());

  app.use("/health", healthRouter);
  app.use("/auth", authRouter);
  app.use("/tasks", taskRouter);

  app.use(errorHandler);

  return app;
}