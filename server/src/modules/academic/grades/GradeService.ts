import { ApiError } from "../../../shared/errors/ApiError";
import { NotificationPublisher } from "../../../shared/notifications/NotificationPublisher";
import { CourseRepository } from "../../courses/CourseRepository";
import { GradeRepository } from "./GradeRepository";

interface SubmissionContext {
  id: string;
  student_id: string;
  assignment_id: string;
  title: string;
  max_marks: number;
  course_id: string;
}

export class GradeService {
  constructor(
    private readonly gradeRepository: GradeRepository,
    private readonly courseRepository: CourseRepository,
    private readonly notificationPublisher: NotificationPublisher,
  ) {}

  public async gradeSubmission(input: {
    facultyId: string;
    submissionId: string;
    marks: number;
    feedback?: string;
  }): Promise<unknown> {
    const submission = (await this.gradeRepository.findSubmissionContext(
      input.submissionId,
    )) as SubmissionContext | null;

    if (!submission) {
      throw new ApiError(404, "Submission not found");
    }

    const facultyAccess = await this.courseRepository.findFacultyAssignment(
      submission.course_id,
      input.facultyId,
    );
    if (!facultyAccess) {
      throw new ApiError(403, "Faculty is not assigned to this course");
    }

    if (input.marks > Number(submission.max_marks)) {
      throw new ApiError(400, "Marks cannot exceed assignment max marks");
    }

    const grade = await this.gradeRepository.upsert(input);
    await this.notificationPublisher.publish({
      userId: submission.student_id,
      type: "grade_published",
      title: "Grade published",
      message: `Your assignment "${submission.title}" has been graded.`,
    });

    return grade;
  }

  public listStudentGrades(studentId: string, courseId?: string): Promise<unknown[]> {
    return this.gradeRepository.listStudentGrades(studentId, courseId);
  }
}
