import { Router } from "express";
import { database } from "../../../config/db";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import { asyncHandler } from "../../../shared/http/asyncHandler";
import { DatabaseNotificationPublisher } from "../../../shared/notifications/DatabaseNotificationPublisher";
import { NotificationRepository } from "../../../shared/repositories/NotificationRepository";
import { CourseRepository } from "../../courses/CourseRepository";
import { GradeController } from "./GradeController";
import { GradeRepository } from "./GradeRepository";
import { GradeService } from "./GradeService";

const router = Router();
const controller = new GradeController(
  new GradeService(
    new GradeRepository(database),
    new CourseRepository(database),
    new DatabaseNotificationPublisher(new NotificationRepository(database)),
  ),
);

router.use(authenticate);
router.post("/submissions/:submissionId", authorize("faculty"), asyncHandler(controller.gradeSubmission));
router.get("/me", authorize("student"), asyncHandler(controller.getMyGrades));

export default router;
