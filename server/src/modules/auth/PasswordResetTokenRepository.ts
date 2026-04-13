import { BaseRepository } from "../../shared/database/BaseRepository";

interface PasswordResetTokenRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export class PasswordResetTokenRepository extends BaseRepository {
  public async create(userId: string, token: string, expiresAt: Date): Promise<void> {
    await this.database.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, token, expiresAt],
    );
  }

  public findLatestByToken(token: string): Promise<PasswordResetTokenRow | null> {
    return this.one<PasswordResetTokenRow>(
      `SELECT id, user_id, token, expires_at, used_at, created_at
       FROM password_reset_tokens
       WHERE token = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [token],
    );
  }

  public async markUsed(tokenId: string): Promise<void> {
    await this.database.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE id = $1`,
      [tokenId],
    );
  }
}
