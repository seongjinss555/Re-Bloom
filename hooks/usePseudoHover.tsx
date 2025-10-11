import { useRef } from 'react';
import { Animated, Platform } from 'react-native';

export function usePseudoHover(runSheen?: () => void) {
  const hover = useRef(new Animated.Value(0)).current; 

  const enter = () => {
    Animated.spring(hover, {
      toValue: 1,
      tension: 140,
      friction: 12,
      useNativeDriver: true,
    }).start();
    runSheen?.();
  };

  const leave = () => {
    Animated.spring(hover, {
      toValue: 0,
      tension: 140,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };

  const bind = Platform.select({
    web: {
      onHoverIn: enter,
      onHoverOut: leave,
    },
    ios: {
      onPressIn: enter,
      onPressOut: leave,
    },
  })!;

  return { hover, enter, leave, bind };
}
