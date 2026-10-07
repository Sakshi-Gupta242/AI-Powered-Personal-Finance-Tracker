import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<void>;
  logout: () => void;
  seedAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.getCurrentUser();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string) => {
    const res = await api.register(name, email, password, confirmPassword);
    if (res.success && res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const seedAccount = async () => {
    if (isAuthenticated) {
      await api.seedMyAccount();
    } else {
      await api.seedDemoAccount();
    }
  };

  const refreshUser = async () => {
    if (token) {
      const res = await api.getCurrentUser();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
    }
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        seedAccount,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
