# Employee Expense Reimbursement Management System

Full-stack app for submitting, approving, and monitoring employee expense reimbursements with role-based access for **Admin**, **Manager**, and **Employee**.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite) + Tailwind CSS + React Router + Recharts |
| Backend | Node.js + Express |
| Database | MySQL |
| Auth | JWT + bcrypt |

## Project Structure

```
task16/
├── backend/          # Express REST API
├── frontend/         # React + Tailwind UI
└── README.md
```

## Prerequisites

- Node.js 18+
- MySQL 8+
- npm

## Database Setup

1. Start MySQL and ensure you can connect as a user with create-database privileges.

2. Update `backend/.env` with your credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=expense_reimbursement
JWT_SECRET=expense_reimbursement_jwt_secret_change_me
JWT_EXPIRES_IN=7d
```

3. From the `backend` folder, install dependencies and run the seed script (applies schema + demo data):

```bash
cd backend
npm install
npm run seed
```

You can also apply schema manually:

```bash
mysql -u root -p < schema.sql
```

Then run `npm run seed` to insert bcrypt-hashed users and sample expenses.

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # edit DB_PASSWORD
npm run seed
npm run dev            # or: npm start
```

API base URL: `http://localhost:5000/api`  
Health check: `GET http://localhost:5000/api/health`

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env   # optional; defaults to http://localhost:5000/api
npm run dev
```

App URL: `http://localhost:5173`

## Test User Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@expense.com` | `Admin@123` |
| Manager | `manager@expense.com` | `Manager@123` |
| Employee | `employee@expense.com` | `Employee@123` |
| Employee | `jordan@expense.com` | `Employee@123` |

Public registration creates **employee** accounts only. Admins can create managers/admins under **Users**.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register (employee) |
| POST | `/api/login` | Login, returns JWT |
| GET | `/api/profile` | Current user (auth) |

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List (search, status, category, employee_id, sort, page, limit) |
| GET | `/api/expenses/:id` | Get one |
| POST | `/api/expenses` | Create (employee) |
| PUT | `/api/expenses/:id` | Update pending (owner) |
| DELETE | `/api/expenses/:id` | Cancel pending |

### Approvals

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/expenses/:id/approve` | Approve (manager/admin) |
| PUT | `/api/expenses/:id/reject` | Reject with comment (manager/admin) |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/employee` | Employee stats |
| GET | `/api/dashboard/manager` | Manager stats + pending queue |
| GET | `/api/dashboard/admin` | Admin stats, monthly/category reports |

### Users (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/users/employees` | Employee dropdown (manager/admin) |

Send JWT as: `Authorization: Bearer <token>`

## Features Implemented

- JWT authentication, logout, protected routes, role-based navigation
- Employee: submit expense, mock receipt upload (filename), view/edit/cancel pending
- Manager: view requests, approve/reject with comments, filter by employee & status
- Admin: all expenses, user management, dashboards, monthly reports with charts
- Search by title, filter by status/category, sort by date, pagination
- Form validation, loading indicators, toast notifications, CSV export
- Responsive UI (desktop & mobile)

## Database Tables

**users** — id, name, email, password, role  
**expenses** — id, employee_id, title, category, amount, expense_date, description, receipt, status, manager_comments, created_at

Statuses: `pending` | `approved` | `rejected` | `cancelled`

## Screenshots (for submission)

Capture and attach:

1. Login page  
2. Employee dashboard  
3. Expense submission  
4. Manager approval page  
5. Admin dashboard  
6. Reports page  

## Demo Video Outline (5–7 min)

1. Login as employee → submit expense with receipt filename  
2. Login as manager → approve one, reject one with comment  
3. Login as admin → dashboard stats, users, monthly reports  

## License

For academic / assignment use.
