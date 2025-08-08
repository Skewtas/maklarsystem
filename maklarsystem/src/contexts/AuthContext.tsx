'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { mockAuth, MockUser } from '@/utils/auth/mock-auth';

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ user: MockUser | null; error: any }>;
  logout: () => Promise<{ error: any }>;
  register: (email: string, password: string, name: string) => Promise<{ user: MockUser | null; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Använd mock-autentisering för nu
  // TODO: Byt till riktig Supabase-autentisering senare
  
  const value: AuthContextType = {
    user: mockAuth.user,
    isAuthenticated: mockAuth.isAuthenticated,
    isLoading: false, // Alltid false med mock
    login: mockAuth.login,
    logout: mockAuth.logout,
    register: mockAuth.register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};