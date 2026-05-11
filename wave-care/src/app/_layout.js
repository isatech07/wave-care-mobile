import { Stack } from 'expo-router';
import {
  useFonts as usePoppinsFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';
import {
  useFonts as usePlayfairFonts,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_800ExtraBold,
} from '@expo-google-fonts/playfair-display';
import { UserProvider } from '../contexts/UserContext';
import { ProductProvider } from '../contexts/ProductContext';

export default function RootLayout() {
  const [poppinsLoaded] = usePoppinsFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });
  const [playfairLoaded] = usePlayfairFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_800ExtraBold,
  });

  if (!poppinsLoaded || !playfairLoaded) return null;

  return (
    <UserProvider>
      <ProductProvider>
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
      </ProductProvider>
    </UserProvider>
  );
}