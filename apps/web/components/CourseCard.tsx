'use client';

import Link from 'next/link';
import { Course } from '@/lib/api';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
      {/* Course Image Placeholder */}
      <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400 text-4xl">📚</span>
      </div>
      
      {/* Course Content */}
      <div className="p-6">
        {/* Course Title */}
        <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
          {course.title}
        </h3>
        
        {/* Course Description */}
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {course.description}
        </p>
        
        {/* Course Meta */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>{course.modules?.length || 0} modules</span>
            <span className="mx-2">•</span>
            <span>{course.enrollmentCount || 0} students</span>
          </div>
          
          {/* Status Badge */}
          {course.isPublished ? (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Published
            </span>
          ) : (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              Draft
            </span>
          )}
        </div>
        
        {/* View Course Button */}
        <div className="mt-4">
          <Link
            href={`/courses/${course._id}`}
            className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
}

