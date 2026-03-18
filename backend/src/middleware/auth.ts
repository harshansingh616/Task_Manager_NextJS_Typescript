import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/tokens";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ message: "Missing access token" });
  }

  const token = header.slice("bearer ".length).trim();

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
}