// ============================================
// API Configuration and Types
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// ============================================
// Auth Types
// ============================================
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// ============================================
// Course Types
// ============================================
export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: User;
  modules: Module[];
  isPublished: boolean;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseDto {
  title: string;
  description: string;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
}

// ============================================
// Module Types
// ============================================
export interface Module {
  _id: string;
  title: string;
  description: string;
  courseId: string;
  order: number;
  quizzes: Quiz[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleDto {
  title: string;
  description: string;
  courseId: string;
}

export interface UpdateModuleDto {
  title?: string;
  description?: string;
}

// ============================================
// Quiz Types
// ============================================
export interface Quiz {
  _id: string;
  title: string;
  moduleId: string;
  questions: Question[];
  passingScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface CreateQuizDto {
  title: string;
  moduleId: string;
  passingScore: number;
}

export interface SubmitQuizDto {
  answers: { questionId: string; selectedAnswer: number }[];
}

export interface QuizSubmission {
  _id: string;
  quizId: string;
  userId: string;
  score: number;
  passed: boolean;
  answers: { questionId: string; selectedAnswer: number; isCorrect: boolean }[];
  createdAt: string;
}

// ============================================
// Progress Types
// ============================================
export interface Progress {
  _id: string;
  userId: string;
  courseId: string;
  completedModules: string[];
  currentModule: string;
  currentQuiz: string;
  quizAttempts: QuizSubmission[];
  timeSpent: number;
  lastAccessed: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API Client
// ============================================

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Token management
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Helper method for making requests
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  }

  // ============================================
  // Auth Endpoints
  // ============================================

  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.access_token);
    return response;
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  async getMe(): Promise<User> {
    return this.request('/auth/me');
  }

  /**
   * Update current user profile
   * PUT /api/v1/auth/me
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update user role (Admin only)
   * PUT /api/v1/auth/users/:id/role
   */
  async updateUserRole(userId: string, role: string): Promise<User> {
    return this.request(`/auth/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  // ============================================
  // Course Endpoints
  // ============================================

  /**
   * Get all published courses with pagination
   * GET /api/v1/courses
   */
  async getCourses(page: number = 1, limit: number = 10): Promise<{ data: Course[]; total: number }> {
    return this.request(`/courses?page=${page}&limit=${limit}`);
  }

  /**
   * Get course by ID
   * GET /api/v1/courses/:id
   */
  async getCourse(id: string): Promise<Course> {
    return this.request(`/courses/${id}`);
  }

  /**
   * Get students progress for a course (Instructor only)
   * GET /api/v1/courses/:id/students/progress
   */
  async getStudentsProgress(courseId: string): Promise<Progress[]> {
    return this.request(`/courses/${courseId}/students/progress`);
  }

  /**
   * Enroll in a course (Student only)
   * POST /api/v1/courses/:id/enroll
   */
  async enrollInCourse(courseId: string): Promise<{ enrollment: Record<string, unknown>; progress: Progress }> {
    return this.request(`/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  }

  /**
   * Create a new course (Instructor only)
   * POST /api/v1/courses
   */
  async createCourse(data: CreateCourseDto): Promise<Course> {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a course (Instructor only)
   * PUT /api/v1/courses/:id
   */
  async updateCourse(id: string, data: UpdateCourseDto): Promise<Course> {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Publish a course (Instructor only)
   * PATCH /api/v1/courses/:id/publish
   */
  async publishCourse(id: string): Promise<Course> {
    return this.request(`/courses/${id}/publish`, {
      method: 'PATCH',
    });
  }

  /**
   * Unpublish a course (Instructor only)
   * PATCH /api/v1/courses/:id/unpublish
   */
  async unpublishCourse(id: string): Promise<Course> {
    return this.request(`/courses/${id}/unpublish`, {
      method: 'PATCH',
    });
  }

  // ============================================
  // Module Endpoints
  // ============================================

  /**
   * Get modules by course ID
   * GET /api/v1/modules/course/:courseId
   */
  async getModulesByCourse(courseId: string): Promise<Module[]> {
    return this.request(`/modules/course/${courseId}`);
  }

  /**
   * Get module by ID
   * GET /api/v1/modules/:id
   */
  async getModule(id: string): Promise<Module> {
    return this.request(`/modules/${id}`);
  }

  /**
   * Create a new module (Instructor only)
   * POST /api/v1/modules
   */
  async createModule(data: CreateModuleDto): Promise<Module> {
    return this.request('/modules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a module (Instructor only)
   * PUT /api/v1/modules/:id
   */
  async updateModule(id: string, data: UpdateModuleDto): Promise<Module> {
    return this.request(`/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ============================================
  // Quiz Endpoints
  // ============================================

  /**
   * Create a new quiz (Instructor only)
   * POST /api/v1/quiz
   */
  async createQuiz(data: CreateQuizDto): Promise<Quiz> {
    return this.request('/quiz', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get quiz by ID
   * GET /api/v1/quiz/:id
   */
  async getQuiz(id: string): Promise<Quiz> {
    return this.request(`/quiz/${id}`);
  }

  /**
   * Submit quiz answers
   * POST /api/v1/quiz/:id/submit
   */
  async submitQuiz(id: string, answers: SubmitQuizDto['answers']): Promise<QuizSubmission> {
    return this.request(`/quiz/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  /**
   * Get quiz attempts for a user
   * GET /api/v1/quiz/:id/attempts
   */
  async getQuizAttempts(id: string): Promise<QuizSubmission[]> {
    return this.request(`/quiz/${id}/attempts`);
  }

  // ============================================
  // Question Endpoints
  // ============================================

  /**
   * Create a new question (Instructor only)
   * POST /api/v1/questions
   */
  async createQuestion(data: {
    text: string;
    options: string[];
    correctAnswer: number;
    quizId: string;
  }): Promise<Question> {
    return this.request('/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============================================
  // Progress Endpoints
  // ============================================

  /**
   * Get all courses progress for current user
   * GET /api/v1/progress/my-courses
   */
  async getMyCoursesProgress(): Promise<Progress[]> {
    return this.request('/progress/my-courses');
  }

  /**
   * Get progress for a specific course
   * GET /api/v1/progress/course/:courseId
   */
  async getCourseProgress(courseId: string): Promise<Progress> {
    return this.request(`/progress/course/${courseId}`);
  }

  /**
   * Get detailed progress for a course
   * GET /api/v1/progress/course/:courseId/detailed
   */
  async getDetailedProgress(courseId: string): Promise<Progress> {
    return this.request(`/progress/course/${courseId}/detailed`);
  }

  /**
   * Resume a course
   * POST /api/v1/progress/course/:courseId/resume
   */
  async resumeCourse(courseId: string): Promise<Progress> {
    return this.request(`/progress/course/${courseId}/resume`, {
      method: 'POST',
    });
  }

  /**
   * Update current module
   * PUT /api/v1/progress/course/:courseId/module/:moduleId
   */
  async updateCurrentModule(courseId: string, moduleId: string): Promise<Progress> {
    return this.request(`/progress/course/${courseId}/module/${moduleId}`, {
      method: 'PUT',
    });
  }

  /**
   * Complete a module
   * PUT /api/v1/progress/course/:courseId/module/:moduleId/complete
   */
  async completeModule(courseId: string, moduleId: string): Promise<Progress> {
    return this.request(`/progress/course/${courseId}/module/${moduleId}/complete`, {
      method: 'PUT',
    });
  }

  /**
   * Update time spent on course
   * PUT /api/v1/progress/course/:courseId/time
   */
  async updateTimeSpent(courseId: string, minutes: number): Promise<Progress> {
    return this.request(`/progress/course/${courseId}/time`, {
      method: 'PUT',
      body: JSON.stringify({ minutes }),
    });
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

