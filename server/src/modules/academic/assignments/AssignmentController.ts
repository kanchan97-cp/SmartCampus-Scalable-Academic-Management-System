import { Request, Response } from "express";
import { ApiError } from "../../../shared/errors/ApiError";
import { validationService } from "../../../shared/http/validation";
import { AssignmentService } from "./AssignmentService";

export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  public createAssignment = async (req: Request, res: Response): Promise<void> => {
    validationService.requireFields(req.body, ["courseId", "title", "deadline", "maxMarks"]);
    const assignment = await this.assignmentService.createAssignment({
      facultyId: req.user!.id,
      courseId: req.body.courseId,
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      maxMarks: Number(req.body.maxMarks),
    });
    res.status(201).json({ success: true, data: assignment });
  };

  public listAssignments = async (req: Request, res: Response): Promise<void> => {
    const assignments = await this.assignmentService.listAssignments({
      courseId: typeof req.query.courseId === "string" ? req.query.courseId : undefined,
      studentId: req.user?.role === "student" ? req.user.id : undefined,
    });
    res.json({ success: true, data: assignments });
  };

  public submitAssignment = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new ApiError(400, "Assignment file is required");
    }

    const submission = await this.assignmentService.submitAssignment({
      studentId: req.user!.id,
      assignmentId: req.params.assignmentId,
      filePath: req.file.path,
      originalFileName: req.file.originalname,
    });
    res.status(201).json({ success: true, data: submission });
  };

  public listSubmissions = async (req: Request, res: Response): Promise<void> => {
    const submissions = await this.assignmentService.listSubmissions(
      req.params.assignmentId,
      req.user!.id,
    );
    res.json({ success: true, data: submissions });
  };
}
