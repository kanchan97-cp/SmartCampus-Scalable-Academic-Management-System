import { BaseRepository } from "../../../shared/database/BaseRepository";

interface GradeRow {
  id: string;
  submission_id: string;
  marks: number;
  feedback: string | null;
  graded_by: string;
  graded_at: string;
}

export class GradeRepository extends BaseRepository {
  public findSubmissionContext(submissionId: string): Promise<unknown | null> {
    return this.one(
      `SELECT s.id, s.student_id, a.id AS assignment_id, a.title, a.max_marks, a.course_id
       FROM submissions s
       JOIN assignments a ON a.id = s.assignment_id
       WHERE s.id = $1`,
      [submissionId],
    );
  }

  public async upsert(input: {
    submissionId: string;
    marks: number;
    feedback?: string;
    facultyId: string;
  }): Promise<GradeRow> {
    const result = await this.database.query<GradeRow>(
      `INSERT INTO grades (submission_id, marks, feedback, graded_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (submission_id)
       DO UPDATE SET marks = EXCLUDED.marks, feedback = EXCLUDED.feedback, graded_by = EXCLUDED.graded_by, graded_at = NOW()
       RETURNING *`,
      [input.submissionId, input.marks, input.feedback ?? null, input.facultyId],
    );
    return result.rows[0];
  }

  public listStudentGrades(studentId: string, courseId?: string): Promise<unknown[]> {
    const values: unknown[] = [studentId];
    const courseFilter = courseId
      ? (() => {
          values.push(courseId);
          return "AND a.course_id = $2";
        })()
      : "";

    return this.many(
      `SELECT g.id, g.marks, g.feedback, g.graded_at,
              a.id AS assignment_id, a.title AS assignment_title, a.max_marks,
              c.id AS course_id, c.code AS course_code, c.name AS course_name,
              s.id AS submission_id, s.submitted_at
       FROM grades g
       JOIN submissions s ON s.id = g.submission_id
       JOIN assignments a ON a.id = s.assignment_id
       JOIN courses c ON c.id = a.course_id
       WHERE s.student_id = $1 ${courseFilter}
       ORDER BY g.graded_at DESC`,
      values,
    );
  }
}
