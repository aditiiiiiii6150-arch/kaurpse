"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const AuthCtx = createContext({ user: null, ready: false, refresh: () => {}, logout: async () => {} });

export function AuthProvider({ initialUser, children }) {
  const [user, setUser] = useState(initialUser || null);
  const [ready, setReady] = useState(Boolean(initialUser));

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/me", { cache: "no-store" });
      const d = await r.json();
      setUser(d.user || null);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    // Always sync on mount in case server snapshot is stale
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, ready, refresh, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
