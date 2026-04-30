import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function SejaBemVindo() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={[Colors.secondary, Colors.primary, Colors.background]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Wave Care</Text>
          <View style={styles.divider} />
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Bem‑vinda à Wave Care
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          Crie sua conta e comece sua jornada de cuidados capilares com produtos e rotinas para manter seus fios saudáveis.
        </Text>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>

          <TouchableOpacity
            style={styles.btnPrimary}
            activeOpacity={0.8}
            onPress={() => router.push('/cadastro')}
          >
            <Text style={styles.btnPrimaryText}>Criar Conta</Text>
          </TouchableOpacity>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>Ou</Text>
            <View style={styles.orLine} />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/login')}
            style={styles.btnSecondary}
          >
            <Text style={styles.btnSecondaryText}>Entrar</Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '85%',
    alignItems: 'center',
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontFamily: 'serif',
    fontWeight: '600',
    fontSize: 54,
    color: '#FFFFFF',
    letterSpacing: -1,
    textAlign: 'center',
  },
  divider: {
    height: 4,
    width: 60,
    backgroundColor: Colors.accent,
    borderRadius: 2,
    marginTop: -5,
  },
  subtitle: {
    fontFamily: 'serif',
    fontSize: 24,
    fontStyle: 'italic',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  buttonsContainer: {
    width: '100%',
  },
  btnPrimary: {
    width: '100%',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  btnPrimaryText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: Colors.secondary,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
  },
  orText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
    marginHorizontal: 15,
  },
  btnSecondary: {
    width: '100%',
    height: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
});