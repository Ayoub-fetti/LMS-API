'use client';

import { AuthProvider } from '@/context/AuthContext';
import RegisterForm from '@/components/RegisterForm';
import Navbar from '@/components/Navbar';

export default function RegisterPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <RegisterForm />
      </div>
    </AuthProvider>
  );
}

