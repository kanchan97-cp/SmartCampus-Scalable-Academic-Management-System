import { Request, Response } from "express";
import { validationService } from "../../shared/http/validation";
import { CourseService } from "./CourseService";

export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  public listCourses = async (req: Request, res: Response): Promise<void> => {
    const pagination = validationService.parsePagination(req.query as Record<string, unknown>);
    const filters = {
      status: typeof req.query.status === "string" ? req.query.status : undefined,
      facultyId: req.user?.role === "faculty" ? req.user.id : undefined,
      studentId:
        req.user?.role === "student" && req.query.mine === "true" ? req.user.id : undefined,
      ...pagination,
    };

    const courses = await this.courseService.listCourses(filters);
    res.json({ success: true, data: courses });
  };

  public getCourse = async (req: Request, res: Response): Promise<void> => {
    const course = await this.courseService.getCourse(req.params.courseId);
    res.json({ success: true, data: course });
  };

  public createCourse = async (req: Request, res: Response): Promise<void> => {
    validationService.requireFields(req.body, ["code", "name"]);
    const course = await this.courseService.createCourse(req.body);
    res.status(201).json({ success: true, data: course });
  };

  public updateCourse = async (req: Request, res: Response): Promise<void> => {
    const course = await this.courseService.updateCourse(req.params.courseId, req.body);
    res.json({ success: true, data: course });
  };

  public assignFaculty = async (req: Request, res: Response): Promise<void> => {
    validationService.requireFields(req.body, ["facultyId"]);
    const result = await this.courseService.assignFaculty(
      req.params.courseId,
      req.body.facultyId,
    );
    res.json({ success: true, data: result });
  };
}
