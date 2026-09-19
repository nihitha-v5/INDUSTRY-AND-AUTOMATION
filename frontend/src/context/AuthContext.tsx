import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user_data');
    if (token && userStr) {
      try {
        const user: User = JSON.parse(userStr);
        return {
          user,
          token,
          isAuthenticated: true,
          role: user.role
        };
      } catch (e) {
        // Fallback
      }
    }
    // Default Demo Admin state for initial hackathon preview ease
    const defaultUser: User = {
      id: 1,
      email: "admin@neurax.ai",
      full_name: "Industrial Admin",
      role: "ADMIN",
      is_active: true
    };
    return {
      user: defaultUser,
      token: "demo_mock_jwt_token",
      isAuthenticated: true,
      role: "ADMIN"
    };
  });

  const login = (token: string, user: User) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    setAuthState({
      user,
      token,
      isAuthenticated: true,
      role: user.role
    });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      role: null
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
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
