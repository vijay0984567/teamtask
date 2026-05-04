# TeamTask — Production-Ready Team Task Manager

A full-stack project and task management web app with role-based access control, JWT auth, and real-time dashboard insights.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| Deployment | Railway |

---

## 📁 Project Structure

```
teamtask/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   └── taskController.js
│   ├── middleware/auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   └── users.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/index.js
    │   ├── components/
    │   │   ├── layout/Layout.jsx
    │   │   └── ui/
    │   │       ├── Modal.jsx
    │   │       ├── TaskModal.jsx
    │   │       ├── StatusBadge.jsx
    │   │       ├── EmptyState.jsx
    │   │       └── LoadingSpinner.jsx
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ProjectsPage.jsx
    │   │   └── ProjectDetailPage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### 1. Clone & Install

```bash
git clone <your-repo>
cd teamtask

# Backend
cd backend
cp .env.example .env
npm install

# Frontend
cd ../frontend
cp .env.example .env
npm install
```

### 2. Configure Environment Variables

**backend/.env**
```env
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/teamtask
JWT_SECRET=change_this_to_something_long_and_random_32chars
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**frontend/.env**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Locally

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

App runs at: http://localhost:5173

---

## 🗄️ Database Schema

### User
| Field | Type | Notes |
|-------|------|-------|
| name | String | required |
| email | String | unique, lowercase |
| password | String | bcrypt hashed |
| role | Enum | Admin / Member |

### Project
| Field | Type | Notes |
|-------|------|-------|
| name | String | required |
| description | String | optional |
| createdBy | ObjectId | ref: User |
| members | Array | [{user, role}] |
| color | String | hex color |

### Task
| Field | Type | Notes |
|-------|------|-------|
| title | String | required |
| description | String | optional |
| projectId | ObjectId | ref: Project |
| assignedTo | ObjectId | ref: User |
| createdBy | ObjectId | ref: User |
| status | Enum | Todo / In Progress / Done |
| priority | Enum | Low / Medium / High |
| dueDate | Date | optional |

---

## 🔗 API Documentation

### Auth Routes

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | /api/auth/signup | ❌ | {name, email, password, role} |
| POST | /api/auth/login | ❌ | {email, password} |
| GET | /api/auth/me | ✅ | — |

### Project Routes

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | /api/projects | ✅ | Returns user's projects |
| POST | /api/projects | ✅ | Create project |
| GET | /api/projects/:id | ✅ | Project + members |
| PUT | /api/projects/:id | ✅ Admin | Update project |
| DELETE | /api/projects/:id | ✅ Admin | Delete + tasks |
| POST | /api/projects/:id/members | ✅ Admin | Add member by email |
| DELETE | /api/projects/:id/members/:userId | ✅ Admin | Remove member |

### Task Routes

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | /api/tasks/dashboard | ✅ | Stats + overdue |
| GET | /api/tasks | ✅ | ?projectId=&status= |
| POST | /api/tasks | ✅ Admin | Create task |
| PUT | /api/tasks/:id | ✅ | Admin: all fields; Member: status only |
| DELETE | /api/tasks/:id | ✅ Admin | Delete task |

---

## 🚢 Railway Deployment

### Step 1: MongoDB Atlas

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free cluster
2. Database Access → Create user with password
3. Network Access → Allow `0.0.0.0/0`
4. Connect → Get your connection string

### Step 2: Deploy Backend on Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your repo → Select the `backend` folder as root (or set Root Directory to `backend`)
3. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_random_32_char_secret
   JWT_EXPIRES_IN=7d
   CLIENT_URL=https://your-frontend.railway.app
   PORT=5000
   ```
4. Railway auto-detects Node.js and runs `npm start`
5. Copy your backend Railway URL (e.g., `https://teamtask-backend.railway.app`)

### Step 3: Deploy Frontend on Railway

1. New Service → GitHub → select repo → Root Directory: `frontend`
2. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
3. Build Command: `npm run build`
4. Start Command: `npx serve dist -p $PORT`

   Or install serve: add to frontend package.json:
   ```json
   "start": "npx serve dist -p $PORT"
   ```

5. After deploy, copy the frontend URL
6. Go back to backend service → update `CLIENT_URL` to the frontend URL

### Step 4: Verify Deployment

```bash
curl https://your-backend.railway.app/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | demo123 |
| Member | member@demo.com | demo123 |

> Note: These are shown on the login page for easy testing. Create these accounts via signup to use them.

---

## 🔐 Role-Based Access

| Action | Admin | Member |
|--------|-------|--------|
| Create project | ✅ | ✅ |
| Delete project | ✅ (own) | ❌ |
| Add/remove members | ✅ | ❌ |
| Create tasks | ✅ | ❌ |
| Delete tasks | ✅ | ❌ |
| Update any task field | ✅ | ❌ |
| Update own task status | ✅ | ✅ |
| View dashboard | ✅ | ✅ |

---

## ✨ Features

- **JWT Authentication** — Secure signup/login with 7-day tokens
- **Role-Based Access** — Admin and Member roles per project
- **Project Management** — Create, edit, delete, color-coded projects
- **Task Management** — Full CRUD with status, priority, due dates, assignment
- **Dashboard** — Stats, status breakdown with progress bars, overdue tracking
- **Loading States** — Spinners on all async operations
- **Toast Notifications** — Success/error feedback on every action
- **Responsive Design** — Works on desktop and tablet
- **Status Badges** — Color-coded Todo/In Progress/Done/Overdue
- **Member Management** — Add by email, assign roles, remove members

---

## 🛠️ Development

```bash
# Lint check
cd backend && node -e "require('./server')" # starts server

# Frontend hot reload
cd frontend && npm run dev

# Production build test
cd frontend && npm run build && npm run preview
```

---

## 📝 License

MIT — Free to use and modify.
