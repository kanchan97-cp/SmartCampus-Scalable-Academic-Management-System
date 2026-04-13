import { ApiError } from "../../../shared/errors/ApiError";
import { NotificationPublisher } from "../../../shared/notifications/NotificationPublisher";
import { CourseRepository } from "../../courses/CourseRepository";
import { EnrollmentRepository } from "../../enrollment/EnrollmentRepository";
import { AssignmentRepository } from "./AssignmentRepository";

export class AssignmentService {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
    private readonly courseRepository: CourseRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly notificationPublisher: NotificationPublisher,
  ) {}

  private async ensureFacultyAccess(facultyId: string, courseId: string): Promise<void> {
    const assignment = await this.courseRepository.findFacultyAssignment(courseId, facultyId);
    if (!assignment) {
      throw new ApiError(403, "Faculty is not assigned to this course");
    }
  }

  public async createAssignment(input: {
    facultyId: string;
    courseId: string;
    title: string;
    description?: string;
    deadline: string;
    maxMarks: number;
  }): Promise<unknown> {
    await this.ensureFacultyAccess(input.facultyId, input.courseId);
    const assignment = await this.assignmentRepository.create(input);

    const students = await this.enrollmentRepository.listStudentIdsByCourse(input.courseId);
    for (const student of students) {
      await this.notificationPublisher.publish({
        userId: student.student_id,
        type: "assignment_posted",
        title: "New assignment posted",
        message: `A new assignment "${input.title}" is now available.`,
      });
    }

    return assignment;
  }

  public listAssignments(filters: { courseId?: string; studentId?: string }): Promise<unknown[]> {
    return this.assignmentRepository.list(filters);
  }

  public async submitAssignment(input: {
    studentId: string;
    assignmentId: string;
    filePath: string;
    originalFileName: string;
  }): Promise<unknown> {
    const assignment = await this.assignmentRepository.findById(input.assignmentId);
    if (!assignment) {
      throw new ApiError(404, "Assignment not found");
    }

    if (new Date(assignment.deadline) < new Date()) {
      throw new ApiError(400, "Deadline has passed for this assignment");
    }

    const enrollment = await this.enrollmentRepository.findByCourseAndStudent(
      assignment.course_id,
      input.studentId,
    );
    if (!enrollment) {
      throw new ApiError(403, "Student is not enrolled in this course");
    }

    return this.assignmentRepository.createSubmission(input);
  }

  public async listSubmissions(assignmentId: string, facultyId: string): Promise<unknown[]> {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new ApiError(404, "Assignment not found");
    }

    await this.ensureFacultyAccess(facultyId, assignment.course_id);
    return this.assignmentRepository.listSubmissions(assignmentId);
  }
}
