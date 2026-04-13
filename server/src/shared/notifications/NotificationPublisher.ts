import { NotificationType } from "../../types/domain";

export interface PublishNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}

export interface NotificationPublisher {
  publish(input: PublishNotificationInput): Promise<void>;
}
