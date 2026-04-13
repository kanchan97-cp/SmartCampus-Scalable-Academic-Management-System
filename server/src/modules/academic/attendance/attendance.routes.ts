import { Router } from "express";
import { database } from "../../../config/db";
import { authenticate } from "../../../middleware/authenticate";
import { authorize } from "../../../middleware/authorize";
import { asyncHandler } from "../../../shared/http/asyncHandler";
import { CourseRepository } from "../../courses/CourseRepository";
import { AttendanceController } from "./AttendanceController";
import { AttendanceRepository } from "./AttendanceRepository";
import { AttendanceService } from "./AttendanceService";

const router = Router();
const controller = new AttendanceController(
  new AttendanceService(new AttendanceRepository(database), new CourseRepository(database)),
);

router.use(authenticate);
router.post("/sessions", authorize("faculty"), asyncHandler(controller.createSession));
router.post("/sessions/:sessionId/records", authorize("faculty"), asyncHandler(controller.markAttendance));
router.get("/courses/:courseId/sessions", authorize("admin", "faculty"), asyncHandler(controller.listCourseSessions));
router.get("/me", authorize("student"), asyncHandler(controller.getMyAttendance));

export default router;
