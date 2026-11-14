import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [token, setToken] = useState(authService.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = authService.getToken();
      if (savedToken) {
        try {
          const profileData = await authService.getProfile();
          if (profileData.success) {
            setUser(profileData.user);
            localStorage.setItem('finflow_user', JSON.stringify(profileData.user));
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateUserInfo = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('finflow_user', JSON.stringify(updatedUser));
  };

  const formatCurrency = (amount) => {
    const curr = user?.currency || 'INR';
    const symbolMap = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    const symbol = symbolMap[curr] || '₹';
    const formattedNum = Number(amount || 0).toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    });
    return `${symbol}${formattedNum}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        updateUserInfo,
        formatCurrency
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
