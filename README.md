# Employee Attendance System

A full-stack employee attendance management application with separate Vue frontend and Express/TypeScript backend projects.

## Features

- Role-based login for administrators and employees
- Dashboard attendance statistics
- Employee check-in and check-out
- Attendance log viewing and manual attendance records
- Leave applications and admin approval/rejection
- Employee management for administrators
- Holiday viewing and administration
- MongoDB-backed persistence

## Technology

- Frontend: Vue 3, TypeScript, Vite, Pinia, Vue Router, Tailwind CSS
- Backend: Node.js, Express, TypeScript, Mongoose
- Database: MongoDB

## Requirements

- Node.js 18 or newer
- npm
- MongoDB running locally or a MongoDB connection URI

## Project structure

```text
.
├── backend/     Express API and MongoDB models
└── frontend/    Vue application
```

## Getting started

Clone the repository and install dependencies in both applications:

```bash
git clone https://github.com/bidhuprasadpandaai-sys/employee_attendance_system.git
cd employee_attendance_system

cd backend
npm install

cd ../frontend
npm install
```

### Configure MongoDB

The backend defaults to:

```text
mongodb://127.0.0.1:27017/employee_attendance
```

To use another database, create `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/employee_attendance
PORT=5001
NODE_ENV=development
```

Do not commit credentials or production connection strings to the repository.

### Seed demo data

With MongoDB running, execute:

```bash
cd backend
npm run seed
```

The seeder clears the existing employee, attendance, leave, and holiday collections before creating demo data. Use it only for development or disposable environments.

### Run the applications

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

The API is available at `http://localhost:5001`.

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The frontend currently sends API requests to `http://localhost:5001/api`. Update `frontend/src/utils/api.ts` if the backend is hosted elsewhere.

## Demo credentials

These accounts are created by `npm run seed`:

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@attendance.com` | `admin123` |
| Employee | Use a seeded employee email | `password123` |

The seeder generates employee email addresses from their generated names, so inspect the seeded database when testing a specific employee account.

## Useful commands

### Backend

```bash
npm run dev       # Start with TypeScript watch mode
npm run build     # Compile TypeScript to dist/
npm start         # Run the compiled server
npm run seed      # Replace database contents with demo data
```

### Frontend

```bash
npm run dev       # Start the Vite development server
npm run build     # Type-check and create a production build
npm run preview   # Preview the production build locally
```

## API overview

The backend mounts routes under `/api`.

- `POST /api/auth/login` — authenticate a user
- `GET /api/auth/profile` — retrieve the authenticated profile
- `GET /api/dashboard/stats` — dashboard metrics
- `POST /api/attendance/checkin` — check in
- `POST /api/attendance/checkout` — check out
- `GET /api/attendance/logs` — attendance records
- `GET /api/leaves` and `POST /api/leaves` — view and apply for leave
- `GET /api/employees` — list employees
- Admin-only employee, holiday, manual attendance, and leave status endpoints are also available in `backend/src/routes/api.ts`.

Authenticated requests must include the token returned by login:

```http
Authorization: Bearer <token>
```

## Notes

- CORS is configured for the local frontend origins `http://localhost:5173` and `http://127.0.0.1:5173`.
- The current development authentication token is a base64-encoded user identifier and role. Use a stronger, signed token strategy before deploying to production.
