import { BaseRepository } from "../../shared/database/BaseRepository";
import { AuthUser, UserEntity, UserRole } from "../../types/domain";

interface UserRow extends UserEntity {}

export class UserRepository extends BaseRepository {
  public findByEmail(email: string): Promise<UserRow | null> {
    return this.one<UserRow>(
      `SELECT id, name, email, password_hash, role, is_active, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()],
    );
  }

  public findActiveAuthUserById(userId: string): Promise<AuthUser | null> {
    return this.one<AuthUser>(
      `SELECT id, name, email, role, is_active
       FROM users
       WHERE id = $1 AND is_active = true`,
      [userId],
    );
  }

  public findById(userId: string): Promise<Omit<UserRow, "password_hash"> | null> {
    return this.one<Omit<UserRow, "password_hash">>(
      `SELECT id, name, email, role, is_active, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [userId],
    );
  }

  public async list(filters: {
    role?: string;
    isActive?: string;
    limit: number;
    offset: number;
  }): Promise<Array<Omit<UserRow, "password_hash">>> {
    const values: unknown[] = [];
    const conditions: string[] = [];

    if (filters.role) {
      values.push(filters.role as UserRole);
      conditions.push(`role = $${values.length}`);
    }

    if (filters.isActive !== undefined) {
      values.push(filters.isActive === "true");
      conditions.push(`is_active = $${values.length}`);
    }

    values.push(filters.limit, filters.offset);

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    return this.many<Omit<UserRow, "password_hash">>(
      `SELECT id, name, email, role, is_active, created_at, updated_at
       FROM users
       ${where}
       ORDER BY created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );
  }

  public async create(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  }): Promise<Omit<UserRow, "password_hash">> {
    const result = await this.database.query<Omit<UserRow, "password_hash">>(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, is_active, created_at, updated_at`,
      [input.name, input.email.toLowerCase(), input.passwordHash, input.role],
    );

    return result.rows[0];
  }

  public async update(
    userId: string,
    payload: Partial<{
      name: string;
      email: string;
      role: UserRole;
      isActive: boolean;
      passwordHash: string;
    }>,
  ): Promise<Omit<UserRow, "password_hash"> | null> {
    const values: unknown[] = [];
    const updates: string[] = [];

    if (payload.name !== undefined) {
      values.push(payload.name);
      updates.push(`name = $${values.length}`);
    }
    if (payload.email !== undefined) {
      values.push(payload.email.toLowerCase());
      updates.push(`email = $${values.length}`);
    }
    if (payload.role !== undefined) {
      values.push(payload.role);
      updates.push(`role = $${values.length}`);
    }
    if (payload.isActive !== undefined) {
      values.push(payload.isActive);
      updates.push(`is_active = $${values.length}`);
    }
    if (payload.passwordHash !== undefined) {
      values.push(payload.passwordHash);
      updates.push(`password_hash = $${values.length}`);
    }

    if (updates.length === 0) {
      return this.findById(userId);
    }

    values.push(userId);

    return this.one<Omit<UserRow, "password_hash">>(
      `UPDATE users
       SET ${updates.join(", ")}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, name, email, role, is_active, created_at, updated_at`,
      values,
    );
  }
}
