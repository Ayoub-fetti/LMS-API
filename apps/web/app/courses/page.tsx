'use client';

import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import CoursesList from '@/components/CoursesList';

export default function CoursesPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <CoursesList />
      </div>
    </AuthProvider>
  );
}

