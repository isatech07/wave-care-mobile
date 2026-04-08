import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; 

import WelcomeScreen from './src/app/WelcomeScreen';
import CadastroScreen from './src/app/CadastroScreen';
import LoginScreen from './src/app/LoginScreen';
import HomeScreen from './src/app/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Welcome" 
          screenOptions={{ 
            headerShown: false,
            animation: 'fade_from_bottom' // Transição elegante e suave
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          
          <Stack.Screen name="Cadastro" component={CadastroScreen} />
          
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}