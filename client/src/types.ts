export type Role = "admin" | "faculty" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
  is_active?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  status?: "active" | "archived";
  capacity?: number | null;
  enrolled_students?: string;
  enrolledStudents?: number;
  course_code?: string;
  course_name?: string;
}

export interface Enrollment {
  id: string;
  course_id: string;
  course_code: string;
  course_name: string;
  student_id: string;
  student_name: string;
  student_email: string;
  enrolled_at: string;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  deadline: string;
  max_marks: number;
  course_code?: string;
  course_name?: string;
  my_submission_id?: string | null;
  my_submitted_at?: string | null;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  submitted_at: string;
  file_url?: string;
  grade_id?: string | null;
  marks?: number | null;
  feedback?: string | null;
}

export interface Grade {
  id: string;
  marks: number;
  feedback?: string | null;
  assignment_title: string;
  max_marks: number;
  course_code: string;
  course_name: string;
  graded_at: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
