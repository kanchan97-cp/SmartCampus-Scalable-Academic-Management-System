import { Router } from "express";
import { database } from "../../../config/db";
import { upload } from "../../../config/multer";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import { asyncHandler } from "../../../shared/http/asyncHandler";
import { DatabaseNotificationPublisher } from "../../../shared/notifications/DatabaseNotificationPublisher";
import { NotificationRepository } from "../../../shared/repositories/NotificationRepository";
import { CourseRepository } from "../../courses/CourseRepository";
import { EnrollmentRepository } from "../../enrollment/EnrollmentRepository";
import { AssignmentController } from "./AssignmentController";
import { AssignmentRepository } from "./AssignmentRepository";
import { AssignmentService } from "./AssignmentService";

const router = Router();
const controller = new AssignmentController(
  new AssignmentService(
    new AssignmentRepository(database),
    new CourseRepository(database),
    new EnrollmentRepository(database),
    new DatabaseNotificationPublisher(new NotificationRepository(database)),
  ),
);

router.use(authenticate);
router.get("/", authorize("admin", "faculty", "student"), asyncHandler(controller.listAssignments));
router.post("/", authorize("faculty"), asyncHandler(controller.createAssignment));
router.post(
  "/:assignmentId/submissions",
  authorize("student"),
  upload.single("file"),
  asyncHandler(controller.submitAssignment),
);
router.get("/:assignmentId/submissions", authorize("faculty"), asyncHandler(controller.listSubmissions));

export default router;
