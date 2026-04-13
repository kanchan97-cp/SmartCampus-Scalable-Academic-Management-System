import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../lib/api";
import { User } from "../types";

interface LoginResult {
  token: string;
  user: User;
}

interface AuthContextValue {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const tokenKey = "smartcampus.token";
const userKey = "smartcampus.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(tokenKey));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(userKey);
    return stored ? (JSON.parse(stored) as User) : null;
  });

  useEffect(() => {
    if (!token) return;
    api<User>("/auth/me", {}, token)
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem(userKey, JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
        setToken(null);
        setUser(null);
      });
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login: async (email: string, password: string) => {
        const result = await api<LoginResult>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setToken(result.token);
        setUser(result.user);
        localStorage.setItem(tokenKey, result.token);
        localStorage.setItem(userKey, JSON.stringify(result.user));
      },
      logout: () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
      },
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
