# SmartCampus Backend

SmartCampus is a modular TypeScript backend for managing users, courses, enrollments, attendance, assignments, grades, dashboards, and notifications in one place.

## Tech Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- JWT authentication
- Multer file uploads
- React
- Vite
- CSS light/dark theme system

## Setup

1. Create a Neon PostgreSQL project
2. Copy [`server/.env.example`](/Users/anurag/smartcampus/server/.env.example) to `server/.env`
3. Paste your Neon connection string into `DATABASE_URL`
4. Run [`database/schema.sql`](/Users/anurag/smartcampus/database/schema.sql)
5. Optionally run [`database/seeds/dev_seed.sql`](/Users/anurag/smartcampus/database/seeds/dev_seed.sql)
6. In [`server/`](/Users/anurag/smartcampus/server), install dependencies
7. Run `npm run dev`

## NeonDB Environment

Use this format in [`server/.env`](/Users/anurag/smartcampus/server/.env):

```env
PORT=4000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require
DATABASE_SSL=true
DATABASE_POOL_MAX=5
DATABASE_IDLE_TIMEOUT_MS=10000
DATABASE_CONNECTION_TIMEOUT_MS=10000
JWT_SECRET=smartcampus-dev-secret-key
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads/submissions
```

For local PostgreSQL only, set `DATABASE_SSL=false`.

Run schema on Neon without installing `psql`:

```bash
cd /Users/anurag/smartcampus/server
npm run db:schema
```

Run seed data on Neon without installing `psql`:

```bash
cd /Users/anurag/smartcampus/server
npm run db:seed
```

## Default Seed Credentials

- admin: `admin@smartcampus.local` / `Password@123`
- faculty: `faculty@smartcampus.local` / `Password@123`
- student: `student@smartcampus.local` / `Password@123`

## OOP Concepts Used

- Encapsulation: repositories and services keep SQL, auth logic, and business rules inside classes like [`UserRepository.ts`](/Users/anurag/smartcampus/server/src/modules/users/UserRepository.ts) and [`AuthService.ts`](/Users/anurag/smartcampus/server/src/modules/auth/AuthService.ts).
- Inheritance: shared database behavior lives in [`BaseRepository.ts`](/Users/anurag/smartcampus/server/src/shared/database/BaseRepository.ts), and concrete repositories extend it.
- Polymorphism: dashboard generation uses the same `DashboardStrategy` contract with different implementations in [`DashboardStrategies.ts`](/Users/anurag/smartcampus/server/src/modules/dashboard/DashboardStrategies.ts).
- Abstraction: interfaces like `TokenProvider`, `NotificationPublisher`, and `DashboardStrategy` hide implementation details behind clean contracts.

## Design Patterns Used

- Strategy Pattern: role-based dashboard logic is separated into Admin, Faculty, and Student strategies in [`DashboardStrategies.ts`](/Users/anurag/smartcampus/server/src/modules/dashboard/DashboardStrategies.ts).
- Factory Pattern: [`DashboardStrategyFactory.ts`](/Users/anurag/smartcampus/server/src/modules/dashboard/DashboardStrategyFactory.ts) picks the correct strategy at runtime based on user role.
- Repository Pattern: each module talks to data through repository classes instead of embedding SQL inside controllers.

## SOLID In The Codebase

- Single Responsibility Principle: controllers handle HTTP, services handle business logic, repositories handle persistence.
- Open/Closed Principle: new dashboard roles can be added by creating another strategy without changing the service contract.
- Liskov Substitution Principle: any repository extending the base repository and any dashboard strategy implementing the shared interface can be used interchangeably.
- Interface Segregation Principle: small interfaces like `TokenProvider`, `NotificationPublisher`, and `DashboardStrategy` avoid forcing classes to depend on methods they do not use.
- Dependency Inversion Principle: services depend on abstractions like `NotificationPublisher` and `TokenProvider`, not only concrete implementations.

## Main API Areas

- `/api/auth`
- `/api/users`
- `/api/courses`
- `/api/enrollments`
- `/api/attendance`
- `/api/assignments`
- `/api/grades`
- `/api/dashboard`
- `/api/notifications`

## Frontend

The React frontend lives in [`client/`](/Users/anurag/smartcampus/client).

Run it with:

```bash
cd /Users/anurag/smartcampus/client
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Backend URL:

```text
http://localhost:4000
```

The UI includes:

- modern minimalist login screen
- Admin, Faculty, and Student dashboards
- role-based navigation
- user and course management
- attendance, assignment, grading, and performance views
- light/dark theme toggle
- responsive mobile-friendly layout

## Notes

- Assignment uploads are stored under [`server/uploads/`](/Users/anurag/smartcampus/server/uploads)
- Permissions are enforced in the backend using JWT + role middleware
- Attendance is session-based so student percentages can be calculated correctly
