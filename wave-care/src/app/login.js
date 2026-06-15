import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useRouter } from 'expo-router';
import AnimatedInput from '../components/AnimatedInput';
import { Colors } from '../theme/colors';
import { authService } from '../services/authService';
import { useUser } from '../contexts/UserContext';

const { width } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const { login } = useUser();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const buttonWidth = useSharedValue(width * 0.8);
  const loadingProgress = useSharedValue(0);

  // Limpa qualquer resquício de login anterior (apenas uma vez)
  useEffect(() => {
    const cleanStorage = async () => {
      await AsyncStorage.multiRemove(['wavecare_token', 'wavecare_user']);
    };
    cleanStorage();
  }, []);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    width: buttonWidth.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${loadingProgress.value}%`,
    opacity: loadingProgress.value > 0 ? 1 : 0,
  }));

  if (!fontsLoaded) return null;

  const handleLogin = async () => {
    if (loading) return;
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    buttonWidth.value = withSpring(width * 0.7);
    loadingProgress.value = withTiming(100, {
      duration: 2000,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

    try {
      // Chama o serviço de autenticação
      const data = await authService.login(email.trim(), senha);
      
      // Email digitado (garantia)
      const typedEmail = email.trim().toLowerCase();
      
      // Chama o login do contexto, passando o email digitado explicitamente
      await login(data.user, data.access_token, typedEmail);
      
      // O redirecionamento agora é feito DENTRO do contexto,
      // então não precisa de router.replace aqui.
    } catch (error) {
      console.log('Erro no login:', error?.response?.data || error.message);
      setLoading(false);
      loadingProgress.value = 0;
      buttonWidth.value = withSpring(width * 0.8);
      
      let errorMsg = 'Falha na autenticação. Verifique suas credenciais.';
      if (error.response?.data?.message) errorMsg = error.response.data.message;
      Alert.alert('Erro', errorMsg);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient colors={[Colors.secondary, Colors.primary]} style={styles.header}>
        <Animated.Text entering={FadeInUp.delay(200)} style={styles.title}>
          Wave Care
        </Animated.Text>
        <Animated.Text entering={FadeInUp.delay(400)} style={styles.subtitle}>
          Sua beleza no ritmo das ondas.
        </Animated.Text>
      </LinearGradient>

      <Animated.View entering={FadeInDown.springify()} style={styles.loginCard}>
        <AnimatedInput
          placeholder="E-mail"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <AnimatedInput
            placeholder="Senha"
            secureTextEntry={secureText}
            value={senha}
            onChangeText={setSenha}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setSecureText(!secureText)}>
            <Ionicons
              name={secureText ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={Colors.accent}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPass}>
          <Text style={styles.forgotText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity activeOpacity={0.9} onPress={handleLogin} disabled={loading}>
            <Animated.View style={[styles.loginButton, animatedButtonStyle]}>
              <Animated.View style={[styles.progressBar, progressStyle]} />
              <Text style={styles.buttonText}>{loading ? 'Conectando...' : 'Entrar'}</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <TouchableOpacity style={styles.footer} onPress={() => router.push('/cadastro')}>
        <Text style={styles.footerText}>
          Novo por aqui?{' '}
          <Text style={styles.footerLink}>Criar Conta</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { height: '35%', justifyContent: 'center', paddingHorizontal: 30, borderBottomLeftRadius: 60 },
  title: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 42, color: '#FFF' },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 16, color: '#FFF', opacity: 0.8 },
  loginCard: { backgroundColor: '#FFF', marginHorizontal: 25, marginTop: -40, borderRadius: 30, padding: 25, elevation: 10 },
  passwordContainer: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: 15, top: 15, zIndex: 10 },
  forgotPass: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotText: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: Colors.primary },
  buttonWrapper: { alignItems: 'center' },
  loginButton: { backgroundColor: Colors.secondary, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  progressBar: { position: 'absolute', bottom: 0, left: 0, height: 4, backgroundColor: Colors.accent },
  buttonText: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#FFF' },
  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { fontFamily: 'Poppins_500Medium', color: '#666' },
  footerLink: { fontFamily: 'Poppins_700Bold', color: Colors.primary },
});