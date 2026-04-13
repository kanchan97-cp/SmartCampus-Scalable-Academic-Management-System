import { NextFunction, Request, Response } from "express";
import { ApiError } from "../shared/errors/ApiError";

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const apiError = error instanceof ApiError ? error : new ApiError(500, error.message);
  const message = apiError.message || "Internal server error";

  if (apiError.statusCode >= 500) {
    console.error(error);
  }

  res.status(apiError.statusCode).json({
    success: false,
    message,
    details: apiError.details,
  });
};
