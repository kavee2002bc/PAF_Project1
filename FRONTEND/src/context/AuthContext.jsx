import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — restore from localStorage
  useEffect(() => {
    const savedUser  = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async (name, email, password, role = 'USER') => {
    const data = await authService.register({ name, email, password, role });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  const setAuth = useCallback((token, userInfo) => {
    const authData = { token, ...userInfo };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(authData));
    setUser(authData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const isAdmin       = user?.role === 'ADMIN';
  const isTechnician  = user?.role === 'TECHNICIAN';
  const isUser        = user?.role === 'USER';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setAuth, isAdmin, isTechnician, isUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
