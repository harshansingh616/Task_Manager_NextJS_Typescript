import { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, details: err.details });
  }

  if (err instanceof Error) {
    // Handle our validate() middleware JSON error
    try {
      const parsed = JSON.parse(err.message) as { status?: number; issues?: unknown };
      if (parsed?.status === 400) {
        return res.status(400).json({ message: "Validation error", issues: parsed.issues });
      }
    } catch {
      // ignore
    }
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }

  return res.status(500).json({ message: "Internal server error" });
}