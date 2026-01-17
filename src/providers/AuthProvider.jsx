import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
import { TaiChiLoader } from '../components/TaiChiLoader';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('tcm_user');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      api.auth.verify(u.id)
        .then(realUser => {
          setUser(realUser);
        })
        .catch(() => {
          localStorage.removeItem('tcm_user');
          setUser(null);
        })
        .finally(() => setIsVerifying(false));
    } else {
      setIsVerifying(false);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('tcm_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tcm_user');
    window.location.href = '/';
  };

  if (isVerifying) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#fdfbf7] flex-col gap-6">
        <div className="relative">
          <TaiChiLoader className="w-32 h-32 text-[#4a6741] animate-spin drop-shadow-xl" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[#4a6741] tracking-[0.2em]">SHEN NONG</h2>
          <p className="text-gray-500 font-medium italic text-sm animate-pulse">Syncing Data...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);