import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ApiError } from "../../shared/errors/ApiError";
import { TokenProvider } from "../../shared/security/JwtTokenProvider";
import { UserRepository } from "../users/UserRepository";
import { PasswordResetTokenRepository } from "./PasswordResetTokenRepository";

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenProvider: TokenProvider,
    private readonly passwordResetRepository: PasswordResetTokenRepository,
  ) {}

  public async login(email: string, password: string): Promise<unknown> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.is_active) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    return {
      token: this.tokenProvider.generate(user.id, user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
      },
    };
  }

  public async me(userId: string): Promise<unknown> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }

  public async requestPasswordReset(email: string): Promise<unknown> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.is_active) {
      return { message: "If the account exists, a reset token has been created." };
    }

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
    await this.passwordResetRepository.create(user.id, token, expiresAt);

    return {
      message: "Password reset token created. Wire this to email later.",
      resetToken: token,
      expiresAt,
    };
  }

  public async resetPassword(token: string, newPassword: string): Promise<unknown> {
    const resetToken = await this.passwordResetRepository.findLatestByToken(token);
    if (!resetToken || resetToken.used_at || new Date(resetToken.expires_at) < new Date()) {
      throw new ApiError(400, "Reset token is invalid or expired");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(resetToken.user_id, { passwordHash });
    await this.passwordResetRepository.markUsed(resetToken.id);

    return { message: "Password has been reset successfully" };
  }
}
