'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { api, Course, Progress } from '@/lib/api';

function MyCoursesContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<{ course: Course; progress: Progress }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  /**
   * Fetch enrolled courses and their progress
   * Runs when user authentication status is confirmed
   */
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      const fetchEnrolledCourses = async () => {
        setIsLoading(true);
        try {
          const progressList = await api.getMyCoursesProgress();
          
          // Fetch course details for each progress entry
          const coursesWithProgress = await Promise.all(
            progressList.map(async (progress) => {
              try {
                const course = await api.getCourse(progress.courseId);
                return { course, progress };
              } catch {
                return null;
              }
            })
          );

          setEnrolledCourses(
            coursesWithProgress.filter((item): item is { course: Course; progress: Progress } => item !== null)
          );
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load courses');
        } finally {
          setIsLoading(false);
        }
      };

      fetchEnrolledCourses();
    }
  }, [authLoading, isAuthenticated]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            My Learning
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Please sign in to view your enrolled courses
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Learning
        </h1>
        <Link
          href="/courses"
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Browse More Courses
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : enrolledCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map(({ course, progress }) => {
            const completedCount = progress.completedModules?.length || 0;
            const totalModules = 0; // Would need to fetch module count
            const progressPercent = totalModules > 0 
              ? Math.round((completedCount / totalModules) * 100) 
              : 0;

            return (
              <div key={course._id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                {/* Course Image Placeholder */}
                <div className="h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-3xl">📚</span>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                    {course.title}
                  </h3>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{completedCount} modules completed</span>
                  </div>
                  
                  {/* Continue Button */}
                  <Link
                    href={`/courses/${course._id}`}
                    className="mt-4 block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Continue Learning
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No courses yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start your learning journey by enrolling in a course
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
}

export default function MyCoursesPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <MyCoursesContent />
      </div>
    </AuthProvider>
  );
}

