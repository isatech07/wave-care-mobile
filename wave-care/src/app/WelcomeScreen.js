import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay 
} from 'react-native-reanimated';
import { Colors } from '../theme/colors'; // Usando o arquivo de cores criado anteriormente

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ 
    Poppins_400Regular, 
    Poppins_500Medium,
    Poppins_700Bold 
  });

  // Micro-interação para os botões
  const scaleBtn = useSharedValue(1);
  const animatedBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleBtn.value }]
  }));

  if (!fontsLoaded) return null;

  const pressIn = () => (scaleBtn.value = withSpring(0.96));
  const pressOut = () => (scaleBtn.value = withSpring(1));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background Cinematográfico */}
      <LinearGradient
        colors={[Colors.secondary, Colors.primary, Colors.background]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        
        {/* Bloco de Título Animado */}
        <Animated.View 
          entering={FadeInUp.duration(1000).springify()}
          style={styles.header}
        >
          <Text style={styles.logo}>Wave Care</Text>
          <View style={styles.divider} />
        </Animated.View>

        {/* Textos com Entrada em Cascata (Stagger) */}
        <Animated.Text 
          entering={FadeInDown.delay(400).duration(800)}
          style={styles.subtitle}
        >
          Bem‑vindo à Wave Care
        </Animated.Text>

        <Animated.Text 
          entering={FadeInDown.delay(600).duration(800)}
          style={styles.description}
        >
          Crie sua conta e comece sua jornada de cuidados capilares com produtos e rotinas para manter seus fios saudáveis.
        </Animated.Text>

        {/* Container de Ações */}
        <Animated.View 
          entering={FadeInDown.delay(800).duration(800)}
          style={styles.buttonsContainer}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={() => navigation?.navigate('Cadastro')}
          >
            <Animated.View style={[styles.btnPrimary, animatedBtnStyle]}>
              <Text style={styles.btnPrimaryText}>Criar Conta</Text>
            </Animated.View>
          </TouchableOpacity>

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>Ou</Text>
            <View style={styles.orLine} />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation?.navigate('Login')}
            style={styles.btnSecondary}
          >
            <Text style={styles.btnSecondaryText}>Entrar</Text>
          </TouchableOpacity>
        </Animated.View>
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
    fontFamily: 'serif', // Ou Poppins_700Bold para mais modernidade
    fontSize: 54,
    color: '#FFFFFF',
    letterSpacing: -1,
    textAlign: 'center',
  },
  divider: {
    height: 4,
    backgroundColor: Colors.accent,
    width: 60,
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
    fontFamily: 'Poppins_500Medium',
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '700',
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
    color: '#FFFFFF',
    fontSize: 14,
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
    color: '#FFFFFF',
    fontSize: 16,
  },
});