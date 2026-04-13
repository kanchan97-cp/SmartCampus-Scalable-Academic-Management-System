import { BaseRepository } from "../database/BaseRepository";
import { NotificationType } from "../../types/domain";

interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export class NotificationRepository extends BaseRepository {
  public listByUser(userId: string): Promise<NotificationRow[]> {
    return this.many<NotificationRow>(
      `SELECT id, user_id, type, title, message, is_read, read_at, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );
  }

  public async create(input: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
  }): Promise<void> {
    await this.database.query(
      `INSERT INTO notifications (user_id, type, title, message)
       VALUES ($1, $2, $3, $4)`,
      [input.userId, input.type, input.title, input.message],
    );
  }

  public markRead(notificationId: string, userId: string): Promise<NotificationRow | null> {
    return this.one<NotificationRow>(
      `UPDATE notifications
       SET is_read = true, read_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId],
    );
  }
}
