import { ApiError } from "../../shared/errors/ApiError";
import { CourseStatus } from "../../types/domain";
import { UserRepository } from "../users/UserRepository";
import { CourseRepository } from "./CourseRepository";

export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public listCourses(filters: {
    status?: string;
    facultyId?: string;
    studentId?: string;
    limit: number;
    offset: number;
  }): Promise<unknown[]> {
    return this.courseRepository.list(filters);
  }

  public async getCourse(courseId: string): Promise<unknown> {
    const course = await this.courseRepository.findDetailedById(courseId);
    if (!course) {
      throw new ApiError(404, "Course not found");
    }
    return course;
  }

  public createCourse(input: {
    code: string;
    name: string;
    description?: string;
    capacity?: number;
    status?: string;
  }): Promise<unknown> {
    return this.courseRepository.create(input);
  }

  public async updateCourse(courseId: string, input: Record<string, unknown>): Promise<unknown> {
    const course = await this.courseRepository.update(courseId, {
      code: typeof input.code === "string" ? input.code : undefined,
      name: typeof input.name === "string" ? input.name : undefined,
      description: typeof input.description === "string" ? input.description : undefined,
      status:
        input.status === "active" || input.status === "archived"
          ? (input.status as CourseStatus)
          : undefined,
      capacity: typeof input.capacity === "number" ? input.capacity : undefined,
    });
    if (!course) {
      throw new ApiError(404, "Course not found");
    }
    return course;
  }

  public async assignFaculty(courseId: string, facultyId: string): Promise<unknown> {
    const faculty = await this.userRepository.findById(facultyId);
    if (!faculty || faculty.role !== "faculty" || !faculty.is_active) {
      throw new ApiError(400, "Selected user is not an active faculty member");
    }

    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new ApiError(404, "Course not found");
    }

    await this.courseRepository.assignFaculty(courseId, facultyId);
    return course;
  }
}
