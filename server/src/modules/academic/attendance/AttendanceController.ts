import { Request, Response } from "express";
import { validationService } from "../../../shared/http/validation";
import { AttendanceService } from "./AttendanceService";

export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  public createSession = async (req: Request, res: Response): Promise<void> => {
    validationService.requireFields(req.body, ["courseId", "sessionDate"]);
    const session = await this.attendanceService.createSession({
      facultyId: req.user!.id,
      courseId: req.body.courseId,
      sessionDate: req.body.sessionDate,
      topic: req.body.topic,
    });
    res.status(201).json({ success: true, data: session });
  };

  public markAttendance = async (req: Request, res: Response): Promise<void> => {
    validationService.requireFields(req.body, ["records"]);
    const records = await this.attendanceService.markAttendance({
      facultyId: req.user!.id,
      sessionId: req.params.sessionId,
      records: req.body.records,
    });
    res.json({ success: true, data: records });
  };

  public listCourseSessions = async (req: Request, res: Response): Promise<void> => {
    const sessions = await this.attendanceService.listCourseSessions(req.params.courseId);
    res.json({ success: true, data: sessions });
  };

  public getMyAttendance = async (req: Request, res: Response): Promise<void> => {
    const data = await this.attendanceService.getStudentAttendance(
      req.user!.id,
      typeof req.query.courseId === "string" ? req.query.courseId : undefined,
    );
    res.json({ success: true, data });
  };
}
