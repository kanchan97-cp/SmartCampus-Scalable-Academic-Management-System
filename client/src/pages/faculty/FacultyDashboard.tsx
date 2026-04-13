import { FormEvent, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import { Assignment, Course, Submission } from "../../types";
import { Card, EmptyState, Field, PageHeader, StatCard, StatusPill } from "../../components/ui";

interface FacultyDashboardData {
  assignedCourses: Course[];
  pendingGrades: number;
  recentSessions: Array<{ id: string; topic: string; course_code: string; session_date: string }>;
}

export function FacultyDashboard({ activeView }: { activeView: string }) {
  if (activeView === "attendance") return <FacultyAttendance />;
  if (activeView === "assignments") return <FacultyAssignments />;
  return <FacultyOverview />;
}

function FacultyOverview() {
  const { token } = useAuth();
  const dashboard = useAsync(() => api<FacultyDashboardData>("/dashboard", {}, token), [token]);

  return (
    <>
      <PageHeader
        eyebrow="Faculty workspace"
        title="Teach, track, and grade"
        subtitle="Manage your assigned courses, attendance sessions, and student submissions."
      />
      <div className="stat-grid">
        <StatCard label="Assigned courses" value={dashboard.data?.assignedCourses.length ?? 0} />
        <StatCard label="Pending grades" value={dashboard.data?.pendingGrades ?? 0} tone="gold" />
        <StatCard label="Recent sessions" value={dashboard.data?.recentSessions.length ?? 0} tone="blue" />
      </div>
      <Card>
        <div className="card-head">
          <h3>Assigned courses</h3>
          <StatusPill>Faculty only</StatusPill>
        </div>
        {dashboard.data?.assignedCourses.length ? (
          <div className="course-grid">
            {dashboard.data.assignedCourses.map((course) => (
              <div className="mini-course" key={course.id}>
                <span>{course.code}</span>
                <strong>{course.name}</strong>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No courses assigned" body="Ask admin to assign you to a course." />
        )}
      </Card>
    </>
  );
}

function FacultyAttendance() {
  const { token } = useAuth();
  const courses = useAsync(() => api<Course[]>("/courses", {}, token), [token]);
  const [form, setForm] = useState({ courseId: "", sessionDate: "", topic: "" });
  const [sessionId, setSessionId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [message, setMessage] = useState("");

  const createSession = async (event: FormEvent) => {
    event.preventDefault();
    const session = await api<{ id: string }>(
      "/attendance/sessions",
      {
        method: "POST",
        body: JSON.stringify(form),
      },
      token,
    );
    setSessionId(session.id);
    setMessage("Session created. Add a student ID to mark attendance.");
  };

  const markAttendance = async (event: FormEvent) => {
    event.preventDefault();
    await api(
      `/attendance/sessions/${sessionId}/records`,
      {
        method: "POST",
        body: JSON.stringify({ records: [{ studentId, status: "present" }] }),
      },
      token,
    );
    setMessage("Attendance marked as present.");
  };

  return (
    <>
      <PageHeader
        eyebrow="Attendance"
        title="Create sessions and mark presence"
        subtitle="Attendance is stored per class session, so percentages stay accurate."
      />
      <div className="two-column">
        <Card>
          <h3>Create session</h3>
          <form className="form-grid" onSubmit={createSession}>
            <Field label="Course">
              <select
                required
                value={form.courseId}
                onChange={(event) => setForm({ ...form, courseId: event.target.value })}
              >
                <option value="">Select course</option>
                {courses.data?.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <input
                required
                type="date"
                value={form.sessionDate}
                onChange={(event) => setForm({ ...form, sessionDate: event.target.value })}
              />
            </Field>
            <Field label="Topic">
              <input
                value={form.topic}
                onChange={(event) => setForm({ ...form, topic: event.target.value })}
              />
            </Field>
            <button className="primary-button">Create session</button>
          </form>
        </Card>

        <Card>
          <h3>Mark attendance</h3>
          <form className="form-grid" onSubmit={markAttendance}>
            <Field label="Session ID">
              <input
                required
                value={sessionId}
                onChange={(event) => setSessionId(event.target.value)}
              />
            </Field>
            <Field label="Student ID">
              <input
                required
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
              />
            </Field>
            <button className="primary-button">Mark present</button>
            {message ? <p className="success-text">{message}</p> : null}
          </form>
        </Card>
      </div>
    </>
  );
}

function FacultyAssignments() {
  const { token } = useAuth();
  const courses = useAsync(() => api<Course[]>("/courses", {}, token), [token]);
  const assignments = useAsync(() => api<Assignment[]>("/assignments", {}, token), [token]);
  const [form, setForm] = useState({
    courseId: "",
    title: "",
    description: "",
    deadline: "",
    maxMarks: 10,
  });
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [message, setMessage] = useState("");

  const createAssignment = async (event: FormEvent) => {
    event.preventDefault();
    await api<Assignment>(
      "/assignments",
      {
        method: "POST",
        body: JSON.stringify({
          ...form,
          deadline: new Date(form.deadline).toISOString(),
        }),
      },
      token,
    );
    setForm({ courseId: "", title: "", description: "", deadline: "", maxMarks: 10 });
    setMessage("Assignment created successfully.");
    assignments.reload();
  };

  const loadSubmissions = async (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    const data = await api<Submission[]>(`/assignments/${assignmentId}/submissions`, {}, token);
    setSubmissions(data);
  };

  const gradeSubmission = async (submissionId: string) => {
    await api(
      `/grades/submissions/${submissionId}`,
      {
        method: "POST",
        body: JSON.stringify({ marks: 9, feedback: "Reviewed from faculty dashboard" }),
      },
      token,
    );
    setMessage("Submission graded with 9 marks.");
    if (selectedAssignmentId) await loadSubmissions(selectedAssignmentId);
  };

  return (
    <>
      <PageHeader
        eyebrow="Assignments"
        title="Post work and review submissions"
        subtitle="Create course assignments, inspect submissions, and publish grades."
      />
      <div className="two-column">
        <Card>
          <h3>Create assignment</h3>
          <form className="form-grid" onSubmit={createAssignment}>
            <Field label="Course">
              <select
                required
                value={form.courseId}
                onChange={(event) => setForm({ ...form, courseId: event.target.value })}
              >
                <option value="">Select course</option>
                {courses.data?.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Title">
              <input
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </Field>
            <Field label="Deadline">
              <input
                required
                type="datetime-local"
                value={form.deadline}
                onChange={(event) => setForm({ ...form, deadline: event.target.value })}
              />
            </Field>
            <Field label="Max marks">
              <input
                type="number"
                value={form.maxMarks}
                onChange={(event) => setForm({ ...form, maxMarks: Number(event.target.value) })}
              />
            </Field>
            <button className="primary-button">Create assignment</button>
          </form>
        </Card>

        <Card>
          <div className="card-head">
            <h3>Assignments</h3>
            <StatusPill>{assignments.data?.length ?? 0}</StatusPill>
          </div>
          <div className="stack-list">
            {assignments.data?.map((assignment) => (
              <button
                className="list-row button-row"
                key={assignment.id}
                onClick={() => loadSubmissions(assignment.id)}
              >
                <span>{assignment.title}</span>
                <strong>{assignment.course_code}</strong>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="card-head">
          <h3>Submissions</h3>
          <StatusPill>{submissions.length} loaded</StatusPill>
        </div>
        {message ? <p className="success-text">{message}</p> : null}
        {submissions.length ? (
          <div className="stack-list">
            {submissions.map((submission) => (
              <div className="list-row" key={submission.id}>
                <span>{submission.student_name ?? submission.student_id}</span>
                <strong>{submission.marks ? `${submission.marks} marks` : "Ungraded"}</strong>
                <button className="small-button" onClick={() => gradeSubmission(submission.id)}>
                  Grade 9/10
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No submissions loaded" body="Select an assignment to review submissions." />
        )}
      </Card>
    </>
  );
}
