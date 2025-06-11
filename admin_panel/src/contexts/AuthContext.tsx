// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { post as apiPost } from '@/services/api'; // Using the post from our api service
import apiClient from '@/services/api'; // For direct access to update headers if needed

interface User {
  id: number;
  email: string;
  role_id?: number; // Or a Role object if you fetch more details
  // Add other user properties as needed
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email_or_token: string, password?: string) => Promise<void>; // Can be token or email
  logout: () => void;
  isLoading: boolean; // To handle initial loading of auth state
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
        // Optionally, validate token by fetching user profile
        try {
          // Add a 'me' endpoint call if you want to verify token and get user
          // For now, we assume token presence means authenticated for simplicity
          // const response = await apiClient.get('/auth/me');
          // setUser(response.data);
          // For this basic setup, we'll skip fetching user on load to keep it simple
          // and rely on pages to fetch user data if needed or decode token for basic info.
          // A more robust solution would fetch user data here.
          // For now, if there's a token, we'll consider the user "authenticated"
          // but user object will be null until login sets it or a 'me' call is made.
          console.log("Token found in localStorage, consider user authenticated for now.");
        } catch (error) {
          console.error("Failed to verify token or fetch user", error);
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password?: string) => {
     try {
         const response = await apiPost<{ access_token: string; user?: User }>('/auth/login', { email, password });
         const { access_token } = response.data;
         localStorage.setItem('authToken', access_token);
         setToken(access_token);

         // Fetch user details after login
         // This assumes your login endpoint doesn't return the full user object,
         // or you prefer to fetch it fresh.
         // If login returns user, you can set it directly: setUser(response.data.user);
         const userResponse = await apiClient.get<User>('/auth/me');
         setUser(userResponse.data);

     } catch (error) {
         console.error('Login failed:', error);
         localStorage.removeItem('authToken'); // Ensure no stale token
         setToken(null);
         setUser(null);
         throw error; // Re-throw to allow login page to handle error display
     }
  };

  const logout = () => {
    // Optionally call backend logout endpoint
    // apiPost('/auth/logout').catch(error => console.error('Backend logout failed:', error));

    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    // Redirect to login or update UI (handled by router usually)
    // window.location.href = '/login'; // Or use react-router programmatically
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
