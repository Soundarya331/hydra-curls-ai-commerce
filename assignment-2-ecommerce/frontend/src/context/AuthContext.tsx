import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loginWithGoogleToken: (idToken: string) => Promise<void>;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const saved = sessionStorage.getItem('token');
    if (!saved) { setIsLoading(false); return; }
    api.getMe(saved).then(setUser).catch(() => {
      sessionStorage.removeItem('token'); setToken(null); setUser(null);
    }).finally(() => setIsLoading(false));
  }, []);
  const loginWithGoogleToken = async (idToken: string) => {
    setIsLoading(true);
    try {
      const result = await api.loginGoogle({ id_token: idToken });
      sessionStorage.setItem('token', result.access_token);
      setToken(result.access_token); setUser(result.user);
    } finally { setIsLoading(false); }
  };
  const logout = () => {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    setToken(null); setUser(null);
    window.google?.accounts.id.disableAutoSelect();
  };
  return <AuthContext.Provider value={{ user, token, isLoading, loginWithGoogleToken, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requires AuthProvider');
  return context;
};
