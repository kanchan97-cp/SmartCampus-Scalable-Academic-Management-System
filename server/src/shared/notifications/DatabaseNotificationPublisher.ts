import {
  NotificationPublisher,
  PublishNotificationInput,
} from "./NotificationPublisher";
import { NotificationRepository } from "../repositories/NotificationRepository";

export class DatabaseNotificationPublisher implements NotificationPublisher {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  public async publish(input: PublishNotificationInput): Promise<void> {
    await this.notificationRepository.create(input);
  }
}
