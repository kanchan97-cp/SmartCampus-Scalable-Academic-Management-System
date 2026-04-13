import { Router } from "express";
import { database } from "../../config/db";
import { authenticate } from "../../middleware/authenticate";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { NotificationRepository } from "../../shared/repositories/NotificationRepository";
import { NotificationController } from "./NotificationController";
import { NotificationService } from "./NotificationService";

const router = Router();
const controller = new NotificationController(
  new NotificationService(new NotificationRepository(database)),
);

router.use(authenticate);
router.get("/", asyncHandler(controller.listNotifications));
router.patch("/:notificationId/read", asyncHandler(controller.markRead));

export default router;
