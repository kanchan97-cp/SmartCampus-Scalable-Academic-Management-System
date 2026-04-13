import { UserRole } from "../../types/domain";

export interface DashboardStrategy {
  readonly supportedRole: UserRole;
  build(userId: string): Promise<unknown>;
}
