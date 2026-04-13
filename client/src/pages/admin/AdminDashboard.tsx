import { FormEvent, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useAsync } from "../../hooks/useAsync";
import { Course, Enrollment, User } from "../../types";
import { Card, EmptyState, Field, PageHeader, StatCard, StatusPill } from "../../components/ui";

interface AdminDashboardData {
  usersByRole: Array<{ role: string; total: number }>;
  coursesByStatus: Array<{ status: string; total: number }>;
  totalEnrollments: number;
  totalAssignments: number;
}

export function AdminDashboard({ activeView }: { activeView: string }) {
  if (activeView === "users") return <AdminUsers />;
  if (activeView === "courses") return <AdminCourses />;
  return <AdminOverview />;
}

function AdminOverview() {
  const { token } = useAuth();
  const dashboard = useAsync(() => api<AdminDashboardData>("/dashboard", {}, token), [token]);
  const enrollments = useAsync(() => api<Enrollment[]>("/enrollments", {}, token), [token]);

  const totalUsers =
    dashboard.data?.usersByRole.reduce((sum, item) => sum + Number(item.total), 0) ?? 0;
  const totalCourses =
    dashboard.data?.coursesByStatus.reduce((sum, item) => sum + Number(item.total), 0) ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Admin console"
        title="Campus command center"
        subtitle="A clean overview of users, courses, enrollments and academic activity."
      />
      <div className="stat-grid">
        <StatCard label="Total users" value={totalUsers} />
        <StatCard label="Courses" value={totalCourses} tone="blue" />
        <StatCard label="Enrollments" value={dashboard.data?.totalEnrollments ?? 0} tone="gold" />
        <StatCard label="Assignments" value={dashboard.data?.totalAssignments ?? 0} tone="rose" />
      </div>

      <div className="two-column">
        <Card>
          <div className="card-head">
            <h3>Users by role</h3>
            <StatusPill>Live from NeonDB</StatusPill>
          </div>
          <div className="stack-list">
            {dashboard.data?.usersByRole.map((item) => (
              <div className="list-row" key={item.role}>
                <span>{item.role}</span>
                <strong>{item.total}</strong>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="card-head">
            <h3>Recent enrollments</h3>
          </div>
          {enrollments.data?.length ? (
            <div className="stack-list">
              {enrollments.data.slice(0, 5).map((item) => (
                <div className="list-row" key={item.id}>
                  <span>{item.student_name}</span>
                  <strong>{item.course_code}</strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No enrollments yet" body="Student enrollments will appear here." />
          )}
        </Card>
      </div>
    </>
  );
}

function AdminUsers() {
  const { token } = useAuth();
  const users = useAsync(() => api<User[]>("/users", {}, token), [token]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "Password@123",
    role: "student",
  });
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    await api<User>(
      "/users",
      {
        method: "POST",
        body: JSON.stringify(form),
      },
      token,
    );
    setForm({ name: "", email: "", password: "Password@123", role: "student" });
    setMessage("User created successfully.");
    users.reload();
  };

  return (
    <>
      <PageHeader
        eyebrow="User management"
        title="Create and manage accounts"
        subtitle="Admin can create Faculty and Student users with role-based access."
      />
      <div className="two-column">
        <Card>
          <h3>Create user</h3>
          <form className="form-grid" onSubmit={submit}>
            <Field label="Name">
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </Field>
            <Field label="Email">
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </Field>
            <Field label="Password">
              <input
                required
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </Field>
            <Field label="Role">
              <select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            <button className="primary-button">Create user</button>
            {message ? <p className="success-text">{message}</p> : null}
          </form>
        </Card>

        <Card>
          <div className="card-head">
            <h3>All users</h3>
            <StatusPill>{users.data?.length ?? 0} records</StatusPill>
          </div>
          <DataTable
            rows={(users.data ?? []) as unknown as Array<Record<string, unknown>>}
            columns={[
              ["name", "Name"],
              ["email", "Email"],
              ["role", "Role"],
            ]}
          />
        </Card>
      </div>
    </>
  );
}

function AdminCourses() {
  const { token } = useAuth();
  const courses = useAsync(() => api<Course[]>("/courses", {}, token), [token]);
  const faculty = useAsync(() => api<User[]>("/users?role=faculty", {}, token), [token]);
  const [courseForm, setCourseForm] = useState({
    code: "",
    name: "",
    description: "",
    capacity: 60,
  });
  const [assignment, setAssignment] = useState({ courseId: "", facultyId: "" });
  const [message, setMessage] = useState("");

  const createCourse = async (event: FormEvent) => {
    event.preventDefault();
    await api<Course>(
      "/courses",
      {
        method: "POST",
        body: JSON.stringify(courseForm),
      },
      token,
    );
    setCourseForm({ code: "", name: "", description: "", capacity: 60 });
    setMessage("Course created successfully.");
    courses.reload();
  };

  const assignFaculty = async (event: FormEvent) => {
    event.preventDefault();
    await api(
      `/courses/${assignment.courseId}/faculty`,
      {
        method: "POST",
        body: JSON.stringify({ facultyId: assignment.facultyId }),
      },
      token,
    );
    setMessage("Faculty assigned successfully.");
  };

  return (
    <>
      <PageHeader
        eyebrow="Course management"
        title="Build the academic catalog"
        subtitle="Create courses and connect faculty members to active courses."
      />
      <div className="two-column">
        <Card>
          <h3>Create course</h3>
          <form className="form-grid" onSubmit={createCourse}>
            <Field label="Course code">
              <input
                required
                value={courseForm.code}
                onChange={(event) => setCourseForm({ ...courseForm, code: event.target.value })}
              />
            </Field>
            <Field label="Course name">
              <input
                required
                value={courseForm.name}
                onChange={(event) => setCourseForm({ ...courseForm, name: event.target.value })}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={courseForm.description}
                onChange={(event) =>
                  setCourseForm({ ...courseForm, description: event.target.value })
                }
              />
            </Field>
            <Field label="Capacity">
              <input
                type="number"
                value={courseForm.capacity}
                onChange={(event) =>
                  setCourseForm({ ...courseForm, capacity: Number(event.target.value) })
                }
              />
            </Field>
            <button className="primary-button">Create course</button>
          </form>
        </Card>

        <Card>
          <h3>Assign faculty</h3>
          <form className="form-grid" onSubmit={assignFaculty}>
            <Field label="Course">
              <select
                required
                value={assignment.courseId}
                onChange={(event) => setAssignment({ ...assignment, courseId: event.target.value })}
              >
                <option value="">Select course</option>
                {courses.data?.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Faculty">
              <select
                required
                value={assignment.facultyId}
                onChange={(event) =>
                  setAssignment({ ...assignment, facultyId: event.target.value })
                }
              >
                <option value="">Select faculty</option>
                {faculty.data?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </Field>
            <button className="primary-button">Assign faculty</button>
            {message ? <p className="success-text">{message}</p> : null}
          </form>
        </Card>
      </div>

      <Card>
        <div className="card-head">
          <h3>Courses</h3>
          <StatusPill>{courses.data?.length ?? 0} courses</StatusPill>
        </div>
        <DataTable
          rows={(courses.data ?? []) as unknown as Array<Record<string, unknown>>}
          columns={[
            ["code", "Code"],
            ["name", "Course"],
            ["status", "Status"],
            ["enrolled_students", "Students"],
          ]}
        />
      </Card>
    </>
  );
}

function DataTable({
  rows,
  columns,
}: {
  rows: Array<Record<string, unknown>>;
  columns: Array<[string, string]>;
}) {
  if (!rows.length) {
    return <EmptyState title="Nothing here yet" body="Records will appear when data is added." />;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map(([, label]) => (
              <th key={label}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>
              {columns.map(([key]) => (
                <td key={key}>{String(row[key] ?? "-")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
