import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateBody } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validation/auth.schemas";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), AuthController.register);
authRouter.post("/login", validateBody(loginSchema), AuthController.login);
authRouter.post("/refresh", AuthController.refresh);
authRouter.post("/logout", AuthController.logout);
authRouter.get("/me", requireAuth, AuthController.me);