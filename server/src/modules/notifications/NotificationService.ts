import { NotificationRepository } from "../../shared/repositories/NotificationRepository";

export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  public listNotifications(userId: string): Promise<unknown[]> {
    return this.notificationRepository.listByUser(userId);
  }

  public markRead(notificationId: string, userId: string): Promise<unknown> {
    return this.notificationRepository.markRead(notificationId, userId);
  }
}
