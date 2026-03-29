'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, clearStoredToken, getCurrentUser, getStoredToken, loginUser, registerUser, setStoredToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrateAuth() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      setToken(storedToken);
      try {
        const result = await getCurrentUser();
        if (!cancelled) {
          setUser(result.user);
        }
      } catch {
        clearStoredToken();
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    hydrateAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  async function login(payload) {
    const result = await loginUser(payload);
    setStoredToken(result.token);
    setToken(result.token);
    setUser(result.user);
    return result;
  }

  async function register(payload) {
    const result = await registerUser(payload);
    setStoredToken(result.token);
    setToken(result.token);
    setUser(result.user);
    return result;
  }

  function logout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new ApiError('useAuth must be used inside AuthProvider');
  }

  return context;
}

