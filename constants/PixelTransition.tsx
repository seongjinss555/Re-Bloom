import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue
} from 'react-native-reanimated';

type Props = {
  firstContent: React.ReactNode;
  secondContent: React.ReactNode;
  gridSize?: number;
  pixelColor?: string;
  stepMs?: number; // 각 픽셀 지연 간격
  pixelFadeMs?: number; // 픽셀 표시 & 숨김 시간
  style?: ViewStyle;
  aspectRatio?: number;
  onPress?: () => void;
};

const DEFAULTS ={
  gridSize: 7,
  pixelColor: '#000',
  stepMs: 8,
  pixelFadeMs: 90,
};

export default function PixelTransition({
  firstContent,
  secondContent,
  gridSize = DEFAULTS.gridSize,
  pixelColor = DEFAULTS.pixelColor,
  stepMs = DEFAULTS.stepMs,
  pixelFadeMs = DEFAULTS.pixelFadeMs,
  style,
  aspectRatio = 1,
  onPress,
}: Props) {
  const total = gridSize * gridSize;
  
  const [active, setActive] = useState(false);
  const [triggered, setTriggered] = useState(0); 

  const handlePress = () => {
   if (!active) {
      startPixels('in', () => {
        setShowSecond(true);      
        startPixels('out', () => setActive(true));
      });
    } else {
      onPress?.();                
    }
  };

  const order = useMemo(()=> {
    const arr = Array.from({length: total}, (_,i)=> i);
    for(let i = total-1; i>0; i--){
      const j = Math.floor(Math.random() * (i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },[total]);

  const [showSecond, setShowSecond] = useState(active);

  const resetPixels = () => {
  pixelRefs.current.forEach(ref => {
    if (ref) ref.value.value = 0;
  });
  };

  const runTransition = (toActive: boolean) => {
    resetPixels();
    startPixels('in',()=>{
      setShowSecond(toActive);
      startPixels('out');
    });
    setActive(toActive);
    setTriggered((k) => k + 1);
  };

  const pixelRefs = useRef<Array<{value: Animated.SharedValue<number>}>>([]);
  pixelRefs.current = []; // 렌더링마다 재수집

  const register = (sv: SharedValue<number>) => {
    pixelRefs.current.push({value: sv});
  };

  const layerOpacity = useSharedValue(0);
  const layerStyle = useAnimatedStyle(() => ({ opacity: layerOpacity.value }));

  const startPixels = (phase: 'in' | 'out', onDone?: () => void) =>{
    const target = phase === 'in' ? 1: 0;

    if(phase==='in'){
      layerOpacity.value=1;
    }

    // 각 픽셀을 랜덤 순서에 따라 withDelay로 애니메이션 실행
    order.forEach((pixelIndex, i)=>{
      const ref = pixelRefs.current[pixelIndex];
      if(!ref) return;
      ref.value.value = withDelay(
        i*stepMs,
        withTiming(target, {duration: pixelFadeMs})
      );
    });

    const doneAfter = (order.length - 1) * stepMs + pixelFadeMs;

    setTimeout(() => {
    onDone?.();
    if (phase === 'out') {
      pixelRefs.current.forEach(ref => { if (ref) ref.value.value = 0; });
      layerOpacity.value = withTiming(0, { duration: 80 });
    }
  }, doneAfter + 16);
};

  const isWeb = Platform.OS === 'web';
  const onHoverIn = isWeb ? () => !active && runTransition(true) : undefined;
  const onHoverOut = isWeb ? () => active && runTransition(false) : undefined;

  return (
    <Pressable
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      onPress={handlePress} // 모바일에서는 터치로 토글
      style={[styles.card, style, {aspectRatio}]}
    >

      <View style={StyleSheet.absoluteFill}>
        {showSecond ? <View style={{flex:1}}>{secondContent}</View>
         : <View style={{flex:1}}>{firstContent}</View>}
      </View>

      <Animated.View style={[StyleSheet.absoluteFill, layerStyle]} pointerEvents="none">
        {Array.from({ length: total }).map((_, idx) => {
          const sizePx = 100 / gridSize;
          const row = Math.floor(idx / gridSize);
          const col = idx % gridSize;
          return (
            <Pixel
              key={idx}
              left={col * sizePx}
              top={row * sizePx}
              size={sizePx}
              color={pixelColor}
              register={register}
              triggerKey={triggered}
            />
          );
        })}
      </Animated.View>
    </Pressable>
  );
}

function Pixel({
  left,
  top,
  size,
  color,
  register,
  triggerKey,
}: {
  left: number;
  top: number;
  size: number;
  color: string;
  register: (sv: SharedValue<number>) => void;
  triggerKey: number;
}) {
  const v = useSharedValue(0); 
  useEffect(() => {
    register(v);
  }, []); 

  const style = useAnimatedStyle(() => {
    return {
      opacity: v.value,
      transform: [{ scale: 0.9 + v.value * 0.1 }],
    };
  });

  return (
    <Animated.View
      data-trigger={triggerKey}
      style={[
        {
          position: 'absolute',
          left: `${left}%`,
          top: `${top}%`,
          width: `${size}%`,
          height: `${size}%`,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    width: '15%',
    overflow: 'hidden',
    borderRadius: 12,
  },
});
