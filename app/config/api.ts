import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE = Platform.select({
  web: process.env.EXPO_PUBLIC_API_BASE,
}) as string;

const api = axios.create({
  baseURL: BASE,
  headers: { Accept: 'application/json' },
  withCredentials: false, 
});

axios.defaults.withCredentials = false;

// 토큰 헬퍼
const getAT = async () =>
  Platform.OS === 'web'
    ? (localStorage.getItem('accessToken') ?? '')
    : ((await SecureStore.getItemAsync('accessToken')) ?? '');

const getRT = async () =>
  Platform.OS === 'web'
    ? (localStorage.getItem('refreshToken') ?? '')
    : ((await SecureStore.getItemAsync('refreshToken')) ?? '');

const saveAT = async (at: string) => {
  if (Platform.OS === 'web') localStorage.setItem('accessToken', at);
  else await SecureStore.setItemAsync('accessToken', at);
};

const saveRT = async (rt: string) => {
  if (Platform.OS === 'web') localStorage.setItem('refreshToken', rt);
  else await SecureStore.setItemAsync('refreshToken', rt);
};

const clearTokens = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } else {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }
};

// 유틸 
const is401 = (e: any) => e?.response?.status === 401;
const isNetwork = (e: any) => !e?.response;
const isRefreshCall = (url?: string) => /\/api\/auth\/refresh(\?|$)/.test(url ?? '');

// 요청 인터셉터: 웹/모바일 모두 AT 주입
api.interceptors.request.use(async (config) => {
  config.withCredentials = false; // 쿠키 전송 방지

  config.headers = config.headers ?? {};
  config.headers['ngrok-skip-browser-warning'] = 'true';

  const at = await getAT();
  if (at) {
    (config.headers as any).Authorization = `Bearer ${at}`;
  }

  console.log(`[API][REQ] ${config.method?.toUpperCase()} ${config.url}`, {
    withCredentials: config.withCredentials,
    hasToken: !!at,
  });

  return config;
});

// 동시 401 경합 방지 큐
let isRefreshing = false;
let waitQueue: Array<(newAT: string | null) => void> = [];
const enqueue = (cb: (t: string | null) => void) => waitQueue.push(cb);
const flush = (token: string | null) => {
  waitQueue.forEach((cb) => cb(token));
  waitQueue = [];
};

// 응답 인터셉터: 401 -> refresh -> 재시도 (웹/모바일 공통)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (isNetwork(error)) return Promise.reject(error);

    const req = error.config || {};
    const url = String(req.url || '');

    if (!is401(error) || isRefreshCall(url)) {
      return Promise.reject(error);
    }

    if ((req as any)._retry) {
      return Promise.reject(error);
    }
    (req as any)._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        enqueue((newAT) => {
          if (!newAT) return reject(error);
          req.headers = { ...(req.headers || {}), Authorization: `Bearer ${newAT}` };
          resolve(api(req));
        });
      });
    }

    try {
      isRefreshing = true;

      const rt = await getRT();
      if (!rt) throw new Error('No refresh token');
      const refreshRes = await axios.post(
        `${BASE}/api/auth/refresh`,
        { refreshToken: rt },
        { withCredentials: false }
      );

      const newAT: string | undefined = refreshRes.data?.accessToken;
      const newRT: string | undefined = refreshRes.data?.refreshToken;

      if (!newAT) throw new Error('Refresh failed: no accessToken');

      await saveAT(newAT);
      if (newRT) await saveRT(newRT);

      flush(newAT);
      isRefreshing = false;

      req.headers = { ...(req.headers || {}), Authorization: `Bearer ${newAT}` };
      return api(req);
    } catch (e) {
      isRefreshing = false;
      flush(null);
      await clearTokens();

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        if (window.location.pathname !== '/auth/Login') {
          window.location.replace('/auth/Login');
        }
      }
      return Promise.reject(e);
    }
  }
);

export default api;
