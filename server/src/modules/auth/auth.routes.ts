import { Router } from "express";
import { database } from "../../config/db";
import { env } from "../../config/env";
import { authenticate } from "../../middleware/authenticate";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { JwtTokenProvider } from "../../shared/security/JwtTokenProvider";
import { UserRepository } from "../users/UserRepository";
import { AuthController } from "./AuthController";
import { AuthService } from "./AuthService";
import { PasswordResetTokenRepository } from "./PasswordResetTokenRepository";

const router = Router();
const controller = new AuthController(
  new AuthService(
    new UserRepository(database),
    new JwtTokenProvider(env.jwtSecret, env.jwtExpiresIn),
    new PasswordResetTokenRepository(database),
  ),
);

router.post("/login", asyncHandler(controller.login));
router.get("/me", authenticate, asyncHandler(controller.me));
router.post("/forgot-password", asyncHandler(controller.requestPasswordReset));
router.post("/reset-password", asyncHandler(controller.resetPassword));

export default router;
