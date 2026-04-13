import { ApiError } from "../errors/ApiError";

export class ValidationService {
  public requireFields(payload: Record<string, unknown>, fields: string[]): void {
    const missing = fields.filter((field) => {
      const value = payload[field];
      return value === undefined || value === null || value === "";
    });

    if (missing.length > 0) {
      throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
    }
  }

  public parsePagination(query: Record<string, unknown>): { limit: number; offset: number } {
    const rawLimit = Number(query.limit ?? 20);
    const rawOffset = Number(query.offset ?? 0);

    return {
      limit: Math.min(Number.isNaN(rawLimit) ? 20 : rawLimit, 100),
      offset: Math.max(Number.isNaN(rawOffset) ? 0 : rawOffset, 0),
    };
  }
}

export const validationService = new ValidationService();
