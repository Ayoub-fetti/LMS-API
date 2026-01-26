'use client';

import { use } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import QuizComponent from '@/components/QuizComponent';

interface QuizPageProps {
  params: Promise<{
    quizId: string;
  }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  // Await params using React.use() hook
  const { quizId } = use(params);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <QuizComponent quizId={quizId} />
      </div>
    </AuthProvider>
  );
}

