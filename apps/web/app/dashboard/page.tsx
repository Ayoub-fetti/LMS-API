'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { api, Course } from '@/lib/api';

function DashboardContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });

  /**
   * Fetch instructor's courses
   * Runs when user authentication is confirmed
   */
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || user?.role !== 'instructor') {
        setIsLoading(false);
        return;
      }

      const fetchCourses = async () => {
        setIsLoading(true);
        try {
          // Fetch all courses (in a real app, you'd have an endpoint for instructor's courses)
          const response = await api.getCourses(1, 100);
          // Filter courses by current instructor
          const instructorCourses = response.data.filter(
            (course) => course.instructor?._id === user._id
          );
          setCourses(instructorCourses);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load courses');
        } finally {
          setIsLoading(false);
        }
      };

      fetchCourses();
    }
  }, [authLoading, isAuthenticated, user]);

  /**
   * Handle creating a new course
   */
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createCourse(newCourse);
      setCourses([...courses, created]);
      setShowCreateModal(false);
      setNewCourse({ title: '', description: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
    }
  };

  /**
   * Handle publishing/unpublishing a course
   */
  const handleTogglePublish = async (course: Course) => {
    try {
      const updated = course.isPublished
        ? await api.unpublishCourse(course._id)
        : await api.publishCourse(course._id);
      
      setCourses(
        courses.map((c) => (c._id === course._id ? updated : c))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show access denied if not instructor
  if (!isAuthenticated || user?.role !== 'instructor') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Instructor Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Only instructors can access this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Instructor Dashboard
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Manage your courses and track student progress
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create Course
        </button>
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
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          {/* Courses List */}
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {courses.length > 0 ? (
              courses.map((course) => (
                <li key={course._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {course.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {course.description}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{course.modules?.length || 0} modules</span>
                        <span>•</span>
                        <span>{course.enrollmentCount || 0} students</span>
                        <span>•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          course.isPublished
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="ml-4 flex items-center space-x-2">
                      <button
                        onClick={() => handleTogglePublish(course)}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                          course.isPublished
                            ? 'border border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-900/20'
                            : 'border border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20'
                        }`}
                      >
                        {course.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        className="px-3 py-1 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        View Progress
                      </button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                No courses yet. Create your first course to get started.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Course
            </h2>
            <form onSubmit={handleCreateCourse}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <DashboardContent />
      </div>
    </AuthProvider>
  );
}

