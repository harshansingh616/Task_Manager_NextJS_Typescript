import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type AccessTokenPayload = { sub: string; email: string };
export type RefreshTokenPayload = { sub: string; tid: string };

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.accessTokenTtlSeconds });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const seconds = env.refreshTokenTtlDays * 24 * 60 * 60;
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: seconds });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
}

export function newTokenId(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: false, 
    path: "/",
  };
}