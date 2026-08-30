# ⚡ Learning Management System (LMS)

A full-stack, enterprise-ready educational platform built with **Next.js 16 (App Router)** and **Strapi 5 (Headless CMS)**. The platform provides structured course delivery, interactive lesson tracking, secure single-attempt quiz grading, and a blog publishing system with role-based access control.

---

## 📑 Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Key Features by Role](#-key-features-by-role)
3. [Tech Stack](#-tech-stack)
4. [Project Structure](#-project-structure)
5. [Getting Started](#-getting-started)
   - [Prerequisites](#prerequisites)
   - [Backend Setup (Strapi)](#1-backend-setup-strapi)
   - [Frontend Setup (Next.js)](#2-frontend-setup-nextjs)
6. [Core Modules & Workflows](#-core-modules--workflows)
   - [Public Educational Portal](#public-educational-portal)
   - [Student Progress & Quiz Verification](#student-progress--quiz-verification)
   - [Blog & Publishing System](#blog--publishing-system)
   - [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
7. [API Reference](#-api-reference)
8. [License](#-license)

---

## 🏛 Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 16 Frontend                     │
│  (App Router, React 19, Tailwind CSS, Server Components)    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
        HTTP / Server Fetch            REST API (JWT)
               │                              │
┌──────────────▼──────────────────────────────▼───────────────┐
│                      Strapi 5 Backend                       │
│      (Users-Permissions, Custom Controllers & Services)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                       Better-SQLite3 DB
```

---

## 🎯 Key Features by Role

### 👨‍🎓 Student
- **Course Enrollment**: Instant enrollment into published courses with persistent progress tracking.
- **Structured Lessons**: Video players, lesson markdown/content, and idempotent **"Mark as Complete"** progress calculation.
- **Verified Quizzes**: Server-evaluated quizzes strictly locked to **one attempt per student** to maintain academic integrity.
- **Progress Tracking**: Real-time course completion percentage calculation (`(completed_lessons / total_lessons) * 100`).

### 👨‍🏫 Instructor
- **Course Authoring**: Create, edit, and publish courses with thumbnails, descriptions, and category tags.
- **Lesson Management**: Add video lectures, reading materials, and organize lesson ordering.
- **Quiz Creation**: Build quizzes with multiple choice options (A, B, C, D), specify correct answers, and configure passing marks.

### ✍️ Content Manager
- **Draft & Publish Engine**: Create articles in draft state (`publishedAt: null`) or publish immediately.
- **Ownership Protection**: Content managers can only edit and delete **their own authored articles**; unauthorized modifications are blocked at the server level.

### 🛡️ Administrator
- **Full Governance**: Complete oversight across all courses, users, categories, enrollments, and quiz submissions.
- **Unrestricted Blog Control**: Ability to publish, unpublish, edit, or remove any article across the platform.

---

## 💻 Tech Stack

### Frontend (`client/`)
- **Framework**: Next.js 16.3.2 (App Router, Turbopack)
- **Library**: React 19.2.8
- **Styling**: Tailwind CSS 4
- **Security & Tokens**: `jose` & `jsonwebtoken` (HTTP-only cookie JWTs)
- **Icons**: `react-icons`

### Backend (`server/`)
- **Framework**: Strapi 5.31.0 (Headless CMS)
- **Database**: SQLite (`better-sqlite3` storage at `server/.tmp/data.db`)
- **Authentication**: Strapi Users-Permissions plugin with custom RBAC mappings
- **Media**: Strapi Local Upload Provider

---

## 📂 Project Structure

```text
LMS/
├── client/                               # Next.js 16 Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js                   # Public landing page (Hero, Featured Courses, Blogs)
│   │   │   ├── courses/                  # Public course catalog & preview details
│   │   │   │   ├── page.js
│   │   │   │   └── [id]/page.js
│   │   │   ├── blog/                     # Public blog feed & article reader
│   │   │   │   ├── page.js
│   │   │   │   └── [slug]/page.js
│   │   │   ├── admin/                    # Admin & Content Manager dashboards
│   │   │   │   ├── blog/                 # Blog management, create & edit screens
│   │   │   │   └── dashboard/
│   │   │   ├── student/                  # Student learning portal
│   │   │   │   ├── dashboard/
│   │   │   │   └── courses/[id]/page.js  # Interactive lessons & quiz player
│   │   │   ├── api/                      # Next.js Server Route Handlers
│   │   │   │   ├── auth/                 # Login, logout, current user session
│   │   │   │   ├── blog/                 # Secure blog CRUD with role validation
│   │   │   │   └── student/              # Lesson completion & quiz submission APIs
│   │   │   └── (auth)/                   # Authentication pages (login, register)
│   │   ├── components/                   # Reusable UI components (Navbar, Footer, QuizSection)
│   │   ├── context/                      # Client AuthContext
│   │   ├── lib/                          # Utility functions (getUserData, etc.)
│   │   └── proxy.js                      # Middleware route protection
│   └── package.json
│
├── server/                               # Strapi 5 Backend
│   ├── src/
│   │   └── api/
│   │       ├── course/                   # Course collection type
│   │       ├── lesson/                   # Lesson collection type
│   │       ├── quiz/                     # Quiz collection type
│   │       ├── quiz-attempt/             # Student quiz attempts & grades
│   │       ├── lesson-progress/          # Individual lesson completions
│   │       ├── enroll/                   # Course enrollment relations
│   │       ├── blog-post/                # BlogPost collection type (Draft & Publish)
│   │       └── category/                 # Course categories
│   ├── config/                           # Database, server, plugins configuration
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or `v20.x+`
- **npm**: `v9.x+`

---

### 1. Backend Setup (Strapi)

```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# Start Strapi in development mode
npm run develop
```

- Strapi Admin Panel: **`http://localhost:1337/admin`**
- Strapi API Base: **`http://localhost:1337/api`**

> **Note**: Database records are persisted in `server/.tmp/data.db`.

---

### 2. Frontend Setup (Next.js)

Open a new terminal window:

```bash
# Navigate to the client folder
cd client

# Install dependencies
npm install

# Verify client environment variables (.env.local)
# NEXT_PUBLIC_STRAPI_URL=http://localhost:1337/api

# Run the development server with Turbopack
npm run dev
```

- Next.js Web App: **`http://localhost:3000`**

---

## ⚙️ Core Modules & Workflows

### Public Educational Portal
- **Homepage (`/`)**: Built as a Next.js Server Component fetching live Strapi categories, featured courses, and latest articles.
- **Catalog (`/courses`)**: Filter courses by category chips, view instructors, lesson counts, and quiz counts.
- **Course Preview (`/courses/[id]`)**: Public syllabus overview with an "Enroll Now" action that directs to the student portal.

### Student Progress & Quiz Verification
1. **Lesson Completion**:
   - Route: `POST /api/student/lessons/[lessonId]/complete`
   - Checks enrollment, records a `LessonProgress` entry, recalculates total progress percentage, and updates the cache.
2. **Single-Attempt Quiz Enforcement**:
   - Route: `GET /api/student/quizzes/[quizId]` strips `correctAnswer` before sending data to the client.
   - Route: `POST /api/student/quizzes/[quizId]/submit` evaluates student answers on the server, calculates passing marks, creates a `QuizAttempt` record, and locks the quiz permanently against duplicate submissions.

### Blog & Publishing System
- Uses Strapi 5's native `draftAndPublish` mechanism (`publishedAt: null` represents drafts).
- Server-enforced role rules in `/api/blog/[id]`:
  - **Admin**: Can update, publish, unpublish, or delete any article.
  - **Content Manager**: Permitted to update or delete **only** if `author.id === currentUser.id`. Unauthorized attempts yield `403 Forbidden`.

---

## 📡 API Reference

### Student Routes
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/student/progress/[courseId]` | Returns course progress percent, completed lesson IDs, and quiz attempts |
| `POST` | `/api/student/lessons/[lessonId]/complete` | Marks a lesson as complete and updates overall course progress |
| `GET` | `/api/student/quizzes/[quizId]` | Fetches quiz questions (stripping answer keys) and past attempts |
| `POST` | `/api/student/quizzes/[quizId]/submit` | Submits answers for server-side grading (enforces 1-attempt rule) |

### Blog Routes
| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/blog` | Returns published articles (supports `?search=` and `?status=all`) |
| `POST` | `/api/blog` | Creates a new draft or published article (Admin & Content Manager) |
| `GET` | `/api/blog/[id]` | Fetches single article by ID or slug |
| `PUT` | `/api/blog/[id]` | Updates/publishes article (Admin or Author-only) |
| `DELETE` | `/api/blog/[id]` | Deletes article (Admin or Author-only) |

### Auth Routes
| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticates credentials and sets secure JWT cookie |
| `POST` | `/api/auth/logout` | Clears authentication cookies |
| `GET` | `/api/auth/me` | Returns current logged-in user profile and assigned role |

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
