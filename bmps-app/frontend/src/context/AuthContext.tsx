import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import api from "@/lib/api";
import { getSession, saveSession, signOut as clearSession, type Session } from "@/lib/auth";

type AuthContextValue = {
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => getSession());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const user = {
        id: data.user.id,
        code: data.user.code,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        department: data.user.department,
      };
      saveSession(user, data.token);
      setSession({ ...user, token: data.token });
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
