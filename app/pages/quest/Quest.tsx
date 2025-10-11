import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, StyleSheet, Text, View } from "react-native";

const { width: screenWidth } = Dimensions.get('window');

export default function QuestScreen(){
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    let isMounted = true;

    // 로딩 애니메이션 시작
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
    ]).start();

    // API 호출/생성 로직
    const run = async () => {
      try {
        // 1.2초 딜레이로 API 대체
        await new Promise(r => setTimeout(r, 2000));
        // API 호출 로직
      } catch (e) {
        console.warn(e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    run();
    return () => { isMounted = false; };
  }, [fadeAnim, slideAnim]);

  if (isLoading) {
    return (
      <LinearGradient colors={['#599fe1ff', '#FFD3F0']} style={styles.loadingProgress}>
        <Animated.View
          style={[
            styles.loadingContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>오늘의 퀘스트는?</Text>
          <Text style={styles.loadingSubText}>퀘스트 생성 중…</Text>
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#18c8d1ff', '#e9eaebff']} style={{ flex: 1, width: screenWidth }}>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={styles.loadingCompleteText}>퀘스트 준비 완료!</Text>
    </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingProgress: {
    flex: 1, 
    width: '100%', 
    height: '100%',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 15, 
    padding: 24, 
    width: '85%', 
    alignItems: 'center',
  },
  loadingText: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginTop: 20, 
    textAlign: 'center' 
},
  loadingSubText: { 
    color: '#ccc', 
    textAlign: 'center', 
    marginTop: 10, 
    fontSize: 16 
},
  loadingCompleteText: {
    color: '#fff',
    fontSize: 35,
    fontWeight: 'bold',
}
});
