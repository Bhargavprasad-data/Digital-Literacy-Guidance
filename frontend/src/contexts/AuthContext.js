import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('dg_token');
    const savedUser = localStorage.getItem('dg_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      // Verify token is still valid
      api.getMe(savedToken)
        .then(userData => {
          setUser(userData);
          localStorage.setItem('dg_user', JSON.stringify(userData));
        })
        .catch(() => {
          // Token invalid, clear auth
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { token: newToken, user: userData } = await api.login({ email, password });
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('dg_token', newToken);
      localStorage.setItem('dg_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password, language = 'en') => {
    try {
      const userData = await api.register({ name, email, password, language });
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dg_token');
    localStorage.removeItem('dg_user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}