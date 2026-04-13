import { Request, Response } from "express";
import { NotificationService } from "./NotificationService";

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  public listNotifications = async (req: Request, res: Response): Promise<void> => {
    const data = await this.notificationService.listNotifications(req.user!.id);
    res.json({ success: true, data });
  };

  public markRead = async (req: Request, res: Response): Promise<void> => {
    const data = await this.notificationService.markRead(req.params.notificationId, req.user!.id);
    res.json({ success: true, data });
  };
}
