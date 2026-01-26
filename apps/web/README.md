# LMS Frontend

This is the Next.js frontend for the Learning Management System API, built with Tailwind CSS.

## Features

- **Authentication**: Login and Register forms with JWT token management
- **Course Management**: Browse courses, view details, enroll in courses
- **Module Viewer**: View module content and quizzes
- **Quiz System**: Take quizzes with instant feedback and score tracking
- **Progress Tracking**: Track learning progress across courses
- **Instructor Dashboard**: Manage courses (for instructors)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | User login |
| `/register` | User registration |
| `/courses` | Browse all published courses |
| `/courses/[id]` | View course details and enroll |
| `/modules/[id]` | View module content |
| `/quiz/[id]` | Take a quiz |
| `/my-courses` | View enrolled courses and progress |
| `/dashboard` | Instructor dashboard (instructors only) |

## API Integration

All backend endpoints are consumed via the `api` client in `lib/api.ts`:

### Auth Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/me` - Update profile
- `PUT /api/v1/auth/users/:id/role` - Update user role (admin)

### Course Endpoints
- `GET /api/v1/courses` - Get published courses (paginated)
- `GET /api/v1/courses/:id` - Get course by ID
- `POST /api/v1/courses` - Create course (instructor)
- `PUT /api/v1/courses/:id` - Update course (instructor)
- `PATCH /api/v1/courses/:id/publish` - Publish course (instructor)
- `PATCH /api/v1/courses/:id/unpublish` - Unpublish course (instructor)
- `POST /api/v1/courses/:id/enroll` - Enroll in course (student)
- `GET /api/v1/courses/:id/students/progress` - Get student progress (instructor)

### Module Endpoints
- `GET /api/v1/modules/course/:courseId` - Get modules by course
- `GET /api/v1/modules/:id` - Get module by ID
- `POST /api/v1/modules` - Create module (instructor)
- `PUT /api/v1/modules/:id` - Update module (instructor)

### Quiz Endpoints
- `POST /api/v1/quiz` - Create quiz (instructor)
- `GET /api/v1/quiz/:id` - Get quiz
- `POST /api/v1/quiz/:id/submit` - Submit quiz answers
- `GET /api/v1/quiz/:id/attempts` - Get quiz attempts

### Question Endpoints
- `POST /api/v1/questions` - Create question (instructor)

### Progress Endpoints
- `GET /api/v1/progress/my-courses` - Get all course progress (student)
- `GET /api/v1/progress/course/:courseId` - Get course progress
- `GET /api/v1/progress/course/:courseId/detailed` - Get detailed progress
- `POST /api/v1/progress/course/:courseId/resume` - Resume course
- `PUT /api/v1/progress/course/:courseId/module/:moduleId` - Update current module
- `PUT /api/v1/progress/course/:courseId/module/:moduleId/complete` - Complete module
- `PUT /api/v1/progress/course/:courseId/time` - Update time spent

## Project Structure

```
apps/web/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles with Tailwind
│   ├── login/
│   │   └── page.tsx          # Login page
│   ├── register/
│   │   └── page.tsx          # Register page
│   ├── courses/
│   │   ├── page.tsx          # Courses listing
│   │   └── [courseId]/
│   │       └── page.tsx      # Course detail
│   ├── modules/
│   │   └── [moduleId]/
│   │       └── page.tsx      # Module viewer
│   ├── quiz/
│   │   └── [quizId]/
│   │       └── page.tsx      # Quiz component
│   ├── my-courses/
│   │   └── page.tsx          # Student progress
│   └── dashboard/
│       └── page.tsx          # Instructor dashboard
├── components/
│   ├── Navbar.tsx            # Navigation bar
│   ├── LoginForm.tsx         # Login form
│   ├── RegisterForm.tsx      # Registration form
│   ├── CourseCard.tsx        # Course card component
│   ├── CoursesList.tsx       # Courses list with pagination
│   ├── CourseDetail.tsx      # Course detail with modules
│   ├── ModuleViewer.tsx      # Module content viewer
│   └── QuizComponent.tsx     # Quiz taking interface
├── context/
│   └── AuthContext.tsx       # Authentication context
└── lib/
    └── api.ts                # API client and types
```

## Getting Started

1. Install dependencies:
   ```bash
   cd apps/web
   npm install
   ```

2. Set environment variables:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3001

## Technology Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Authentication**: JWT tokens

## API Configuration

The API client is configured in `lib/api.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
```

The client automatically handles:
- JWT token storage in localStorage
- Authorization headers for authenticated requests
- Error handling and response parsing

