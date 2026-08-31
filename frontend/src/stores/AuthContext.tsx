import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '@/types';
import { login as loginApi, logout as logoutApi } from '@/services/auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  completeAuth: (user: User, token: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('ssw_user');
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const completeAuth = useCallback((user: User, token: string) => {
    localStorage.setItem('ssw_token', token);
    localStorage.setItem('ssw_user', JSON.stringify(user));
    setUser(user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user, token } = await loginApi(email, password);
      completeAuth(user, token);
    } finally {
      setIsLoading(false);
    }
  }, [completeAuth]);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      localStorage.removeItem('ssw_token');
      localStorage.removeItem('ssw_user');
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, completeAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
