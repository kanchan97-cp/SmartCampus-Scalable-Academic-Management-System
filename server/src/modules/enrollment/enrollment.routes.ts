import { Router } from "express";
import { database } from "../../config/db";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { DatabaseNotificationPublisher } from "../../shared/notifications/DatabaseNotificationPublisher";
import { NotificationRepository } from "../../shared/repositories/NotificationRepository";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { CourseRepository } from "../courses/CourseRepository";
import { EnrollmentController } from "./EnrollmentController";
import { EnrollmentRepository } from "./EnrollmentRepository";
import { EnrollmentService } from "./EnrollmentService";

const router = Router();
const controller = new EnrollmentController(
  new EnrollmentService(
    new EnrollmentRepository(database),
    new CourseRepository(database),
    new DatabaseNotificationPublisher(new NotificationRepository(database)),
  ),
);

router.use(authenticate);
router.get("/", authorize("admin", "faculty", "student"), asyncHandler(controller.listEnrollments));
router.post("/", authorize("admin", "student"), asyncHandler(controller.enrollStudent));

export default router;
