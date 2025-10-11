import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import api from '../config/api';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  loading: boolean;
  user: any | null;
  checkAuthStatus: () => Promise<boolean>;
  saveTokensAndSync: (data: { accessToken: string; refreshToken?: string; userId?: string | number | null }) => Promise<void>;
  logout: () => Promise<void>;
  getAuthHeader: () => Promise<{ headers: { Authorization?: string } }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let globalAuthState: AuthContextType = {
  isAuthenticated: false,
  userId: null,
  loading: true,
  user: null,
  checkAuthStatus: async () => { throw new Error('Auth method not available outside AuthProvider'); },
  saveTokensAndSync: async () => { throw new Error('Auth method not available outside AuthProvider'); },
  logout: async () => { throw new Error('Auth method not available outside AuthProvider'); },
  getAuthHeader: async () => ({ headers: {} }),
};

export async function loadAuthFromStorage(): Promise<void> {
  try {
    if (Platform.OS !== 'web') {
      const token = await SecureStore.getItemAsync('accessToken');
      const userId = await SecureStore.getItemAsync('userId');
      globalAuthState = { ...globalAuthState, isAuthenticated: !!token, userId: userId ?? null, loading: false, user: null };
    } else {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      globalAuthState = { ...globalAuthState, isAuthenticated: false, userId: userId ?? null, loading: false, user: null };
    }
  } catch {
    globalAuthState = { ...globalAuthState, loading: false };
  }
}
loadAuthFromStorage();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(globalAuthState.isAuthenticated);
  const [userId, setUserId] = useState<string | null>(globalAuthState.userId);
  const [loading, setLoading] = useState<boolean>(globalAuthState.loading);
  const [user, setUser] = useState<any | null>(globalAuthState.user);

  const getAuthHeader = async () => {
    if (Platform.OS !== 'web') {
      const token = (await SecureStore.getItemAsync('accessToken')) || '';
      return { headers: token ? { Authorization: `Bearer ${token}` } : {} };
    }
    return { headers: {} }; // 웹=쿠키
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const headers = await getAuthHeader();
      const res = await api.get('/api/auth/me', {
        withCredentials: false,
        headers: headers.headers,
      });

      const me = res.data;
      const inferredUserId = me?.email ?? me?.id ?? null;

      setIsAuthenticated(true);
      setUserId(inferredUserId ? String(inferredUserId) : null);
      setUser(me);

      if (Platform.OS === 'web' && inferredUserId) localStorage.setItem('userId', String(inferredUserId));
      return true;
    } catch {
      setIsAuthenticated(false);
      setUserId(null);
      setUser(null);

      if (Platform.OS !== 'web') {
        try {
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');
          await SecureStore.deleteItemAsync('userId');
        } catch {}
      } else {
        localStorage.removeItem('userId');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveTokensAndSync = async (data: { accessToken: string; refreshToken?: string; userId?: string | number | null }) => {
    const uid = data.userId != null ? String(data.userId) : null;
    if (Platform.OS !== 'web') {
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      if (data.refreshToken) await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      if (uid) await SecureStore.setItemAsync('userId', uid);
    } else {
      if (uid) localStorage.setItem('userId', uid);
    }
    await checkAuthStatus();
  };

  useEffect(() => { checkAuthStatus(); }, []);

  const logout = async () => {
    try {
      const headers = await getAuthHeader();
      await api.post('/api/auth/logout', {}, { withCredentials: Platform.OS === 'web', headers: headers.headers });

      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('userId');
      } else {
        localStorage.removeItem('userId');
      }

      setIsAuthenticated(false);
      setUserId(null);
      setUser(null);
    } catch (e) {
      console.error('로그아웃 오류:', e);
      throw e;
    }
  };

  useEffect(() => {
    globalAuthState = { isAuthenticated, userId, loading, user, checkAuthStatus, saveTokensAndSync, logout, getAuthHeader };
  }, [isAuthenticated, userId, loading, user]);

  const value: AuthContextType = { isAuthenticated, userId, loading, user, checkAuthStatus, saveTokensAndSync, logout, getAuthHeader };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx ?? globalAuthState;
}
