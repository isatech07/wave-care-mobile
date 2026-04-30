import { Stack } from 'expo-router';
import { UserProvider } from '../contexts/UserContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <Stack>
        <Stack.Screen name="index"           options={{ headerShown: false }} />
        <Stack.Screen name="seja-bem-vindo"  options={{ headerShown: false }} />
        <Stack.Screen name="login"           options={{ headerShown: false }} />
        <Stack.Screen name="cadastro"        options={{ headerShown: false }} />
        <Stack.Screen name="verao"           options={{ headerShown: false }} />
        <Stack.Screen name="outono"          options={{ headerShown: false }} />
        <Stack.Screen name="inverno"         options={{ headerShown: false }} />
        <Stack.Screen name="primavera"       options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)"          options={{ headerShown: false }} />
      </Stack>
    </UserProvider>
  );
}