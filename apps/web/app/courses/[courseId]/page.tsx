'use client';

import { use } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import CourseDetail from '@/components/CourseDetail';

interface CoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default function CoursePage({ params }: CoursePageProps) {
  // Await params using React.use() hook
  const { courseId } = use(params);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <CourseDetail courseId={courseId} />
      </div>
    </AuthProvider>
  );
}

