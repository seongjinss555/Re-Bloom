// app/login/success.tsx  (경로는 실제 딥링크와 맞추세요)
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { useAuth } from '../context/authContext';

export default function LoginSuccessScreen() {
  const router = useRouter();
  const { checkAuthStatus } = useAuth(); 
  const { token, refreshToken, userId, mode, error } = useLocalSearchParams<{
    token?: string;
    refreshToken?: string;
    userId?: string;
    mode?: string;
    error?: string;
  }>();

  useEffect(() => {
    (async () => {
      try {
        if (typeof error === 'string' && error) {
          // 실패 시: 로그인 화면
          router.replace('/auth/Login');
          return;
        }

        if (typeof token === 'string' && token.length > 0) {
          // 저장
          await SecureStore.setItemAsync('accessToken', token);
          if (typeof refreshToken === 'string') {
            await SecureStore.setItemAsync('refreshToken', refreshToken);
          }
          if (typeof userId === 'string') {
            await SecureStore.setItemAsync('userId', userId);
          }
         // 인증 상태 동기화
          try { await checkAuthStatus?.(); } catch {}

          // 라우팅
          router.replace('/pages/Home');
          return;
        }

        // token이 전혀 없을 때의 안전장치
        router.replace('/auth/Login');
      } catch {
        router.replace('/auth/Login');
      }
    })();
  }, [token, refreshToken, userId, mode, error]);

  return null;
}
