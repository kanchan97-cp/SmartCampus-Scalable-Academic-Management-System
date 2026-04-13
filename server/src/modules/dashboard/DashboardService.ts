import { UserRole } from "../../types/domain";
import { DashboardStrategyFactory } from "./DashboardStrategyFactory";

export class DashboardService {
  constructor(private readonly strategyFactory: DashboardStrategyFactory) {}

  public getDashboard(role: UserRole, userId: string): Promise<unknown> {
    return this.strategyFactory.create(role).build(userId);
  }
}
