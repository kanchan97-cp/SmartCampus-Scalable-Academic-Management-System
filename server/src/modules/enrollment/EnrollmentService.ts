import { NotificationPublisher } from "../../shared/notifications/NotificationPublisher";
import { ApiError } from "../../shared/errors/ApiError";
import { CourseRepository } from "../courses/CourseRepository";
import { EnrollmentRepository } from "./EnrollmentRepository";

export class EnrollmentService {
  constructor(
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly courseRepository: CourseRepository,
    private readonly notificationPublisher: NotificationPublisher,
  ) {}

  public listEnrollments(filters: { courseId?: string; studentId?: string }): Promise<unknown[]> {
    return this.enrollmentRepository.list(filters);
  }

  public async enrollStudent(courseId: string, studentId: string): Promise<unknown> {
    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new ApiError(404, "Course not found");
    }
    if (course.status !== "active") {
      throw new ApiError(400, "Only active courses can accept enrollments");
    }

    const existing = await this.enrollmentRepository.findByCourseAndStudent(courseId, studentId);
    if (existing) {
      throw new ApiError(409, "Student is already enrolled in this course");
    }

    if (course.capacity) {
      const count = await this.enrollmentRepository.countByCourse(courseId);
      if ((count?.total ?? 0) >= course.capacity) {
        throw new ApiError(400, "Course capacity has been reached");
      }
    }

    const enrollment = await this.enrollmentRepository.create(courseId, studentId);
    await this.notificationPublisher.publish({
      userId: studentId,
      type: "enrollment",
      title: "Enrollment confirmed",
      message: "You have been enrolled in a course successfully.",
    });

    return enrollment;
  }
}
