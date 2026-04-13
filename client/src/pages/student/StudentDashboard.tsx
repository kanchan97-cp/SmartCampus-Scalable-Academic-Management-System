import { ChangeEvent, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import { Assignment, Course, Grade, NotificationItem } from "../../types";
import { Card, EmptyState, PageHeader, StatCard, StatusPill } from "../../components/ui";

interface StudentDashboardData {
  enrolledCourses: Course[];
  publishedGrades: number;
  attendancePercentage: number;
}

interface AttendanceData {
  records: Array<{
    id: string;
    status: string;
    course_code: string;
    topic: string;
    session_date: string;
  }>;
  summary: Array<{
    course_id: string;
    code: string;
    name: string;
    total_sessions: number;
    present_sessions: number;
    attendance_percentage: number;
  }>;
}

export function StudentDashboard({ activeView }: { activeView: string }) {
  if (activeView === "courses") return <StudentCourses />;
  if (activeView === "performance") return <StudentPerformance />;
  if (activeView === "notifications") return <StudentNotifications />;
  return <StudentOverview />;
}

function StudentOverview() {
  const { token } = useAuth();
  const dashboard = useAsync(() => api<StudentDashboardData>("/dashboard", {}, token), [token]);

  return (
    <>
      <PageHeader
        eyebrow="Student portal"
        title="Your academic snapshot"
        subtitle="Track enrolled courses, grades, attendance and updates from one focused place."
      />
      <div className="stat-grid">
        <StatCard label="Enrolled courses" value={dashboard.data?.enrolledCourses.length ?? 0} />
        <StatCard label="Published grades" value={dashboard.data?.publishedGrades ?? 0} tone="blue" />
        <StatCard
          label="Attendance"
          value={`${dashboard.data?.attendancePercentage ?? 0}%`}
          tone="gold"
        />
      </div>
      <Card>
        <div className="card-head">
          <h3>My courses</h3>
          <StatusPill>Student view</StatusPill>
        </div>
        {dashboard.data?.enrolledCourses.length ? (
          <div className="course-grid">
            {dashboard.data.enrolledCourses.map((course) => (
              <div className="mini-course" key={course.id}>
                <span>{course.code}</span>
                <strong>{course.name}</strong>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No enrolled courses" body="Open Courses and enroll in an active course." />
        )}
      </Card>
    </>
  );
}

function StudentCourses() {
  const { token } = useAuth();
  const courses = useAsync(() => api<Course[]>("/courses?status=active", {}, token), [token]);
  const myCourses = useAsync(() => api<Course[]>("/courses?mine=true", {}, token), [token]);
  const assignments = useAsync(() => api<Assignment[]>("/assignments", {}, token), [token]);
  const [message, setMessage] = useState("");

  const enroll = async (courseId: string) => {
    await api(
      "/enrollments",
      {
        method: "POST",
        body: JSON.stringify({ courseId }),
      },
      token,
    );
    setMessage("Enrollment successful.");
    myCourses.reload();
  };

  const submitAssignment = async (assignmentId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    await api(`/assignments/${assignmentId}/submissions`, { method: "POST", body: form }, token);
    setMessage("Assignment submitted successfully.");
    assignments.reload();
  };

  const enrolledIds = new Set(myCourses.data?.map((course) => course.id));

  return (
    <>
      <PageHeader
        eyebrow="Courses"
        title="Enroll and submit coursework"
        subtitle="Browse active courses and submit files for assignments posted by faculty."
      />
      {message ? <p className="success-banner">{message}</p> : null}

      <div className="two-column">
        <Card>
          <div className="card-head">
            <h3>Active courses</h3>
            <StatusPill>{courses.data?.length ?? 0}</StatusPill>
          </div>
          <div className="stack-list">
            {courses.data?.map((course) => (
              <div className="list-row" key={course.id}>
                <span>
                  {course.code} - {course.name}
                </span>
                {enrolledIds.has(course.id) ? (
                  <strong>Enrolled</strong>
                ) : (
                  <button className="small-button" onClick={() => enroll(course.id)}>
                    Enroll
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="card-head">
            <h3>Assignments</h3>
            <StatusPill>{assignments.data?.length ?? 0}</StatusPill>
          </div>
          {assignments.data?.length ? (
            <div className="stack-list">
              {assignments.data.map((assignment) => (
                <div className="list-row assignment-row" key={assignment.id}>
                  <span>
                    <strong>{assignment.title}</strong>
                    <small>{assignment.course_code} · Due {formatDate(assignment.deadline)}</small>
                  </span>
                  {assignment.my_submission_id ? (
                    <StatusPill>Submitted</StatusPill>
                  ) : (
                    <label className="small-button file-button">
                      Submit
                      <input
                        type="file"
                        onChange={(event) => submitAssignment(assignment.id, event)}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No assignments yet" body="Assignments appear after faculty posts them." />
          )}
        </Card>
      </div>
    </>
  );
}

function StudentPerformance() {
  const { token } = useAuth();
  const grades = useAsync(() => api<Grade[]>("/grades/me", {}, token), [token]);
  const attendance = useAsync(() => api<AttendanceData>("/attendance/me", {}, token), [token]);

  return (
    <>
      <PageHeader
        eyebrow="Performance"
        title="Grades and attendance"
        subtitle="See how your submissions and class participation are progressing."
      />
      <div className="two-column">
        <Card>
          <div className="card-head">
            <h3>Grades</h3>
            <StatusPill>{grades.data?.length ?? 0}</StatusPill>
          </div>
          {grades.data?.length ? (
            <div className="stack-list">
              {grades.data.map((grade) => (
                <div className="list-row" key={grade.id}>
                  <span>
                    {grade.assignment_title}
                    <small>{grade.course_code}</small>
                  </span>
                  <strong>
                    {grade.marks}/{grade.max_marks}
                  </strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No grades yet" body="Grades appear after faculty reviews submissions." />
          )}
        </Card>

        <Card>
          <div className="card-head">
            <h3>Attendance summary</h3>
          </div>
          {attendance.data?.summary.length ? (
            <div className="stack-list">
              {attendance.data.summary.map((row) => (
                <div className="list-row" key={row.course_id}>
                  <span>
                    {row.code} - {row.name}
                    <small>
                      {row.present_sessions}/{row.total_sessions} sessions
                    </small>
                  </span>
                  <strong>{row.attendance_percentage}%</strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No attendance marked" body="Your attendance summary will appear here." />
          )}
        </Card>
      </div>
    </>
  );
}

function StudentNotifications() {
  const { token } = useAuth();
  const notifications = useAsync(() => api<NotificationItem[]>("/notifications", {}, token), [token]);

  const markRead = async (notificationId: string) => {
    await api(`/notifications/${notificationId}/read`, { method: "PATCH" }, token);
    notifications.reload();
  };

  return (
    <>
      <PageHeader
        eyebrow="Notifications"
        title="Recent updates"
        subtitle="Assignment posts, grade updates, and enrollment confirmations show up here."
      />
      <Card>
        {notifications.data?.length ? (
          <div className="stack-list">
            {notifications.data.map((item) => (
              <div className={`list-row notification ${item.is_read ? "read" : ""}`} key={item.id}>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.message}</small>
                </span>
                {item.is_read ? (
                  <StatusPill>Read</StatusPill>
                ) : (
                  <button className="small-button" onClick={() => markRead(item.id)}>
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No notifications" body="Important academic updates will appear here." />
        )}
      </Card>
    </>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
