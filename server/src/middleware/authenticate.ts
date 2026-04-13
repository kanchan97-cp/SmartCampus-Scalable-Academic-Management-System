import { NextFunction, Request, Response } from "express";
import { JwtTokenProvider } from "../shared/security/JwtTokenProvider";
import { env } from "../config/env";
import { ApiError } from "../shared/errors/ApiError";
import { UserRepository } from "../modules/users/UserRepository";
import { database } from "../config/db";

const tokenProvider = new JwtTokenProvider(env.jwtSecret, env.jwtExpiresIn);
const userRepository = new UserRepository(database);

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication token is required");
    }

    const token = authHeader.split(" ")[1];
    const payload = tokenProvider.verify(token);
    const user = await userRepository.findActiveAuthUserById(payload.sub);

    if (!user) {
      throw new ApiError(401, "User account is inactive or missing");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid or expired token"));
  }
};
