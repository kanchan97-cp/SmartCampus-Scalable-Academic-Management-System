import { QueryResultRow } from "pg";
import { Database } from "./Database";

export abstract class BaseRepository {
  constructor(protected readonly database: Database) {}

  protected async many<T extends QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    const result = await this.database.query<T>(text, params);
    return result.rows;
  }

  protected async one<T extends QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ): Promise<T | null> {
    const result = await this.database.query<T>(text, params);
    return result.rows[0] ?? null;
  }
}
