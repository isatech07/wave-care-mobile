import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';

export default function primavera() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });
  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wave Care</Text>
      <Text style={styles.subtitle}>Primavera</Text>
      <Text style={styles.text}>Relaxamento capilar e leveza para a nova estação.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFBFA', padding: 20 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 28, color: '#2D5A45' },
  subtitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, color: '#1c1c1e', marginTop: 8 },
  text: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#666', marginTop: 8 },
});
