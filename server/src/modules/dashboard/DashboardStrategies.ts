import { Database } from "../../shared/database/Database";
import { DashboardStrategy } from "./DashboardStrategy";

export class AdminDashboardStrategy implements DashboardStrategy {
  public readonly supportedRole = "admin" as const;

  constructor(private readonly database: Database) {}

  public async build(_userId: string): Promise<unknown> {
    const [users, courses, enrollments, assignments] = await Promise.all([
      this.database.query(`SELECT role, COUNT(*)::int AS total FROM users GROUP BY role`),
      this.database.query(`SELECT status, COUNT(*)::int AS total FROM courses GROUP BY status`),
      this.database.query(`SELECT COUNT(*)::int AS total FROM enrollments`),
      this.database.query(`SELECT COUNT(*)::int AS total FROM assignments`),
    ]);

    return {
      usersByRole: users.rows,
      coursesByStatus: courses.rows,
      totalEnrollments: enrollments.rows[0]?.total ?? 0,
      totalAssignments: assignments.rows[0]?.total ?? 0,
    };
  }
}

export class FacultyDashboardStrategy implements DashboardStrategy {
  public readonly supportedRole = "faculty" as const;

  constructor(private readonly database: Database) {}

  public async build(userId: string): Promise<unknown> {
    const [courses, pendingGrades, recentSessions] = await Promise.all([
      this.database.query(
        `SELECT c.id, c.code, c.name
         FROM course_faculty cf
         JOIN courses c ON c.id = cf.course_id
         WHERE cf.faculty_id = $1
         ORDER BY c.name`,
        [userId],
      ),
      this.database.query(
        `SELECT COUNT(*)::int AS total
         FROM submissions s
         JOIN assignments a ON a.id = s.assignment_id
         JOIN course_faculty cf ON cf.course_id = a.course_id
         LEFT JOIN grades g ON g.submission_id = s.id
         WHERE cf.faculty_id = $1 AND g.id IS NULL`,
        [userId],
      ),
      this.database.query(
        `SELECT s.id, s.session_date, s.topic, c.code AS course_code, c.name AS course_name
         FROM sessions s
         JOIN course_faculty cf ON cf.course_id = s.course_id
         JOIN courses c ON c.id = s.course_id
         WHERE cf.faculty_id = $1
         ORDER BY s.session_date DESC
         LIMIT 5`,
        [userId],
      ),
    ]);

    return {
      assignedCourses: courses.rows,
      pendingGrades: pendingGrades.rows[0]?.total ?? 0,
      recentSessions: recentSessions.rows,
    };
  }
}

export class StudentDashboardStrategy implements DashboardStrategy {
  public readonly supportedRole = "student" as const;

  constructor(private readonly database: Database) {}

  public async build(userId: string): Promise<unknown> {
    const [courses, grades, attendance] = await Promise.all([
      this.database.query(
        `SELECT c.id, c.code, c.name
         FROM enrollments e
         JOIN courses c ON c.id = e.course_id
         WHERE e.student_id = $1
         ORDER BY c.name`,
        [userId],
      ),
      this.database.query(
        `SELECT COUNT(*)::int AS total
         FROM grades g
         JOIN submissions s ON s.id = g.submission_id
         WHERE s.student_id = $1`,
        [userId],
      ),
      this.database.query(
        `SELECT COUNT(*) FILTER (WHERE status = 'present')::int AS present,
                COUNT(*)::int AS total
         FROM attendance_records
         WHERE student_id = $1`,
        [userId],
      ),
    ]);

    const present = Number(attendance.rows[0]?.present ?? 0);
    const total = Number(attendance.rows[0]?.total ?? 0);

    return {
      enrolledCourses: courses.rows,
      publishedGrades: grades.rows[0]?.total ?? 0,
      attendancePercentage: total === 0 ? 0 : Number(((present / total) * 100).toFixed(2)),
    };
  }
}
