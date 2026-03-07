# ERM - Employee Resource Management

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.7-009688.svg)](https://fastapi.tiangolo.com/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF.svg)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack Employee Resource Management system for attendance tracking, leave management, employee administration, project management, and AI-powered insights. Built with React 19 and FastAPI in a monorepo structure.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Frontend](#frontend)
- [Backend](#backend)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Features

### Attendance Management
- Real-time clock in/out with session tracking
- Monthly attendance overview with day-by-day breakdown
- Admin live view of currently clocked-in employees
- Manual entry and flagging for administrators
- Attendance history with filters and pagination

### Leave Management
- Employee leave requests with type selection and date ranges
- Multi-level approval workflow (pending, approved, rejected)
- Leave balance tracking (annual, sick, casual, WFH, etc.)
- Admin dashboard with department-wise stats and top leave takers
- Configurable leave policies (quotas, carry-forward, blackout dates)
- Manual leave record creation for admins

### Employee Management
- Full employee CRUD with department assignment
- Employee 360 profile view
- Performance tracking with sprint history
- Employee invitation system
- Department management

### Additional Modules
- **Project Management** - Sprint boards, project notes, task tracking
- **Daily Updates** - Standup entries, team updates, progress logs
- **AI Insights** - Analytics, recommendations, and performance insights
- **Notifications** - Real-time notification system
- **Policy Management** - Company policy creation and sharing
- **Rewards** - Employee rewards and recognition

### Platform Features
- Role-based access control (Admin, Manager, Employee)
- Firebase authentication
- Dark/light theme with system preference detection
- Multi-language support (English, Hindi)
- PWA support with offline capabilities
- Responsive, mobile-first design

## Tech Stack

### Frontend

| Category | Technology |
|----------|-----------|
| Framework | React 19, Vite 6 |
| Routing | React Router 7 |
| State Management | Redux Toolkit, TanStack Query v5 |
| UI Components | Radix UI, Tailwind CSS 4, Lucide Icons |
| Forms | React Hook Form, Zod validation |
| Rich Text | BlockNote editor |
| Charts | Recharts |
| Drag & Drop | @hello-pangea/dnd |
| i18n | i18next |
| Testing | Vitest, Testing Library, MSW |

### Backend

| Category | Technology |
|----------|-----------|
| Framework | FastAPI, Uvicorn |
| ORM | Tortoise ORM, Aerich (migrations) |
| Database | SQLite (dev), PostgreSQL (prod) |
| Auth | Firebase Admin SDK |
| DI | injectq |
| Task Queue | Taskiq + Redis |
| Monitoring | Sentry, Prometheus |
| Cloud | AWS S3 (aioboto3) |
| AI | OpenAI API |

## Project Structure

```
erm-frontend/
├── src/                          # Frontend source
│   ├── pages/                    # Page components (lazy-loaded)
│   │   ├── auth/                 # Login
│   │   ├── dashboard/            # Main dashboard
│   │   ├── attendance/           # Clock in/out, history, admin views
│   │   ├── leave-admin/          # Leave dashboard, approvals, settings
│   │   ├── leave-employee/       # Employee leave requests
│   │   ├── leave-dashboard/      # Leave calendar
│   │   ├── employee-management/  # Employee CRUD, departments, profiles
│   │   ├── projects/             # Sprint board, notes
│   │   ├── daily-update/         # Standup, team updates
│   │   ├── ai/                   # AI insights & analytics
│   │   ├── notifications/        # Notification center
│   │   ├── profile/              # User profile
│   │   ├── policy/               # Company policies
│   │   └── rewards/              # Rewards system
│   ├── components/               # Reusable components
│   │   ├── ui/                   # Shadcn/Radix base components
│   │   ├── layout/               # MainLayout, BlankLayout
│   │   └── guards/               # Role-based route guards
│   ├── services/                 # API, state, mocking
│   │   ├── api/                  # Axios API layer
│   │   ├── query/                # TanStack Query hooks
│   │   ├── store/                # Redux slices
│   │   └── mock/                 # MSW handlers
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utils, constants, context
│   └── route/                    # Route configuration
├── backend/                      # Backend source
│   ├── src/app/
│   │   ├── main.py               # FastAPI app entry
│   │   ├── core/
│   │   │   ├── auth/             # Authentication, RBAC
│   │   │   ├── config/           # Settings, middleware, logging
│   │   │   ├── exceptions/       # Error handlers
│   │   │   └── di.py             # Dependency injection
│   │   ├── db/
│   │   │   ├── tables/           # ORM models
│   │   │   ├── views/            # Database views
│   │   │   └── setup_database.py # Tortoise config
│   │   ├── routers/
│   │   │   ├── auth/             # Auth endpoints
│   │   │   ├── attendance/       # Attendance endpoints
│   │   │   ├── employee_management/ # Employee endpoints
│   │   │   └── leave/            # Leave endpoints
│   │   └── utils/                # Helpers, schemas, response wrappers
│   ├── scripts/
│   │   └── seed_data.py          # Database seeding
│   └── migrations/               # Aerich migrations
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **Python** 3.12
- **Redis** (for task queue)
- **Docker** (optional)

### Quick Start with Docker

```bash
# Clone the repository
git clone <repo-url>
cd erm-frontend

# Start backend services
docker-compose up -d

# Install frontend dependencies and start dev server
npm install
npm run dev
```

### Manual Setup

#### Frontend

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.development

# Start dev server (http://localhost:3030)
npm run dev
```

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
aerich upgrade

# Seed sample data
python -m scripts.seed_data

# Start server (http://localhost:8082)
uvicorn src.app.main:app --host 0.0.0.0 --port 8082 --reload
```

### Environment Variables

#### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8082
VITE_APP_NAME=ERM
VITE_API_TIMEOUT=100000
VITE_ENABLE_MOCKING=false
VITE_ENABLE_DEVTOOLS=true
```

#### Backend (.env)

```env
APP_NAME=ERM Backend
MODE=DEVELOPMENT
DATABASE_TYPE=sqlite
SQLITE_DB_PATH=./db.sqlite3
REDIS_URL=redis://localhost:6379
LOG_LEVEL=20
```

## Frontend

### Available Scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix lint errors
npm run format           # Format with Prettier
npm run test             # Run tests (watch mode)
npm run test:ui          # Tests with UI + coverage
npm run test:coverage    # Generate coverage report
```

### Architecture

The frontend follows a feature-first organization with clear separation of concerns:

- **Pages** - Route-level components with business logic
- **Components** - Reusable, presentational UI components
- **Services** - API layer (Axios), server state (TanStack Query), client state (Redux)
- **Guards** - Role-based route protection (admin, manager, employee)
- **Hooks** - Shared custom React hooks

### Key Patterns

**API calls** go through a service layer with TanStack Query for caching and synchronization:

```javascript
// services/api/attendance.api.js
export const getAttendanceStatus = (options) =>
  api.get("/v1/attendance/status", options)

// services/query/attendance.query.js
export const useAttendanceStatus = () =>
  useQuery({
    queryKey: ["attendance", "status"],
    queryFn: ({ signal }) => getAttendanceStatus({ signal }),
  })
```

**Route guards** restrict access based on user roles:

```jsx
<Route element={<LeaveRoleGuard allowed={["admin", "manager"]} />}>
  <Route path="/leave-admin" element={<LeaveAdminDashboard />} />
</Route>
```

## Backend

### Architecture

The backend follows a layered architecture:

```
Router (endpoint) -> Service (business logic) -> Repository (data access)
```

- **Routers** define API endpoints with Pydantic request/response schemas
- **Services** handle business logic, accept `AuthUserSchema`, resolve employees internally
- **Repositories** abstract database queries using Tortoise ORM
- **Schemas** validate input/output with Pydantic v2 (camelCase serialization)

### Authentication & RBAC

All endpoints are protected via `get_current_user` (Firebase) or `require_role()`:

```python
# Any authenticated user
user: AuthUserSchema = Depends(get_current_user)

# Admin or manager only
user: AuthUserSchema = Depends(require_role("admin", "manager"))

# Admin only
user: AuthUserSchema = Depends(require_role("admin"))
```

### Database

- **Dev**: SQLite (zero config)
- **Prod**: PostgreSQL (async via asyncpg)
- **Migrations**: Aerich (Tortoise ORM migration tool)
- **Seeding**: `python -m scripts.seed_data` creates departments, leave types, employees, and leave balances

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/v1/users/me` | Authenticated | Get current user profile |

### Attendance
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/v1/attendance/status` | Employee | Current clock-in status |
| POST | `/v1/attendance/clock-in` | Employee | Start attendance session |
| POST | `/v1/attendance/clock-out` | Employee | End attendance session |
| GET | `/v1/attendance/today` | Employee | Today's entries |
| GET | `/v1/attendance/history` | Employee | Paginated history |
| GET | `/v1/attendance/admin/logs` | Manager, Admin | All attendance logs |
| PATCH | `/v1/attendance/admin/logs/{id}` | Admin | Edit an entry |
| PATCH | `/v1/attendance/admin/logs/{id}/flag` | Admin | Flag/unflag entry |
| POST | `/v1/attendance/admin/manual-entry` | Admin | Create manual entry |
| GET | `/v1/attendance/admin/live` | Manager, Admin | Live clocked-in view |
| GET | `/v1/attendance/admin/summary` | Manager, Admin | Summary statistics |

### Leave Management
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/v1/leave/attendance` | Manager, Admin | Monthly attendance overview |
| GET | `/v1/leave/admin/summary` | Manager, Admin | Leave dashboard stats |
| GET | `/v1/leave/admin/approvals` | Manager, Admin | List approval requests |
| PATCH | `/v1/leave/admin/approvals/{id}` | Manager, Admin | Approve/reject request |
| POST | `/v1/leave/admin/manual-record` | Admin | Create manual leave record |
| GET | `/v1/leave/admin/employees` | Manager, Admin | Employee list for selection |
| GET | `/v1/leave/employee/profile` | Employee | Leave balances & history |
| POST | `/v1/leave/employee/request` | Employee | Submit leave request |
| GET | `/v1/leave/admin/settings` | Admin | Get leave policy settings |
| PATCH | `/v1/leave/admin/settings` | Admin | Update leave settings |
| GET | `/v1/leave/attendance/day` | Manager, Admin | Day-level attendance detail |

### Employee Management
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/v1/employee-management` | Manager, Admin | List employees |
| GET | `/v1/employee-management/{id}` | Manager, Admin | Get employee details |
| POST | `/v1/employee-management` | Admin | Create employee |
| PATCH | `/v1/employee-management/{id}` | Admin | Update employee |
| DELETE | `/v1/employee-management/{id}` | Admin | Deactivate employee |
| POST | `/v1/employee-management/invite` | Admin | Invite employee |
| GET | `/v1/employee/performance` | Authenticated | Get performance data |

## Testing

### Frontend

```bash
npm run test              # Watch mode
npm run test:coverage     # Coverage report (80% threshold)
```

- **Vitest** as test runner
- **Testing Library** for component tests
- **MSW** for API mocking

### Backend

```bash
cd backend
pytest                    # Run all tests
ruff check .              # Linting
mypy .                    # Type checking
bandit -r src/            # Security scan
```

## Deployment

### Docker

```bash
# Build and run all services
docker-compose up -d --build
```

Services:
- **base_app** - FastAPI server on port 8082
- **base_worker** - Taskiq background worker

### Production Build (Frontend)

```bash
npm run build             # Output: dist/
npm run build:verify      # Build + validation
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Write tests for your changes
4. Ensure tests pass (`npm run test` and `pytest`)
5. Run linting (`npm run lint` and `ruff check .`)
6. Commit and push
7. Open a Pull Request

## License

This project is licensed under the MIT License.
