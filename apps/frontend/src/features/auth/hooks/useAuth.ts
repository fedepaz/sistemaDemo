// src/features/auth/hooks/useAuth.ts
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AuthResponseDto } from "@vivero/shared";
import { useCallback, useEffect, useState } from "react";

interface AuthState {
  accessToken: string | null;
  user: AuthResponseDto["user"] | null;
  isSignedIn: boolean;
}

const TOKEN_KEY = "accessToken";
const USER_KEY = "userProfile";
const AUTH_EVENT = "auth-state-change";

export function useAuth() {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>(() => {
    if (typeof window === "undefined") {
      return {
        accessToken: null,
        user: null,
        isSignedIn: false,
      };
    }

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const user = localStorage.getItem(USER_KEY);
      const parsedUser = user ? JSON.parse(user) : null;

      return {
        accessToken: token,
        user: parsedUser,
        isSignedIn: !!token,
      };
    } catch {
      return {
        accessToken: null,
        user: null,
        isSignedIn: false,
      };
    }
  });

  const signOut = useCallback(() => {
    queryClient.cancelQueries();
    queryClient.clear();

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthState({
      accessToken: null,
      user: null,
      isSignedIn: false,
    });
  }, [queryClient]);

  const loadFromStorage = useCallback(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const user = localStorage.getItem(USER_KEY);
      const parsedUser = user ? JSON.parse(user) : null;

      setAuthState({
        accessToken: token,
        user: parsedUser,
        isSignedIn: !!token,
      });
    } catch {
      signOut();
    }
  }, [signOut]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY || e.key === USER_KEY) {
        loadFromStorage();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadFromStorage]);

  const signIn = useCallback(
    async (accessToken: string, user: AuthResponseDto["user"]) => {
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setAuthState({
        accessToken,
        user,
        isSignedIn: true,
      });
      window.dispatchEvent(new Event(AUTH_EVENT));
    },
    [],
  );

  useEffect(() => {
    const handleAuthChange = () => loadFromStorage();
    window.addEventListener(AUTH_EVENT, handleAuthChange);
    return () => window.removeEventListener(AUTH_EVENT, handleAuthChange);
  }, [loadFromStorage]);

  return {
    ...authState,
    loading: false,
    signIn,
    signOut,
  };
}
