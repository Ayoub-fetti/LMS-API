'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Course, Module, Progress } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface CourseDetailProps {
  courseId: string;
}

export default function CourseDetail({ courseId }: CourseDetailProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isEnrolling, setIsEnrolling] = useState(false);

  /**
   * Fetch course details, modules, and user progress
   * Runs on component mount and when courseId changes
   */
  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      try {
        // Fetch course details
        const courseData = await api.getCourse(courseId);
        setCourse(courseData);
        
        // Fetch modules for this course
        const modulesData = await api.getModulesByCourse(courseId);
        setModules(modulesData);

        // Fetch progress if user is authenticated
        if (isAuthenticated) {
          try {
            const progressData = await api.getCourseProgress(courseId);
            setProgress(progressData);
          } catch {
            // User not enrolled, progress will be null
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, isAuthenticated]);

  /**
   * Handle course enrollment
   * Enrolls user in course and fetches updated progress
   */
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setIsEnrolling(true);
    try {
      const result = await api.enrollInCourse(courseId);
      setProgress(result.progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll');
    } finally {
      setIsEnrolling(false);
    }
  };

  /**
   * Handle starting/resuming a module
   */
  const handleStartModule = async (moduleId: string) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      // Update current module in progress
      if (progress) {
        await api.updateCurrentModule(courseId, moduleId);
      }
      router.push(`/modules/${moduleId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start module');
    }
  };

  /**
   * Check if module is completed
   */
  const isModuleCompleted = (moduleId: string): boolean => {
    return progress?.completedModules?.includes(moduleId) || false;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Error state
  if (error && !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Course Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {course.title}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {course.description}
            </p>
            
            {/* Course Meta */}
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{modules.length} modules</span>
              <span>•</span>
              <span>{course.enrollmentCount} students</span>
              <span>•</span>
              <span>
                {course.isPublished ? (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Published
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Draft
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Enrollment Button */}
          {isAuthenticated && user?.role === 'student' && !progress && (
            <button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="ml-6 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
            </button>
          )}

          {progress && (
            <div className="ml-6 text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Progress
              </div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {progress.completedModules?.length || 0} / {modules.length}
              </div>
              <div className="mt-2 w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${((progress.completedModules?.length || 0) / modules.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course Modules */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Course Content
          </h2>
        </div>

        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {modules.map((module, index) => {
            const completed = isModuleCompleted(module._id);
            const isAccessible = !!progress || user?.role !== 'student';

            return (
              <li key={module._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Module Number & Status */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      completed
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {completed ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    {/* Module Info */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  {/* Start/Continue Button */}
                  {isAccessible && (
                    <button
                      onClick={() => handleStartModule(module._id)}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        completed
                          ? 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          : 'text-white bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {completed ? 'Review' : 'Start'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}

          {modules.length === 0 && (
            <li className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              No modules available for this course
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

