import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
      validatedQuery?: unknown;
      validatedBody?: unknown;
    }
  }
}

export {};