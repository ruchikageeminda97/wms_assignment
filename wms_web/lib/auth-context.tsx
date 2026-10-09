"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { ApiError, api } from "@/lib/client-api";
import type { User } from "@/lib/types";

type SessionUser = Pick<User, "id" | "email" | "fullName" | "role">;

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<SessionUser | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const profile = await api<SessionUser>("/api/auth/session");
      setUser(profile);
      return profile;
    } catch (reason) {
      setUser(null);
      if (!(reason instanceof ApiError && reason.status === 401)) {
        setError(reason instanceof Error ? reason.message : "Your session could not be checked.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setError("");
      setLoading(false);
    };
    window.addEventListener("gather:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("gather:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    if (loading || error) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (pathname === "/dashboard" && user.role === "admin") {
      router.replace("/dashboard/users");
      return;
    }
    const adminOnly = pathname.startsWith("/dashboard/users");
    const managerOnly =
      pathname.startsWith("/dashboard/workshops/new") ||
      pathname.startsWith("/dashboard/workshops/") &&
        pathname.endsWith("/edit");
    const workshopArea = pathname.startsWith("/dashboard/workshops");
    const auditArea = pathname.startsWith("/dashboard/audit-logs");
    if (
      (adminOnly && user.role !== "admin") ||
      (managerOnly && user.role !== "manager") ||
      (workshopArea && user.role === "admin") ||
      (auditArea && user.role === "staff")
    ) {
      router.replace("/forbidden");
    }
  }, [error, loading, pathname, router, user]);

  const signOut = useCallback(async () => {
    await api<{ success: boolean }>("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, error, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
