import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium } from '@expo-google-fonts/poppins';



export default function WelcomeScreen({ navigation }) {
  //Carregamento das fontes
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium });

  // Valores de animação
  const fadeTitle = useRef(new Animated.Value(0)).current;
  const fadeSubtitle = useRef(new Animated.Value(0)).current;
  const fadeDesc = useRef(new Animated.Value(0)).current;
  const fadeButtons = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  // Animações de entrada 
  useEffect(() => {
    if (!fontsLoaded) return;
    Animated.stagger(180, [
      Animated.parallel([
        Animated.timing(fadeTitle, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(slideUp, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.timing(fadeSubtitle, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeDesc, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(fadeButtons, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fontsLoaded]);
  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <StatusBar barStyle="light-content" backgroundColor="#9FA8B0" />
      <View style={styles.content}>

        {/*  Título principal e divisor */}
        <Animated.View style={{ opacity: fadeTitle, transform: [{ translateY: slideUp }] }}>
          <Text style={styles.logo}>Wave Care</Text>
          <View style={styles.divider} />
        </Animated.View>

        {/* Subtítulo */}
        <Animated.Text style={[styles.subtitle, { opacity: fadeSubtitle }]}>
          Bem‑vindo à Wave Care
        </Animated.Text>

        {/* Descrição*/}
        <Animated.Text style={[styles.description, { opacity: fadeDesc }]}>
          Crie sua conta e comece sua jornada de cuidados capilares com produtos, rotinas e dicas para
          manter seus fios saudáveis em todas as estações.
        </Animated.Text>

        {/* Botões */}
        <Animated.View style={[styles.buttonsContainer, { opacity: fadeButtons }]}>

          {/* Botão - Criar Conta */}
          <TouchableOpacity
            style={styles.btnPrimary}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate('Register')}
          >
            <Text style={styles.btnPrimaryText}>Criar Conta</Text>
          </TouchableOpacity>

          {/* Separador "Ou" */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>Ou</Text>
            <View style={styles.orLine} />
          </View>

          {/* Botão - Entrar */}
          <TouchableOpacity
            style={styles.btnSecondary}
            activeOpacity={0.85}
            onPress={() => navigation?.navigate('Login')}
          >
            <Text style={styles.btnSecondaryText}>Entrar</Text>
          </TouchableOpacity>

        </Animated.View>
      </View>
    </View>
  );
}

/* ESTILIZAÇÃO */

const styles = StyleSheet.create({

  // Container principal
  container: {
    flex: 1,
    backgroundColor: '#9FA8B0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '80%',
    alignItems: 'center',
  },

  // Título 
  logo: {
    fontFamily: 'serif',
    fontSize: 60,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
    textAlign: 'center',
  },

  // Linha divisória abaixo do título
  divider: {
    height: 1,
    backgroundColor: '#2A8C8C',
    opacity: 1,
    marginTop: 10,
    marginBottom: 18,
    width: '100%',
  },

  // Subtítulo
  subtitle: {
    fontFamily: 'serif',
    fontSize: 25,
    fontStyle: 'italic',
    color: '#FFFFFF',
    marginBottom: 14,
    textAlign: 'center',
  },

  // Descrição 
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.85,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 36,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },

  // Botão primário 
  btnPrimary: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  btnPrimaryText: {
    fontFamily: 'Poppins_500Medium',
    color: '#333333',
    fontSize: 15,
    letterSpacing: 0.4,
    fontWeight: '600',
  },

  // Separador "Ou"
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.4,
  },
  orText: {
    fontFamily: 'Poppins_400Regular',
    color: '#FFFFFF',
    fontSize: 13,
    marginHorizontal: 10,
    opacity: 0.8,
  },

  // Botão secundário 
  btnSecondary: {
    width: '100%',
    height: 50,
    backgroundColor: '#2A8C8C',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  btnSecondaryText: {
    fontFamily: 'Poppins_500Medium',
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 0.4,
    fontWeight: '500',
  },
});