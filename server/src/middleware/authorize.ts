import { NextFunction, Request, Response } from "express";
import { ApiError } from "../shared/errors/ApiError";
import { UserRole } from "../types/domain";

export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ApiError(403, "You do not have permission to access this resource"));
      return;
    }

    next();
  };
