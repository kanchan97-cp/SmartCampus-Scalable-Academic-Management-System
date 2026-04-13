import { Request, Response } from "express";
import { DashboardService } from "./DashboardService";

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  public getDashboard = async (req: Request, res: Response): Promise<void> => {
    const data = await this.dashboardService.getDashboard(req.user!.role, req.user!.id);
    res.json({ success: true, data });
  };
}
