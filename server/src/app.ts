import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { env } from "./config/env";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import courseRoutes from "./modules/courses/course.routes";
import enrollmentRoutes from "./modules/enrollment/enrollment.routes";
import attendanceRoutes from "./modules/academic/attendance/attendance.routes";
import assignmentRoutes from "./modules/academic/assignments/assignments.routes";
import gradeRoutes from "./modules/academic/grades/grades.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import notificationRoutes from "./modules/notifications/notifications.routes";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

export const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// Fallback if running from root
if (!fs.existsSync(path.join(process.cwd(), "uploads"))) {
  app.use("/uploads", express.static(path.join(process.cwd(), "server", "uploads")));
}

app.get("/", (_req, res) => {
  res.json({
    success: true,
    name: "SmartCampus API",
    message: "Backend is running. Use /api/health for health check.",
    docs: {
      health: "GET /api/health",
      auth: "POST /api/auth/login",
      dashboard: "GET /api/dashboard",
      users: "GET /api/users",
      courses: "GET /api/courses",
      enrollments: "GET /api/enrollments",
      attendance: "GET /api/attendance/me",
      assignments: "GET /api/assignments",
      grades: "GET /api/grades/me",
      notifications: "GET /api/notifications",
    },
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "SmartCampus API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(notFound);
app.use(errorHandler);
