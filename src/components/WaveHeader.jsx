import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

export default function WaveHeader() {
  const offset = useSharedValue(0);

  React.useEffect(() => {
    offset.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedProps = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }]
  }));

  return (
    <Animated.View style={[styles.container, animatedProps]}>
      <Svg height="120" width="100%" viewBox="0 0 1440 320">
        <Path
          fill="#1A7A78"
          d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, width: '100%', zIndex: -1 }
});