import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const TOKEN_STORAGE_KEY = "shopping_app_access_token";

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Holds JWT access token. */
  const [accessToken, setAccessToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!accessToken;

  // PUBLIC_INTERFACE
  const setToken = useCallback((token) => {
    setAccessToken(token);
    try {
      if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
      else localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // ignore storage errors (private mode etc.)
    }
  }, []);

  // PUBLIC_INTERFACE
  const logout = useCallback(() => {
    setToken(null);
  }, [setToken]);

  const value = useMemo(
    () => ({
      accessToken,
      isAuthenticated,
      setToken,
      logout,
    }),
    [accessToken, isAuthenticated, logout, setToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access authentication state and actions. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
