# Task Management System (Full Stack)

A Task Management System where users can **register/login** and manage their **personal tasks** (CRUD + search/filter/pagination).  
Built for a software engineering assessment.

---

## Tech Stack

### Backend
- Node.js + TypeScript + Express
- PostgreSQL + Prisma ORM
- JWT Auth (Access Token + Refresh Token)
- Password hashing with `bcrypt`
- Validation with `zod`
- Architecture: `routes → controllers → services` + `validation` + `middleware`

### Frontend
- Next.js (App Router) + TypeScript
- Bootstrap + custom CSS (dark theme)
- Auth Context for session state
- API client with refresh-token flow
- Dev proxy (`/api/*`) → backend to make cookies work on localhost

---

## Features

### Authentication
- Register, Login, Refresh, Logout
- Access token returned in JSON
- Refresh token stored in **httpOnly cookie**
- `/auth/me` returns logged-in user info (id/email)

### Tasks
- Create, Read, Update, Delete
- Toggle completion
- `GET /tasks` supports:
  - Pagination: `page`, `limit`
  - Filter by status: `status=pending|completed`
  - Search by title: `search=...`
- All tasks are scoped to the logged-in user

---

## Project Structure

task-manager/

backend/
src/
app/
config/
controllers/
middleware/
routes/
services/
types/
utils/
validation/
prisma/
docker-compose.yml

Frontend/
src/
app/
components/
context/
lib/
next.config.js


---

## Prerequisites
- Node.js 18+ (recommended)
- Docker Desktop (for Postgres)

---

## Setup (Local)

### 1) Start PostgreSQL (Docker)

cd backend
docker compose up -d

### 2) Backend setup
`cd backend`
`cp .env.example .env`
`npm install`
`pm run prisma:migrate -- --name init`
`npm run dev`

- Backend runs on: `http://localhost:5050`

#### Quick check:

curl `http://localhost:5050/health`

### 3) Frontend setup
`cd frontend`
`cp .env.local.example .env.local`
`npm install`
`npm run dev`

- Frontend runs on: `http://localhost:5173`

#### Important Dev Note (Cookies on localhost)

Refresh token is stored as an httpOnly cookie.
To make cookies work smoothly on localhost without SameSite=None; Secure, the frontend proxies requests:

- Frontend calls: /api/...

- Next.js rewrites to: http://localhost:5050/...

- Configured in frontend/next.config.js.

### API Endpoints
#### Auth

- POST /auth/register

- POST /auth/login

- POST /auth/refresh

- POST /auth/logout

- GET /auth/me (protected)

#### Tasks (protected)

- GET /tasks (pagination + filter + search)

- POST /tasks

- GET /tasks/:id

- PATCH /tasks/:id

- DELETE /tasks/:id

- POST /tasks/:id/toggle



#### UI Demo Flow

- Open `http://localhost:5173/register`

- Create account → redirected to dashboard

- Dashboard shows: Logged in as: your email

- Create tasks, edit via modal, delete, toggle completion

- Use search + filter + pagination

- Logout

### Scripts

#### Backend

- npm run dev

- npm run prisma:migrate

- npm run build

- npm start

#### Frontend

- npm run dev

- npm run build

- npm start
