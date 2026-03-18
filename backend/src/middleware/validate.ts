import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

function formatZod(err: ZodError) {
  return err.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
}

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.validatedBody = schema.parse(req.body);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: formatZod(err) });
      }
      return next(err);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.validatedQuery = schema.parse(req.query);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: formatZod(err) });
      }
      return next(err);
    }
  };
}