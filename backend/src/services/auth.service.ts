import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { HttpError } from "../middleware/errorHandler";
import { env } from "../config/env";
import {
  newTokenId,
  sha256,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens";

type AuthResult = { accessToken: string; refreshToken: string };

export class AuthService {
  static async register(email: string, password: string): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpError(400, "Email already registered");

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, password: passwordHash },
      select: { id: true, email: true },
    });

    return this.issueTokens(user.id, user.email);
  }

  static async login(email: string, password: string): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, "Invalid credentials");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    return this.issueTokens(user.id, user.email);
  }

  static async refresh(refreshJwt: string): Promise<AuthResult> {
    let payload: { sub: string; tid: string };
    try {
      payload = verifyRefreshToken(refreshJwt);
    } catch {
      throw new HttpError(401, "Invalid refresh token");
    }

    const tokenHash = sha256(payload.tid);

    const tokenRow = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!tokenRow) throw new HttpError(401, "Refresh token not found");
    if (tokenRow.revokedAt) throw new HttpError(401, "Refresh token revoked");
    if (tokenRow.expiresAt.getTime() < Date.now()) throw new HttpError(401, "Refresh token expired");

    // rotate: revoke old and issue new
    await prisma.refreshToken.update({
      where: { id: tokenRow.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(tokenRow.user.id, tokenRow.user.email);
  }

  static async logout(refreshJwt?: string): Promise<void> {
    if (!refreshJwt) return;

    try {
      const payload = verifyRefreshToken(refreshJwt);
      const tokenHash = sha256(payload.tid);

      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // ignore invalid token; still clear cookie at controller
    }
  }

  private static async issueTokens(userId: string, email: string): Promise<AuthResult> {
    const accessToken = signAccessToken({ sub: userId, email });

    const tid = newTokenId();
    const refreshToken = signRefreshToken({ sub: userId, tid });

    const expiresAt = new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: sha256(tid),
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}