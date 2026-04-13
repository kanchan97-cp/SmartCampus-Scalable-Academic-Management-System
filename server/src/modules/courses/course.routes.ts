import { Router } from "express";
import { database } from "../../config/db";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { UserRepository } from "../users/UserRepository";
import { CourseController } from "./CourseController";
import { CourseRepository } from "./CourseRepository";
import { CourseService } from "./CourseService";

const router = Router();
const controller = new CourseController(
  new CourseService(new CourseRepository(database), new UserRepository(database)),
);

router.use(authenticate);
router.get("/", asyncHandler(controller.listCourses));
router.get("/:courseId", asyncHandler(controller.getCourse));
router.post("/", authorize("admin"), asyncHandler(controller.createCourse));
router.patch("/:courseId", authorize("admin"), asyncHandler(controller.updateCourse));
router.post("/:courseId/faculty", authorize("admin"), asyncHandler(controller.assignFaculty));

export default router;
