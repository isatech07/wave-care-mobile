import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { useLocalSearchParams, useRouter } from 'expo-router';
import EstacaoCard from '../../components/estacao-card';
import VeraoScreen from '../verao';
import OutonoScreen from '../outono';
import InvernoScreen from '../inverno';
import PrimaveraScreen from '../primavera';

export default function Estacoes() {
  const router = useRouter();
  const { season } = useLocalSearchParams();
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) return null;

  if (season === 'verao') return <VeraoScreen />;
  if (season === 'outono') return <OutonoScreen />;
  if (season === 'inverno') return <InvernoScreen />;
  if (season === 'primavera') return <PrimaveraScreen />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Wave Care</Text>
      <Text style={styles.subtitle}>Estações</Text>
      <Text style={styles.text}>Escolha uma estação para ver os cuidados indicados.</Text>

      <View style={styles.list}>
        <EstacaoCard label="Verão" onPress={() => router.push({ pathname: '/(tabs)/estacoes', params: { season: 'verao' } })} />
        <EstacaoCard label="Outono" onPress={() => router.push({ pathname: '/(tabs)/estacoes', params: { season: 'outono' } })} />
        <EstacaoCard label="Inverno" onPress={() => router.push({ pathname: '/(tabs)/estacoes', params: { season: 'inverno' } })} />
        <EstacaoCard label="Primavera" onPress={() => router.push({ pathname: '/(tabs)/estacoes', params: { season: 'primavera' } })} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFBFA' },
  content: { padding: 20 },
  title: { fontFamily: 'Poppins_600SemiBold', fontSize: 28, color: '#2D5A45' },
  subtitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, color: '#1c1c1e', marginTop: 8 },
  text: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#666', marginTop: 8 },
  list: { marginTop: 20 },
});
