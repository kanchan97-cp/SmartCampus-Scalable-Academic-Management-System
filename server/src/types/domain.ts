export type UserRole = "admin" | "faculty" | "student";
export type CourseStatus = "active" | "archived";
export type AttendanceStatus = "present" | "absent";
export type NotificationType =
  | "enrollment"
  | "assignment_posted"
  | "grade_published";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface UserEntity extends AuthUser {
  password_hash: string;
  created_at?: string;
  updated_at?: string;
}

export interface CourseEntity {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: CourseStatus;
  capacity: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface AssignmentEntity {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  deadline: string;
  max_marks: number;
  created_by: string;
  created_at?: string;
}

export interface SubmissionEntity {
  id: string;
  assignment_id: string;
  student_id: string;
  file_url: string;
  original_file_name: string | null;
  submitted_at?: string;
}
