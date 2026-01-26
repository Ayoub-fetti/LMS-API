'use client';

import { use } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ModuleViewer from '@/components/ModuleViewer';

interface ModulePageProps {
  params: Promise<{
    moduleId: string;
  }>;
}

export default function ModulePage({ params }: ModulePageProps) {
  // Await params using React.use() hook
  const { moduleId } = use(params);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <ModuleViewer moduleId={moduleId} />
      </div>
    </AuthProvider>
  );
}

