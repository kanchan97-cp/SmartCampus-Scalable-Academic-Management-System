import { NextFunction, Request, Response } from "express";
import { ApiError } from "../shared/errors/ApiError";

export const notFound = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(404, "Route not found"));
};
