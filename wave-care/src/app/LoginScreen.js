import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_500Medium } from '@expo-google-fonts/poppins';


export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#C8D5D5" />

      {/* Header com logo */}
      <View style={styles.header}>
        <Text style={styles.logo}>Wave Care</Text>
      </View>

      {/* Card do formulário */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.cardWrapper}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Entrar</Text>

            {/* Campo E-mail */}
            <TextInput
              style={[styles.input, { outlineWidth: 0, outlineColor: 'transparent', outlineStyle: 'none' }]}
              placeholder="Insira seu e-mail"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Campo Senha */}
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0, outline: 'none' }]}
                placeholder="Insira sua senha"
                placeholderTextColor="#aaa"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!showSenha}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowSenha(!showSenha)}
              >
                <Ionicons
                  name={showSenha ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#aaa"
                />
              </TouchableOpacity>
            </View>

            {/* Botão Entrar */}
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => navigation.navigate('Home')} // ← adiciona o onPress
            >
              <Text style={styles.btnPrimaryText}>Entrar</Text>
            </TouchableOpacity>

            {/* Separador */}
            <View style={styles.separator}>
              <View style={styles.line} />
              <Text style={styles.separatorText}>Ou</Text>
              <View style={styles.line} />
            </View>

            {/* Botão Criar Conta */}
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => navigation?.navigate('Register')}
            >
              <Text style={styles.btnSecondaryText}>Cria Conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ESTILIZAÇÃO */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9FA8B0',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  logo: {
    fontSize: 65,
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '600',
    letterSpacing: 4,
  },
  cardWrapper: {
    flex: 2,
  },
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#1A7A78',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
    fontFamily: 'Poppins_500Medium',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Poppins_400Regular',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 50,
    marginBottom: 12,
    paddingRight: 12,
  },
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },
  btnPrimary: {
    backgroundColor: '#0D3D3C',
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.5,
    fontFamily: 'Poppins_500Medium',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  separatorText: {
    color: 'rgba(255,255,255,0.8)',
    marginHorizontal: 10,
    fontSize: 13,
  },
  btnSecondary: {
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: '#1A7A78',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.5,
    fontFamily: 'Poppins_500Medium',
  },
});