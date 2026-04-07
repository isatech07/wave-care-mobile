import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AnimatedInput from '../components/AnimatedInput';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function CadastroScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(true);
  const loadProgress = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${loadProgress.value}%`,
  }));

  const handleCadastro = () => {
    setLoading(true);
    loadProgress.value = withTiming(100, { duration: 1500 });
    
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Login'); // Após cadastrar, leva pro login
    }, 1800);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, Colors.secondary]} style={StyleSheet.absoluteFill} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <Animated.View entering={FadeInUp.delay(200)} style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.logo}>Wave Care</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.springify().damping(12)} style={styles.card}>
            <Text style={styles.title}>Criar Conta</Text>

            <AnimatedInput placeholder="Nome Completo" />
            <AnimatedInput placeholder="E-mail" keyboardType="email-address" />
            
            <View style={{ position: 'relative' }}>
                <AnimatedInput placeholder="Sua Senha" secureTextEntry={showSenha} />
                <TouchableOpacity style={styles.eye} onPress={() => setShowSenha(!showSenha)}>
                    <Ionicons name={showSenha ? "eye-off" : "eye"} size={20} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
                style={styles.btnPrimary} 
                onPress={handleCadastro}
                disabled={loading}
            >
              <View style={styles.btnContent}>
                <Animated.View style={[styles.progressBar, progressStyle]} />
                <Text style={styles.btnText}>{loading ? 'Criando...' : 'Finalizar Cadastro'}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.footerLink} 
                onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.footerText}>Já tem uma conta? <Text style={{ fontWeight: 'bold', color: Colors.primary }}>Entrar</Text></Text>
            </TouchableOpacity>
          </Animated.View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 40 },
  header: { height: 180, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  backBtn: { position: 'absolute', left: 20, top: 50 },
  logo: { fontSize: 40, color: '#FFF', fontFamily: 'serif', fontWeight: 'bold' },
  card: { 
    backgroundColor: '#F7F5F0', 
    marginHorizontal: 20, 
    borderRadius: 35, 
    padding: 25, 
    minHeight: 450,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10
  },
  title: { fontSize: 26, fontWeight: '700', color: Colors.secondary, marginBottom: 20 },
  eye: { position: 'absolute', right: 15, top: 18, zIndex: 10 },
  btnPrimary: { 
    backgroundColor: Colors.secondary, 
    borderRadius: 18, 
    height: 60,
    marginTop: 20,
    overflow: 'hidden',
    justifyContent: 'center'
  },
  btnContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  progressBar: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    height: 4, 
    backgroundColor: Colors.accent 
  },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  footerLink: { marginTop: 25, alignItems: 'center' },
  footerText: { color: '#666', fontSize: 14 }
});