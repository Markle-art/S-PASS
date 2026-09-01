import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser, Role } from '../data/users';
import { placeholderAccounts } from '../data/users';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  loginAs: (role: Role) => { ok: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'stakepass.session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persist = (next: AuthUser | null) => {
    setUser(next);
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login = (email: string, password: string) => {
    const match = placeholderAccounts.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
    );
    if (!match) return { ok: false, error: 'Invalid email or password.' };
    persist({ email: match.email, password: match.password, name: match.name, role: match.role });
    return { ok: true };
  };

  const loginAs = (role: Role) => {
    const match = placeholderAccounts.find((a) => a.role === role);
    if (!match) return { ok: false, error: 'Unknown role.' };
    persist({ email: match.email, password: match.password, name: match.name, role: match.role });
    return { ok: true };
  };

  const logout = () => persist(null);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, loginAs, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
