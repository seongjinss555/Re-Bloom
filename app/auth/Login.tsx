import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { AuthProvider, useAuth } from '../context/authContext';
import { googleLogin } from './GoogleLogin';


const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<String | null>(null);
  const {checkAuthStatus} = useAuth();

  // 웹 환경에서 url 파라미터 확인(리다이렉트 후 토큰 확인)
  useEffect(() => {
    // 웹 환경에서는 서버 인증 상태 확인으로 대체
    if(Platform.OS === 'web'){
        checkAuthStatus();
    }
  },[]);


  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      delay: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  // 구글 로그인 처리
  const handleGoogleLogin = async () => {
    if(isLoading) return;

    setIsLoading(true);
    setProvider('google');
    console.log('구글 로그인 시작');

    try{
        if(Platform.OS === 'web'){
            // 웹 환경에서는 직접 리다이렉트
            await googleLogin();
        }else{
            // 모바일 환경에서는 googleLogin 함수 사용
            const result = await googleLogin();
            console.log("결과 : ", result);

            // 인증 상태 확인
            await checkAuthStatus();

            // 인증 상태 변경 후 미들웨어가 적절한 페이지로 자동 리다이렉션
            router.replace('/pages/Home');
        }
    }catch(error){
        console.error('구글 로그인 오류', error);
        setIsLoading(false);
        Alert.alert(
            "Google Login failed",
            "Please try again"
        );
    }finally{
        if(Platform.OS !== 'web'){
            setIsLoading(true);
        }
    }
};

  return (
    <AuthProvider>
    <LinearGradient
      colors={['#599fe1ff', '#FFD3F0']}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.centerText,
          {
            opacity:fadeAnim,
            transform:[{translateY: slideAnim}],
          }
        ]}
      >
        <Text style={styles.title}>환영해요!</Text>
        <Text style={styles.subtitle}>다시 오셔서 기뻐요</Text>
      </Animated.View>
      
      <Animated.View style={[styles.bottomButtons, { opacity: fadeAnim }]}>
        <TouchableOpacity
             onPress={handleGoogleLogin}
            disabled={isLoading}
            style={[
                
                isLoading && provider === 'google' ? styles.buttonDisabled : null
            ]}
            activeOpacity={0.8}
        >
        
        <Image 
            source={require('../../assets/images/google.png')}
            style={styles.googleLogo}
            resizeMode='contain'
        />
         
    </TouchableOpacity>
      </Animated.View>
      {isLoading && (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size = "small" color="#fff" style = {styles.spinner}/>
            <Text style={styles.loadingText}>로그인 중...</Text>
        </View>
      )}
      <View style={styles.footer}>
        <FontAwesome5 name="compass" size={20} color="#fff"/>
        <Text style={styles.footerText}>오늘의 감정을 공유해볼까요?</Text>
      </View>
    </LinearGradient>
    </AuthProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
  },
  centerText: {
    alignItems: 'center',
    position: 'absolute',
    top: 150,
    width: width,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginTop: 8,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    marginVertical: 6,
  },
  // 구글 관련
  googleButtonContentWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  googleLogoContainer: {
    marginRight: 8,
  },
  googleLogo: {
    width: 180,
    height: 50,
    marginRight: 8,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
},
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  spinner: {
    marginRight: 8,
  },
  loadingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    marginLeft: 8,
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
 
});

