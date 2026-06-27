import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { AuthContext } from './Contexts';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('uid', userData.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('uid');
    window.location.href = '/';
  };

  useEffect(() => {
    const uid = localStorage.getItem('uid');
    if (uid) {
      api.auth.verify(uid)
        .then(res => setUser(res))
        .catch(() => localStorage.removeItem('uid'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};