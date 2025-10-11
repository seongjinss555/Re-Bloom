import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Platform, Text, View } from 'react-native';
import api from '../config/api';
import { useAuth } from '../context/authContext';

const takeFirst = (v?: string | string[]) => Array.isArray(v) ? v[0] : v;

export default function SocialCallback() {
  const router = useRouter();
  const { checkAuthStatus, saveTokensAndSync } = useAuth();

  const params = useLocalSearchParams<{
    accessToken?: string | string[];
    refreshToken?: string | string[];
    userId?: string | string[];
    mode?: string | string[];
    error?: string | string[];
    one_time_code?: string | string[];
  }>();

    const [msg, setMsg] = useState('🌱 Re:Bloom에 로그인 중입니다...');
  
  // 애니메이션 값 설정
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 5000, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1.05, duration: 5000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0.6, duration: 5000, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 0.9, duration: 5000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const err = takeFirst(params.error);
        if (err) {
          setMsg(`로그인 실패: ${err}`);
          router.replace('/auth/Login'); 
          return;
        }

        // 모바일: one_time_code 교환
        const code = takeFirst(params.one_time_code);
        if (code && Platform.OS !== 'web') {
          const res = await api.post('/api/auth/mobile/finalize', { code }, { withCredentials: false });
          const { accessToken: at, refreshToken: rt, userId: uid } = res.data ?? {};
          if (!at) throw new Error('토큰 교환 실패');

          await saveTokensAndSync({ accessToken: at, refreshToken: rt, userId: uid });
          router.replace(takeFirst(params.mode) === 'signup' ? '/auth/Register' : '/pages/Home');
          return;
        }

        const at = takeFirst(params.accessToken);
        const rt = takeFirst(params.refreshToken);
        const uid = takeFirst(params.userId);

        if (at) {
          if (Platform.OS === 'web') {
            localStorage.setItem('accessToken', at);
            if (rt) localStorage.setItem('refreshToken', rt);
            if (uid) localStorage.setItem('userId', uid);
          } else {
            await SecureStore.setItemAsync('accessToken', at);
            if (rt) await SecureStore.setItemAsync('refreshToken', rt);
            if (uid) await SecureStore.setItemAsync('userId', uid);
          }

          await checkAuthStatus();
          router.replace(takeFirst(params.mode) === 'signup' ? '/auth/Register' : '/pages/Home');
          return;
        }
        if (await checkAuthStatus()) {
          router.replace('/pages/Home');
          return;
        }

        setMsg('로그인 정보가 없습니다. 다시 시도해주세요.');
      } catch (e: any) {
        setMsg(`처리 중 오류: ${e?.message ?? String(e)}`);
        router.replace('/auth/Login'); 
      }
    })();
  }, []);

  return (
  <View style={{
    flex: 1,
    backgroundColor: '#FFE4E1',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
  <Animated.View style={{
    backgroundColor: '#FFF7F6',
    borderRadius: 100,
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: scaleAnim }],
    opacity: fadeAnim,
    shadowColor: '#FF7A85',
    shadowOpacity: 0.4,
    shadowRadius: 20,
  }}>  
  </Animated.View>
  <ActivityIndicator size="large" color="#0134ffff" />  
  <Text style={{ color: '#B04B55', fontSize: 23, fontWeight: '700', marginTop: 20,}}>
    {msg}
  </Text>
  <Text style={{ color: '#C77C7C', fontSize: 16, marginTop: 8 }}>
    잠시만 기다려주세요...
  </Text>
</View>
  );
}
