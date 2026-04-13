import { ApiError } from "../../shared/errors/ApiError";
import { UserRole } from "../../types/domain";
import { DashboardStrategy } from "./DashboardStrategy";

export class DashboardStrategyFactory {
  constructor(private readonly strategies: DashboardStrategy[]) {}

  public create(role: UserRole): DashboardStrategy {
    const strategy = this.strategies.find((item) => item.supportedRole === role);
    if (!strategy) {
      throw new ApiError(400, `No dashboard strategy registered for role: ${role}`);
    }
    return strategy;
  }
}
