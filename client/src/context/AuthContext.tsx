import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/client';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (data: { email?: string; phone?: string; password: string }) => Promise<void>;
  register: (data: { name: string; email?: string; phone?: string; password: string; role: 'teacher' | 'student' }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    api.get<User>('/auth/me')
      .then(r => setUser(r.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (data: { email?: string; phone?: string; password: string }) => {
    const r = await api.post<{ token: string; user: User }>('/auth/login', data);
    localStorage.setItem('token', r.data.token);
    setUser(r.data.user);
  };

  const register = async (data: { name: string; email?: string; phone?: string; password: string; role: 'teacher' | 'student' }) => {
    const r = await api.post<{ token: string; user: User }>('/auth/register', data);
    localStorage.setItem('token', r.data.token);
    setUser(r.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
