'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Module, Quiz } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface ModuleViewerProps {
  moduleId: string;
}

export default function ModuleViewer({ moduleId }: ModuleViewerProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [module, setModule] = useState<Module | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  /**
   * Fetch module details
   * Runs on component mount and when moduleId changes
   */
  useEffect(() => {
    const fetchModule = async () => {
      setIsLoading(true);
      try {
        const moduleData = await api.getModule(moduleId);
        setModule(moduleData);
        
        // Filter quizzes from module
        const moduleQuizzes = moduleData.quizzes || [];
        setQuizzes(moduleQuizzes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load module');
      } finally {
        setIsLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  /**
   * Handle starting a quiz
   */
  const handleStartQuiz = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  /**
   * Handle completing module
   */
  const handleCompleteModule = async () => {
    if (!module) return;
    
    try {
      // Get course ID from module and complete it
      // This assumes module has courseId property
      await api.completeModule(module.courseId, module._id);
      router.push(`/courses/${module.courseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete module');
    }
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
  if (error && !module) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!module) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Module Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {module.title}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {module.description}
            </p>
          </div>

          {/* Complete Module Button */}
          {isAuthenticated && user?.role === 'student' && (
            <button
              onClick={handleCompleteModule}
              className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Complete Module
            </button>
          )}
        </div>
      </div>

      {/* Module Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Module Content
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300">
                This module contains {quizzes.length} quiz(es) to test your knowledge.
                Complete all quizzes to finish this module.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - Quizzes */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Quizzes
            </h2>
            
            {quizzes.length > 0 ? (
              <ul className="space-y-3">
                {quizzes.map((quiz) => (
                  <li key={quiz._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {quiz.questions?.length || 0} questions • Pass: {quiz.passingScore}%
                    </p>
                    <button
                      onClick={() => handleStartQuiz(quiz._id)}
                      className="mt-3 w-full px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Start Quiz
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No quizzes in this module
              </p>
            )}
          </div>

          {/* Module Info */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Module Info
            </h2>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Order</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {module.order}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Created</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {new Date(module.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

