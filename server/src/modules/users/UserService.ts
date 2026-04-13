import bcrypt from "bcryptjs";
import { UserRole } from "../../types/domain";
import { ApiError } from "../../shared/errors/ApiError";
import { UserRepository } from "./UserRepository";

export interface UserServicePort {
  listUsers(filters: {
    role?: string;
    isActive?: string;
    limit: number;
    offset: number;
  }): Promise<unknown[]>;
  createUser(input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<unknown>;
  getUser(userId: string): Promise<unknown>;
  updateUser(
    userId: string,
    input: Partial<{
      name: string;
      email: string;
      role: UserRole;
      isActive: boolean;
      password: string;
    }>,
  ): Promise<unknown>;
}

export class UserService implements UserServicePort {
  constructor(private readonly userRepository: UserRepository) {}

  public listUsers(filters: {
    role?: string;
    isActive?: string;
    limit: number;
    offset: number;
  }): Promise<unknown[]> {
    return this.userRepository.list(filters);
  }

  public async createUser(input: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<unknown> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ApiError(409, "A user with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    return this.userRepository.create({ ...input, passwordHash });
  }

  public async getUser(userId: string): Promise<unknown> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }

  public async updateUser(
    userId: string,
    input: Partial<{
      name: string;
      email: string;
      role: UserRole;
      isActive: boolean;
      password: string;
    }>,
  ): Promise<unknown> {
    const payload = {
      ...input,
      passwordHash: input.password ? await bcrypt.hash(input.password, 10) : undefined,
    };

    const user = await this.userRepository.update(userId, payload);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }
}
