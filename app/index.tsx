import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const router = useRouter();

  const goLogin = () => {
    router.push('/auth/Login');
  };

  const goRegister =()=>{
    router.push('/auth/Register');
  }
  
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

  return (
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
        <Text style={styles.title}>Re:Bloom</Text>
        <Text style={styles.subtitle}>언제나 당신곁에</Text>
      </Animated.View>
      
      <Animated.View style={[styles.bottomButtons, { opacity: fadeAnim }]}>
        <TouchableOpacity>
          <Text style={styles.buttonText} onPress={goLogin}>시작하기</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.buttonText} onPress={goRegister}>회원가입</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
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
});

