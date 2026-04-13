INSERT INTO users (name, email, password_hash, role)
VALUES
  ('System Admin', 'admin@smartcampus.local', '$2a$10$bCjh.MwOYWRn5EbjTaNEnuQNMt6TqzPUMwfNuF99JWZAj4wVbWjqW', 'admin'),
  ('Dr. Meera Singh', 'faculty@smartcampus.local', '$2a$10$bCjh.MwOYWRn5EbjTaNEnuQNMt6TqzPUMwfNuF99JWZAj4wVbWjqW', 'faculty'),
  ('Riya Sharma', 'student@smartcampus.local', '$2a$10$bCjh.MwOYWRn5EbjTaNEnuQNMt6TqzPUMwfNuF99JWZAj4wVbWjqW', 'student')
ON CONFLICT (email)
DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = true,
  updated_at = NOW();

INSERT INTO courses (code, name, description, status, capacity)
VALUES
  ('CS101', 'Introduction to Computing', 'Core foundations course for first-year students', 'active', 60)
ON CONFLICT (code) DO NOTHING;

INSERT INTO course_faculty (course_id, faculty_id)
SELECT c.id, u.id
FROM courses c, users u
WHERE c.code = 'CS101' AND u.email = 'faculty@smartcampus.local'
ON CONFLICT (course_id, faculty_id) DO NOTHING;

INSERT INTO enrollments (course_id, student_id)
SELECT c.id, u.id
FROM courses c, users u
WHERE c.code = 'CS101' AND u.email = 'student@smartcampus.local'
ON CONFLICT (course_id, student_id) DO NOTHING;
