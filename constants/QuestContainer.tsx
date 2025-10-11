import React, { useRef, useState } from 'react';
import { Animated, Easing, GestureResponderEvent, LayoutChangeEvent, Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { usePseudoHover } from '../hooks/usePseudoHover';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
};

export default function QuestContainer({ children, style, onPress }: Props) {
//   const press = useRef(new Animated.Value(0)).current;    
  const sheen = useRef(new Animated.Value(0)).current;     
  const [box, setBox] = useState({ w: 0, h: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox({ w: width, h: height });
  };

  const runSheen = () => {
    sheen.setValue(0);
    Animated.timing(sheen, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const { hover, bind, enter, leave } = usePseudoHover(runSheen);

  const handleTouchStart = (e: GestureResponderEvent) => {
    if (Platform.OS === 'web') return; 
    enter(); 
  };

  const handleTouchMove = (e: GestureResponderEvent) => {
    if (Platform.OS === 'web') return;
    const { locationX: x, locationY: y } = e.nativeEvent;
    const inside = x >= 0 && x <= box.w && y >= 0 && y <= box.h;
    if (!inside) {
      leave();
    } else {
      enter();
    }
  };
  
  const handleTouchEnd = () => {
    if (Platform.OS === 'web') return;
    leave(); // 손 떼면 hover off
  };

  const scale = hover.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.985],
  });
  const highlightOpacity = hover.interpolate({
    inputRange: [0, 1],
    outputRange: [0.06, 0.18],
  });
  const sheenX = sheen.interpolate({
    inputRange: [0, 1],
    outputRange: [-box.w, box.w],
  });

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.card,
        {
          transform: [{ scale }],
        },
        style,
      ]}
    >
      <Pressable 
        {...bind} 
        onPress={onPress}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={StyleSheet.absoluteFill}>
        <View style={styles.bg} />
        <Animated.View
          pointerEvents="none"
          style={[styles.softHighlight, { opacity: highlightOpacity }]}
        />
        <View style={styles.content}>{children}</View>
        {box.w > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.sheen,
              {
                transform: [
                  { translateX: sheenX },
                  { translateY: 0 },
                  { rotate: '20deg' }, 
                ],
              },
            ]}
          />
        )}
        <View style={styles.innerBorder} pointerEvents="none" />
      </Pressable>
    </Animated.View>
  );
}

const RADIUS = 20;

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: '#1663c8ff',
    shadowColor: '#c5b0b0ff',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#13d0ddff',
  },
  softHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS,
    backgroundColor: '#36cdf3ff', // 배경
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheen: {
    position: 'absolute',
    top: -40,
    width: 120,           
    height: 200,          
    backgroundColor: '#bdee0dff', //슬라이딩 효과
    borderRadius: 12,
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: '#ffff',
  },
});
