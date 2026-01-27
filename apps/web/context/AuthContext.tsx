'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter} from 'next/navigation';
import { api, User, LoginDto, RegisterDto, AuthResponse } from '@/lib/api';

// ============================================
// Auth Context Type Definition
// ============================================

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Auth Provider Component
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * Check authentication status on mount
   * This effect runs once when the component mounts
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (error) {
          // Token is invalid, clear it
          api.clearToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

   /**
   * Get redirect path based on user role
   */

  const getRedirectPath = (userRole: string) : string => {

    const normalizedRole = userRole?.toLowerCase() || '';
    switch (normalizedRole) {
      case 'instructor':
        return '/dashboard';
      case 'admin':
        return '/admin/dashboard';
      case 'student':
        return '/courses';
    }
  }

  /**
   * Login user with email and password
   * @param data - Login credentials
   */
  const login = async (data: LoginDto) => {
    const response = await api.login(data);
    setUser(response.user);

    const redirectPath = getRedirectPath(response.user.role);
    router.push(redirectPath);
  };

  /**
   * Register a new user
   * @param data - Registration data
   */
  const register = async (data: RegisterDto) => {
    const response = await api.register(data);
    setUser(response.user);

    router.push('/courses');
  };

  /**
   * Logout user and clear session
   */
  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  /**
   * Update user profile
   * @param data - Updated user data
   */
  const updateUser = async (data: Partial<User>) => {
    const updatedUser = await api.updateProfile(data);
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// Custom Hook for Using Auth Context
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

