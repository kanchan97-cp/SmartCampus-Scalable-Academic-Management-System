import { Request, Response } from "express";
import { validationService } from "../../shared/http/validation";
import { EnrollmentService } from "./EnrollmentService";

export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  public listEnrollments = async (req: Request, res: Response): Promise<void> => {
    const enrollments = await this.enrollmentService.listEnrollments({
      courseId: typeof req.query.courseId === "string" ? req.query.courseId : undefined,
      studentId:
        req.user?.role === "student"
          ? req.user.id
          : typeof req.query.studentId === "string"
            ? req.query.studentId
            : undefined,
    });

    res.json({ success: true, data: enrollments });
  };

  public enrollStudent = async (req: Request, res: Response): Promise<void> => {
    validationService.requireFields(req.body, ["courseId"]);
    const studentId = req.user!.role === "student" ? req.user!.id : req.body.studentId;
    validationService.requireFields({ studentId }, ["studentId"]);
    const enrollment = await this.enrollmentService.enrollStudent(req.body.courseId, studentId);
    res.status(201).json({ success: true, data: enrollment });
  };
}
