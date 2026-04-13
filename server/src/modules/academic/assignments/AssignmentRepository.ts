import { BaseRepository } from "../../../shared/database/BaseRepository";
import { AssignmentEntity, SubmissionEntity } from "../../../types/domain";

export class AssignmentRepository extends BaseRepository {
  public async create(input: {
    courseId: string;
    title: string;
    description?: string;
    deadline: string;
    maxMarks: number;
    facultyId: string;
  }): Promise<AssignmentEntity> {
    const result = await this.database.query<AssignmentEntity>(
      `INSERT INTO assignments (course_id, title, description, deadline, max_marks, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        input.courseId,
        input.title,
        input.description ?? null,
        input.deadline,
        input.maxMarks,
        input.facultyId,
      ],
    );
    return result.rows[0];
  }

  public list(filters: { courseId?: string; studentId?: string }): Promise<unknown[]> {
    const values: unknown[] = [];
    const conditions: string[] = [];

    if (filters.courseId) {
      values.push(filters.courseId);
      conditions.push(`a.course_id = $${values.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const submissionJoin = filters.studentId
      ? `LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = $${values.push(filters.studentId)}`
      : "";

    return this.many(
      `SELECT a.id, a.course_id, a.title, a.description, a.deadline, a.max_marks, a.created_at,
              c.code AS course_code, c.name AS course_name
              ${filters.studentId ? ", s.id AS my_submission_id, s.submitted_at AS my_submitted_at" : ""}
       FROM assignments a
       JOIN courses c ON c.id = a.course_id
       ${submissionJoin}
       ${where}
       ORDER BY a.deadline ASC`,
      values,
    );
  }

  public findById(assignmentId: string): Promise<AssignmentEntity | null> {
    return this.one<AssignmentEntity>(
      `SELECT id, course_id, title, description, deadline, max_marks, created_by, created_at
       FROM assignments
       WHERE id = $1`,
      [assignmentId],
    );
  }

  public async createSubmission(input: {
    assignmentId: string;
    studentId: string;
    filePath: string;
    originalFileName: string;
  }): Promise<SubmissionEntity> {
    const result = await this.database.query<SubmissionEntity>(
      `INSERT INTO submissions (assignment_id, student_id, file_url, original_file_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.assignmentId, input.studentId, input.filePath, input.originalFileName],
    );
    return result.rows[0];
  }

  public listSubmissions(assignmentId: string): Promise<unknown[]> {
    return this.many(
      `SELECT s.id, s.assignment_id, s.student_id, s.file_url, s.original_file_name, s.submitted_at,
              u.name AS student_name, u.email AS student_email,
              g.id AS grade_id, g.marks, g.feedback, g.graded_at
       FROM submissions s
       JOIN users u ON u.id = s.student_id
       LEFT JOIN grades g ON g.submission_id = s.id
       WHERE s.assignment_id = $1
       ORDER BY s.submitted_at DESC`,
      [assignmentId],
    );
  }
}
