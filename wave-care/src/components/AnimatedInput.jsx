// src/components/AnimatedInput.js
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolateColor } from 'react-native-reanimated';

export default function AnimatedInput({ placeholder, ...props }) {
  const focused = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        focused.value,
        [0, 1],
        ['#E0E0E0', '#2A8C8C'] // Cinza para Verde Água ao focar
      ),
      borderWidth: withTiming(focused.value ? 2 : 1),
    };
  });

  return (
    <Animated.View style={[styles.inputContainer, animatedStyle]}>
      <TextInput
        {...props}
        placeholder={placeholder}
        placeholderTextColor="#999"
        onFocus={() => (focused.value = withTiming(1))}
        onBlur={() => (focused.value = withTiming(0))}
        style={styles.input}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
    justifyContent: 'center',
    // Sombras para Mobile
    elevation: 2,
    // Sombras para Web
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  input: { 
    fontSize: 16, 
    color: '#333',
    outlineStyle: 'none', // Remove a borda azul padrão do navegador no Web
  }
});