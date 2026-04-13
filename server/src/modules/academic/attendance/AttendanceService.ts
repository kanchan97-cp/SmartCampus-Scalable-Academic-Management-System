import { ApiError } from "../../../shared/errors/ApiError";
import { CourseRepository } from "../../courses/CourseRepository";
import { AttendanceRepository } from "./AttendanceRepository";

export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  private async ensureFacultyAccess(facultyId: string, courseId: string): Promise<void> {
    const assignment = await this.courseRepository.findFacultyAssignment(courseId, facultyId);
    if (!assignment) {
      throw new ApiError(403, "Faculty is not assigned to this course");
    }
  }

  public async createSession(input: {
    facultyId: string;
    courseId: string;
    sessionDate: string;
    topic?: string;
  }): Promise<unknown> {
    await this.ensureFacultyAccess(input.facultyId, input.courseId);
    return this.attendanceRepository.createSession({
      courseId: input.courseId,
      sessionDate: input.sessionDate,
      topic: input.topic,
      createdBy: input.facultyId,
    });
  }

  public async markAttendance(input: {
    facultyId: string;
    sessionId: string;
    records: Array<{ studentId: string; status: "present" | "absent" }>;
  }): Promise<unknown[]> {
    const session = await this.attendanceRepository.findSessionById(input.sessionId);
    if (!session) {
      throw new ApiError(404, "Session not found");
    }

    await this.ensureFacultyAccess(input.facultyId, session.course_id);
    return this.attendanceRepository.saveAttendanceRecords(input.sessionId, input.records);
  }

  public listCourseSessions(courseId: string): Promise<unknown[]> {
    return this.attendanceRepository.listCourseSessions(courseId);
  }

  public async getStudentAttendance(studentId: string, courseId?: string): Promise<unknown> {
    const records = await this.attendanceRepository.listStudentAttendance(studentId, courseId);
    const summaryRows = (await this.attendanceRepository.listStudentAttendanceSummary(
      studentId,
      courseId,
    )) as Array<{
      course_id: string;
      code: string;
      name: string;
      total_sessions: number;
      present_sessions: number;
    }>;

    return {
      records,
      summary: summaryRows.map((row) => ({
        ...row,
        attendance_percentage:
          row.total_sessions === 0
            ? 0
            : Number(((row.present_sessions / row.total_sessions) * 100).toFixed(2)),
      })),
    };
  }
}
