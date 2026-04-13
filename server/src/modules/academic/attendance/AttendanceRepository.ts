import { BaseRepository } from "../../../shared/database/BaseRepository";
import { AttendanceStatus } from "../../../types/domain";

interface SessionRow {
  id: string;
  course_id: string;
  session_date: string;
  topic: string | null;
  created_by: string;
  created_at: string;
}

export class AttendanceRepository extends BaseRepository {
  public async createSession(input: {
    courseId: string;
    sessionDate: string;
    topic?: string;
    createdBy: string;
  }): Promise<SessionRow> {
    const result = await this.database.query<SessionRow>(
      `INSERT INTO sessions (course_id, session_date, topic, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.courseId, input.sessionDate, input.topic ?? null, input.createdBy],
    );
    return result.rows[0];
  }

  public findSessionById(sessionId: string): Promise<SessionRow | null> {
    return this.one<SessionRow>(
      `SELECT id, course_id, session_date, topic, created_by, created_at
       FROM sessions
       WHERE id = $1`,
      [sessionId],
    );
  }

  public async saveAttendanceRecords(
    sessionId: string,
    records: Array<{ studentId: string; status: AttendanceStatus }>,
  ): Promise<unknown[]> {
    const saved: unknown[] = [];

    for (const record of records) {
      const result = await this.database.query(
        `INSERT INTO attendance_records (session_id, student_id, status)
         VALUES ($1, $2, $3)
         ON CONFLICT (session_id, student_id)
         DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
         RETURNING *`,
        [sessionId, record.studentId, record.status],
      );
      saved.push(result.rows[0]);
    }

    return saved;
  }

  public listCourseSessions(courseId: string): Promise<unknown[]> {
    return this.many(
      `SELECT s.id, s.course_id, s.session_date, s.topic, s.created_at,
              COUNT(ar.id)::int AS attendance_count
       FROM sessions s
       LEFT JOIN attendance_records ar ON ar.session_id = s.id
       WHERE s.course_id = $1
       GROUP BY s.id
       ORDER BY s.session_date DESC`,
      [courseId],
    );
  }

  public listStudentAttendance(studentId: string, courseId?: string): Promise<unknown[]> {
    const values: unknown[] = [studentId];
    const courseFilter = courseId
      ? (() => {
          values.push(courseId);
          return "AND s.course_id = $2";
        })()
      : "";

    return this.many(
      `SELECT ar.id, ar.status, s.id AS session_id, s.session_date, s.topic,
              c.id AS course_id, c.code AS course_code, c.name AS course_name
       FROM attendance_records ar
       JOIN sessions s ON s.id = ar.session_id
       JOIN courses c ON c.id = s.course_id
       WHERE ar.student_id = $1 ${courseFilter}
       ORDER BY s.session_date DESC`,
      values,
    );
  }

  public listStudentAttendanceSummary(studentId: string, courseId?: string): Promise<unknown[]> {
    const values: unknown[] = [studentId];
    const courseFilter = courseId
      ? (() => {
          values.push(courseId);
          return "AND s.course_id = $2";
        })()
      : "";

    return this.many(
      `SELECT c.id AS course_id, c.code, c.name,
              COUNT(*)::int AS total_sessions,
              COUNT(*) FILTER (WHERE ar.status = 'present')::int AS present_sessions
       FROM attendance_records ar
       JOIN sessions s ON s.id = ar.session_id
       JOIN courses c ON c.id = s.course_id
       WHERE ar.student_id = $1 ${courseFilter}
       GROUP BY c.id
       ORDER BY c.name`,
      values,
    );
  }
}
