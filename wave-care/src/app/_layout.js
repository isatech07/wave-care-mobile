import { Stack } from 'expo-router';
import { UserProvider } from '../contexts/UserContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack>
        <Stack.Screen name="index"/>
        <Stack.Screen name="seja-bem-vindo" />
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="verao" />
        <Stack.Screen name="outono" />
        <Stack.Screen name="inverno" />
        <Stack.Screen name="primavera" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </UserProvider>
  );
}