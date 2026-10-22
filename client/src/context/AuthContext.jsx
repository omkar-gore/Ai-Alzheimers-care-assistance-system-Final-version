import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../services/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('caremate-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('caremate-token') || null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('caremate-token', token);
    } else {
      localStorage.removeItem('caremate-token');
    }

    if (user) {
      localStorage.setItem('caremate-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('caremate-user');
    }
  }, [user, token]);

  const login = async (emailOrPhone, password) => {
    const res = await axios.post('/auth/login', { emailOrPhone, password });
    const userData = {
      ...res.data.user,
      id: res.data.user._id || res.data.user.id,
      _id: res.data.user._id || res.data.user.id,
    };
    setUser(userData);
    setToken(res.data.token);
    return { ...res.data, user: userData };
  };

  const logout = () => {
    const role = user?.role;
    setUser(null);
    setToken(null);
    localStorage.removeItem('caremate-token');
    localStorage.removeItem('caremate-user');
    localStorage.removeItem('caremate-exercises');
    return role;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
