import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProvider } from './src/contexts/UserContext';
import { View, StyleSheet } from 'react-native';
import { navigationRef } from './src/navigationRef';

import WelcomeScreen from './src/app/WelcomeScreen';
import CadastroScreen from './src/app/CadastroScreen';
import LoginScreen from './src/app/LoginScreen';
import HomeScreen from './src/app/HomeScreen';
import QuizScreen from './src/app/QuizScreen';
import PerfilScreen from './src/app/PerfilScreen';
import SummerScreen from './src/app/SummerScreen';
import LojaScreen from './src/app/LojaScreen';
import MenuMobile from './src/components/MenuMobile';

const Stack = createNativeStackNavigator();

// Componente que envolve as telas com o menu
function TelasComMenu() {   // ← remove o { navigation }
  const [activeTab, setActiveTab] = useState('home');

  return (
    <View style={styles.container}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Loja" component={LojaScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen name="Summer" component={SummerScreen} />
      </Stack.Navigator>

      <MenuMobile
        activeTab={activeTab}
        onTabChange={setActiveTab}
        // ← remove navigation={navigation}
      />
    </View>
  );
}
export default function App() {
  return (
    <UserProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer ref={navigationRef}>  {/* ← adiciona ref={navigationRef} */}
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Main" component={TelasComMenu} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});