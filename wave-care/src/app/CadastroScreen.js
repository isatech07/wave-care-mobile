import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import AnimatedInput from '../components/AnimatedInput';
import { Colors } from '../theme/colors';

export default function CadastroScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  const [nome,      setNome]      = useState('');
  const [email,     setEmail]     = useState('');
  const [senha,     setSenha]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [showSenha, setShowSenha] = useState(true);

  const loadProgress  = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${loadProgress.value}%`,
  }));

  if (!fontsLoaded) return null;

  const handleCadastro = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos para criar sua conta.');
      return;
    }

    setLoading(true);
    loadProgress.value = withTiming(100, { duration: 1500 });

    try {
      const newUser = {
        name:      nome.trim(),
        email:     email.trim(),
        phone:     '',
        city:      '',
        orders:    [],
        favorites: [],
      };

      await AsyncStorage.setItem('wavecare_user', JSON.stringify(newUser));
      await AsyncStorage.setItem('wavecare_last_email', email.trim());

      setTimeout(() => {
        setLoading(false);
        navigation.navigate('Login');
      }, 1800);
    } catch (e) {
      setLoading(false);
      loadProgress.value = 0;
      Alert.alert('Erro', 'Não foi possível criar a conta. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.logo}>Wave Care</Text>
          </Animated.View>

          {/* Card */}
          <Animated.View
            entering={FadeInDown.springify().damping(12)}
            style={styles.card}
          >
            <Text style={styles.title}>Criar Conta</Text>

            <AnimatedInput
              placeholder="Nome Completo"
              value={nome}
              onChangeText={setNome}
            />

            <AnimatedInput
              placeholder="E-mail"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />

            <View style={styles.passwordContainer}>
              <AnimatedInput
                placeholder="Sua Senha"
                secureTextEntry={showSenha}
                value={senha}
                onChangeText={setSenha}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowSenha(!showSenha)}
              >
                <Ionicons
                  name={showSenha ? 'eye-off' : 'eye'}
                  size={20}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* Botão principal */}
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleCadastro}
              disabled={loading}
            >
              <View style={styles.btnContent}>
                <Animated.View style={[styles.progressBar, progressStyle]} />
                <Text style={styles.btnText}>
                  {loading ? 'Criando...' : 'Finalizar Cadastro'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Footer */}
            <TouchableOpacity
              style={styles.footerLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.footerText}>
                Já tem uma conta?{' '}
                <Text style={styles.footerLinkText}>Entrar</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 40,
  },

  header: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    top: 50,
  },
  logo: {
    fontFamily: 'serif',
    fontWeight: '600',
    fontSize: 40,
    color: '#FFF',
  },

  card: {
    backgroundColor: '#F7F5F0',
    marginHorizontal: 20,
    borderRadius: 35,
    padding: 25,
    minHeight: 450,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    color: Colors.secondary,
    marginBottom: 20,
  },

  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 18,
    zIndex: 10,
  },

  btnPrimary: {
    backgroundColor: Colors.secondary,
    borderRadius: 18,
    height: 60,
    marginTop: 20,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  btnContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 4,
    backgroundColor: Colors.accent,
  },
  btnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#FFF',
  },

  footerLink: {
    marginTop: 25,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#666',
  },
  footerLinkText: {
    fontFamily: 'Poppins_700Bold',
    color: Colors.primary,
  },
});