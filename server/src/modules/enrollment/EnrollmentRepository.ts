import { BaseRepository } from "../../shared/database/BaseRepository";

interface EnrollmentRow {
  id: string;
  course_id: string;
  student_id: string;
  enrolled_at: string;
}

export class EnrollmentRepository extends BaseRepository {
  public list(filters: { courseId?: string; studentId?: string }): Promise<unknown[]> {
    const values: unknown[] = [];
    const conditions: string[] = [];

    if (filters.courseId) {
      values.push(filters.courseId);
      conditions.push(`e.course_id = $${values.length}`);
    }

    if (filters.studentId) {
      values.push(filters.studentId);
      conditions.push(`e.student_id = $${values.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    return this.many(
      `SELECT e.id, e.enrolled_at,
              c.id AS course_id, c.code AS course_code, c.name AS course_name,
              s.id AS student_id, s.name AS student_name, s.email AS student_email
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       JOIN users s ON s.id = e.student_id
       ${where}
       ORDER BY e.enrolled_at DESC`,
      values,
    );
  }

  public countByCourse(courseId: string): Promise<{ total: number } | null> {
    return this.one<{ total: number }>(
      `SELECT COUNT(*)::int AS total
       FROM enrollments
       WHERE course_id = $1`,
      [courseId],
    );
  }

  public findByCourseAndStudent(courseId: string, studentId: string): Promise<EnrollmentRow | null> {
    return this.one<EnrollmentRow>(
      `SELECT id, course_id, student_id, enrolled_at
       FROM enrollments
       WHERE course_id = $1 AND student_id = $2`,
      [courseId, studentId],
    );
  }

  public async create(courseId: string, studentId: string): Promise<EnrollmentRow> {
    const result = await this.database.query<EnrollmentRow>(
      `INSERT INTO enrollments (course_id, student_id)
       VALUES ($1, $2)
       RETURNING *`,
      [courseId, studentId],
    );
    return result.rows[0];
  }

  public listStudentIdsByCourse(courseId: string): Promise<Array<{ student_id: string }>> {
    return this.many<{ student_id: string }>(
      `SELECT student_id
       FROM enrollments
       WHERE course_id = $1`,
      [courseId],
    );
  }
}
