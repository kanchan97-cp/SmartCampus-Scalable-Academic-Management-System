import { Router } from "express";
import { database } from "../../config/db";
import { authenticate } from "../../middleware/authenticate";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { DashboardController } from "./DashboardController";
import { DashboardService } from "./DashboardService";
import {
  AdminDashboardStrategy,
  FacultyDashboardStrategy,
  StudentDashboardStrategy,
} from "./DashboardStrategies";
import { DashboardStrategyFactory } from "./DashboardStrategyFactory";

const router = Router();
const strategyFactory = new DashboardStrategyFactory([
  new AdminDashboardStrategy(database),
  new FacultyDashboardStrategy(database),
  new StudentDashboardStrategy(database),
]);
const controller = new DashboardController(new DashboardService(strategyFactory));

router.get("/", authenticate, asyncHandler(controller.getDashboard));

export default router;
