import { BaseRepository } from "../../shared/database/BaseRepository";
import { CourseEntity } from "../../types/domain";

interface CourseListRow extends CourseEntity {
  enrolled_students: string;
}

export class CourseRepository extends BaseRepository {
  public async list(filters: {
    status?: string;
    facultyId?: string;
    studentId?: string;
    limit: number;
    offset: number;
  }): Promise<CourseListRow[]> {
    const values: unknown[] = [];
    const conditions: string[] = [];

    if (filters.status) {
      values.push(filters.status);
      conditions.push(`c.status = $${values.length}`);
    }

    if (filters.facultyId) {
      values.push(filters.facultyId);
      conditions.push(
        `EXISTS (SELECT 1 FROM course_faculty cf WHERE cf.course_id = c.id AND cf.faculty_id = $${values.length})`,
      );
    }

    if (filters.studentId) {
      values.push(filters.studentId);
      conditions.push(
        `EXISTS (SELECT 1 FROM enrollments e WHERE e.course_id = c.id AND e.student_id = $${values.length})`,
      );
    }

    values.push(filters.limit, filters.offset);
    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    return this.many<CourseListRow>(
      `SELECT c.id, c.code, c.name, c.description, c.status, c.capacity, c.created_at, c.updated_at,
              COUNT(DISTINCT e.student_id)::text AS enrolled_students
       FROM courses c
       LEFT JOIN enrollments e ON e.course_id = c.id
       ${where}
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );
  }

  public findById(courseId: string): Promise<CourseEntity | null> {
    return this.one<CourseEntity>(
      `SELECT id, code, name, description, status, capacity, created_at, updated_at
       FROM courses
       WHERE id = $1`,
      [courseId],
    );
  }

  public async findDetailedById(courseId: string): Promise<unknown | null> {
    return this.one(
      `SELECT c.id, c.code, c.name, c.description, c.status, c.capacity, c.created_at,
              COALESCE(
                json_agg(
                  DISTINCT jsonb_build_object('id', f.id, 'name', f.name, 'email', f.email)
                ) FILTER (WHERE f.id IS NOT NULL),
                '[]'
              ) AS faculty
       FROM courses c
       LEFT JOIN course_faculty cf ON cf.course_id = c.id
       LEFT JOIN users f ON f.id = cf.faculty_id
       WHERE c.id = $1
       GROUP BY c.id`,
      [courseId],
    );
  }

  public async create(input: {
    code: string;
    name: string;
    description?: string;
    capacity?: number;
    status?: string;
  }): Promise<CourseEntity> {
    const result = await this.database.query<CourseEntity>(
      `INSERT INTO courses (code, name, description, capacity, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        input.code.toUpperCase(),
        input.name,
        input.description ?? null,
        input.capacity ?? null,
        input.status ?? "active",
      ],
    );
    return result.rows[0];
  }

  public update(courseId: string, payload: Partial<CourseEntity>): Promise<CourseEntity | null> {
    const values: unknown[] = [];
    const updates: string[] = [];

    (["code", "name", "description", "status", "capacity"] as const).forEach((field) => {
      if (payload[field] !== undefined) {
        values.push(field === "code" ? String(payload[field]).toUpperCase() : payload[field]);
        updates.push(`${field} = $${values.length}`);
      }
    });

    if (updates.length === 0) {
      return this.findById(courseId);
    }

    values.push(courseId);
    return this.one<CourseEntity>(
      `UPDATE courses
       SET ${updates.join(", ")}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING *`,
      values,
    );
  }

  public async assignFaculty(courseId: string, facultyId: string): Promise<void> {
    await this.database.query(
      `INSERT INTO course_faculty (course_id, faculty_id)
       VALUES ($1, $2)
       ON CONFLICT (course_id, faculty_id) DO NOTHING`,
      [courseId, facultyId],
    );
  }

  public findFacultyAssignment(courseId: string, facultyId: string): Promise<{ exists: number } | null> {
    return this.one<{ exists: number }>(
      `SELECT 1 AS exists
       FROM course_faculty
       WHERE course_id = $1 AND faculty_id = $2`,
      [courseId, facultyId],
    );
  }
}
