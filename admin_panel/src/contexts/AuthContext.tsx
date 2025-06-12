// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { post as apiPost } from '@/services/api';
import apiClient from '@/services/api';

interface User {
  id: number;
  email: string;
  role_id?: number;
  role?: {
    id: number;
    name: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await apiClient.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to verify token or fetch user', error);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiPost<{ access_token: string; user?: User }>('/auth/login', { email, password });
      const { access_token } = response.data;
      localStorage.setItem('authToken', access_token);
      setToken(access_token);

      const userResponse = await apiClient.get<User>('/auth/me');
      setUser(userResponse.data);
    } catch (error) {
      console.error('Login failed:', error);
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};