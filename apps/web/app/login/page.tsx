'use client';

import { AuthProvider } from '@/context/AuthContext';
import LoginForm from '@/components/LoginForm';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <LoginForm />
      </div>
    </AuthProvider>
  );
}

