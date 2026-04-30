import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { UserProvider } from './src/contexts/UserContext';
import home from './src/app/home';
import quiz from './src/app/quiz';
import loja from './src/app/loja';
import perfil from './src/app/perfil';
import estacoes from './src/app/estacoes';
import verao from './src/app/verao';
import outono from './src/app/outono';
import inverno from './src/app/inverno';
import primavera from './src/app/primavera';
import sejaBemVindo from './src/app/seja-bem-vindo';
import login from './src/app/login';
import cadastro from './src/app/cadastro';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            home: 'home-outline',
            quiz: 'help-circle-outline',
            loja: 'bag-outline',
            estacoes: 'leaf-outline',
            perfil: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="home" component={home} />
      <Tab.Screen name="quiz" component={quiz} />
      <Tab.Screen name="loja" component={loja} />
      <Tab.Screen name="estacoes" component={estacoes} />
      <Tab.Screen name="perfil" component={perfil} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <UserProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="home">
            <Stack.Screen name="home" component={tabs} />
            <Stack.Screen name="seja-bem-vindo" component={sejaBemVindo} />
            <Stack.Screen name="estacoes" component={estacoes} />
            <Stack.Screen name="verao" component={verao} />
            <Stack.Screen name="outono" component={outono} />
            <Stack.Screen name="inverno" component={inverno} />
            <Stack.Screen name="primavera" component={primavera} />
            <Stack.Screen name="login" component={login} />
            <Stack.Screen name="cadastro" component={cadastro} />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </UserProvider>
  );
}