import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { refreshCookieOptions } from "../utils/tokens";

const REFRESH_COOKIE_NAME = "refreshToken";

export class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password } = req.body as { email: string; password: string };
    const { accessToken, refreshToken } = await AuthService.register(email, password);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
    return res.status(201).json({ accessToken });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body as { email: string; password: string };
    const { accessToken, refreshToken } = await AuthService.login(email, password);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
    return res.json({ accessToken });
  }

  static async refresh(req: Request, res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    if (!token) return res.status(401).json({ message: "Missing refresh token" });

    const { accessToken, refreshToken } = await AuthService.refresh(token);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
    return res.json({ accessToken });
  }
  

  static async logout(req: Request, res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    await AuthService.logout(token);

    res.clearCookie(REFRESH_COOKIE_NAME, { path: "/" });
    return res.status(204).send();
  }

  static async me(req: Request, res: Response) {
    const user = req.user!;
    return res.json({ id: user.id, email: user.email });
  }

}