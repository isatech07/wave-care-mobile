import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProvider } from './src/contexts/UserContext';

import WelcomeScreen from './src/app/WelcomeScreen';
import CadastroScreen from './src/app/CadastroScreen';
import LoginScreen from './src/app/LoginScreen';
import HomeScreen from './src/app/HomeScreen';
import QuizScreen from './src/app/QuizScreen';
import PerfilScreen from './src/app/PerfilScreen';
import LojaScreen from './src/app/LojaScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
              animation: 'fade_from_bottom',
            }}
          >
            <Stack.Screen name="Welcome"  component={WelcomeScreen} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} />
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Home"     component={HomeScreen} />
            <Stack.Screen name="Quiz"     component={QuizScreen} />
            <Stack.Screen name="Loja"     component={LojaScreen} />
            <Stack.Screen name="Perfil"   component={PerfilScreen} />
            
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </UserProvider>
  );
}