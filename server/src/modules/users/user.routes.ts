import { Router } from "express";
import { database } from "../../config/db";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { UserController } from "./UserController";
import { UserRepository } from "./UserRepository";
import { UserService } from "./UserService";

const router = Router();
const controller = new UserController(new UserService(new UserRepository(database)));

router.use(authenticate, authorize("admin"));
router.get("/", asyncHandler(controller.listUsers));
router.post("/", asyncHandler(controller.createUser));
router.get("/:userId", asyncHandler(controller.getUser));
router.patch("/:userId", asyncHandler(controller.updateUser));

export default router;
