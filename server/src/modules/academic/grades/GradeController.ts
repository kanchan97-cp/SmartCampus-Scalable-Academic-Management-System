import { Request, Response } from "express";
import { validationService } from "../../../shared/http/validation";
import { GradeService } from "./GradeService";

export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  public gradeSubmission = async (req: Request, res: Response): Promise<void> => {
    validationService.requireFields(req.body, ["marks"]);
    const grade = await this.gradeService.gradeSubmission({
      facultyId: req.user!.id,
      submissionId: req.params.submissionId,
      marks: Number(req.body.marks),
      feedback: req.body.feedback,
    });
    res.json({ success: true, data: grade });
  };

  public getMyGrades = async (req: Request, res: Response): Promise<void> => {
    const grades = await this.gradeService.listStudentGrades(
      req.user!.id,
      typeof req.query.courseId === "string" ? req.query.courseId : undefined,
    );
    res.json({ success: true, data: grades });
  };
}
