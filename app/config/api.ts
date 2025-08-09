import axois from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

//mime type을 추출하는 함수
const getMimeType = (extension: string): string => {
    const mimeTypes: {[key: string]: string} = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'mp4': 'video/mp4',
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

// api 요청을 위한 기본 설정
export const API_URL = 'http://localhost:8080';

const api = axois.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },// 웹에서는 쿠키 자동 전송
    withCredentials: Platform.OS === 'web',
    // cors 요청 시 쿠키 전송허용
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN'
});

// 웹 환경에서 localstorage의 토큰을 사용하는 인터셉터 추가
if(Platform.OS === 'web'){
    api.interceptors.request.use(async(config)=>{
        const token = localStorage.getItem('accessToken');
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
}

// 모바일 환경에서 SecureStore를 사용하는 인터셉터 추가
if(Platform.OS !== 'web'){
    api.interceptors.request.use(async(config)=>{
        const token = await SecureStore.getItemAsync('accessToken');
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error));


    //401 에러 처리
    api.interceptors.response.use(
        (response)=>response,
        async (error) => {
            const originalRequest = error.config;
            //401 에러가 발생하고, originalRequest에 _retry가 없으면
            if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try{
                const refreshToken = await SecureStore.getItemAsync('refreshToken');

                if(!refreshToken){
                    throw new Error("refresh token이 없습니다. 다시 로그인하세요");
                }

                const response = await api.post('/auth/refresh', {refreshToken});

                if(response.data.accessToken){
                    await SecureStore.setItemAsync('accessToken', response.data.accessToken);
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`; //이전에 실패한 토큰에 새롭게 header를 추가
                    return api(originalRequest);
                }
                throw new Error("새로운 access token을 발급받지 못했습니다.");
            }catch(error){
                console.error("토큰 갱신 실패:", error);
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                await SecureStore.deleteItemAsync('userId');

                return Promise.reject(error);
            }

            }
            return Promise.reject(error);
        }
    );
}

// 웹 환경에서 응답 인터셉터(401 에러 처리)

// 웹 환경에서 응답 인터셉터 (401 오류 처리)
if (Platform.OS === 'web') {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // 리프레시 요청 자체이거나 상태 확인 요청이면 무한 루프 방지
          if (originalRequest.url === '/auth/refresh' || originalRequest.url === '/auth/status') {
            // SSR 환경에서는 window 객체가 없으므로 조건부 처리
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/LoginScreen';
            }
            return Promise.reject(error);
          }
          
          // 웹 환경에서는 리프레시 API 호출 (서버에서 쿠키 기반으로 처리)
          await api.post('/api/auth/refresh');
          return api(originalRequest);
        } catch (refreshError) {
          // 리프레시 실패 시 로그인 페이지로 리다이렉트
          // SSR 환경에서는 window 객체가 없으므로 조건부 처리
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/LoginScreen';
          }
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
}

//사용자 로그인 상태 확인

export const checkAuthStatus = async () => {
    if(Platform.OS === 'web') {
        return !!localStorage.getItem('accessToken');
    }
}

export default api;