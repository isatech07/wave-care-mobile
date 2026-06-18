import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, FlatList,
  TouchableOpacity, StyleSheet, Dimensions,
  StatusBar, SafeAreaView, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { useProducts } from '../../contexts/ProductContext';
import imageMap from '../../services/imageMap';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;
const GRID_CARD_WIDTH = (SCREEN_WIDTH - 20 * 2 - 14) / 2;

const COLORS = {
  background: '#f7f5f2',
  green: '#023c33',
  greenLight: '#045c4f',
  greenMuted: '#0a7a6a',
  gold: '#c9b99a',
  goldDark: '#b5a382',
  goldLight: '#f0e6d3',
  goldAccent: '#d4c4a0',
  white: '#ffffff',
  offWhite: '#faf8f5',
  dark: '#1a1a1a',
  gray: '#8a8a8a',
  grayLight: '#b0b0b0',
  lightGray: '#e8e5e0',
  lighterGray: '#f0ede8',
  red: '#c0392b',
  shadow: 'rgba(2, 60, 51, 0.08)',
  shadowDark: 'rgba(0, 0, 0, 0.12)',
};

const ESTACOES = [
  {
    key: 'verao',
    label: 'Verão',
    sub: 'Proteção & Hidratação',
    icon: 'sunny',
    image: require('../../../assets/products/verao-produtos/propaganda-verao.jpg'),
  },
  {
    key: 'outono',
    label: 'Outono',
    sub: 'Fortalecimento Anti-queda',
    icon: 'leaf',
    image: require('../../../assets/products/outono-produtos/propaganda-outono.png'),
  },
  {
    key: 'inverno',
    label: 'Inverno',
    sub: 'Nutrição Profunda',
    icon: 'snow',
    image: require('../../../assets/products/inverno-produtos/propaganda-inverno.png'),
  },
  {
    key: 'primavera',
    label: 'Primavera',
    sub: 'Relaxamento Capilar',
    icon: 'flower',
    image: require('../../../assets/products/primavera-produtos/propaganda-primavera-2.png'),
  },
];

const BOLETIM = { texto: 'Maresia moderada · UV alto', recomendacao: 'Indicado: leave-in com filtro solar' };

const BADGE_COLORS = {
  'Novo':        { bg: '#e8f5e9', text: '#2e7d32' },
  'Popular':     { bg: '#fff3e0', text: '#e65100' },
  'Verão':       { bg: '#fff8e1', text: '#f57f17' },
  'Premium':     { bg: COLORS.goldLight, text: COLORS.green },
  'Kit':         { bg: '#e3f2fd', text: '#1565c0' },
  'Oferta':      { bg: '#fce4ec', text: '#c62828' },
  'Best Seller': { bg: COLORS.goldLight, text: COLORS.goldDark },
  'Exclusivo':   { bg: '#f3e5f5', text: '#6a1b9a' },
  'Luxo':        { bg: '#212121', text: COLORS.gold },
};

function saudacaoPorHorario() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

function EstacaoCard({ item, onPress, index }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 90).duration(500).springify().damping(16)} style={styles.estacaoCard}>
      <TouchableOpacity
        style={styles.estacaoCard}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image source={item.image} style={styles.estacaoImg} contentFit="cover" transition={250} />
        <LinearGradient
          colors={['transparent', 'rgba(2,42,36,0.35)', 'rgba(2,42,36,0.92)']}
          locations={[0, 0.45, 1]}
          style={styles.estacaoGradient}
        >
          <View style={styles.estacaoIconBadge}>
            <Ionicons name={item.icon} size={13} color={COLORS.gold} />
          </View>
          <Text style={styles.estacaoLabel}>{item.label}</Text>
          <Text style={styles.estacaoSub}>{item.sub}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ShowcaseCard({ item, onPress, index }) {
  const imageSource = imageMap[item.image] || item.imageSource;
  const badgeStyle = item.badge && BADGE_COLORS[item.badge] ? BADGE_COLORS[item.badge] : null;
  const discount = (item.precoOriginal ?? 0) > 0
    ? Math.round((1 - Number(item.price ?? 0) / Number(item.precoOriginal ?? 0)) * 100)
    : 0;

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(500).springify().damping(16)} style={styles.showcaseCard}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <View style={styles.showcaseImageContainer}>
          <Image source={imageSource} style={styles.showcaseImage} contentFit="cover" transition={250} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.03)']} style={styles.showcaseImageOverlay} />
          {badgeStyle && (
            <View style={[styles.showcaseBadge, { backgroundColor: badgeStyle.bg }]}>
              <Text style={[styles.showcaseBadgeText, { color: badgeStyle.text }]}>{item.badge}</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={styles.showcaseDiscount}>
              <Text style={styles.showcaseDiscountText}>-{discount}%</Text>
            </View>
          )}
        </View>
        <View style={styles.showcaseInfo}>
          <Text style={styles.showcaseCategory}>{item.category}</Text>
          <Text style={styles.showcaseName} numberOfLines={2}>{item.name ?? item.nome}</Text>
          {item.rating != null && (
            <View style={styles.showcaseRatingRow}>
              <View style={styles.showcaseStars}>
                {[1, 2, 3, 4, 5].map(s => (
                  <Ionicons
                    key={s}
                    name={s <= Math.floor(item.rating) ? 'star' : (s - 0.5 <= item.rating ? 'star-half' : 'star-outline')}
                    size={9}
                    color={COLORS.gold}
                  />
                ))}
              </View>
              {item.reviews != null && <Text style={styles.showcaseReviewText}>({item.reviews})</Text>}
            </View>
          )}
          <View style={styles.showcasePriceRow}>
            <Text style={styles.showcasePrice}>
              R$ {Number(item.price ?? 0).toFixed(2).replace('.', ',')}
            </Text>
            {(item.precoOriginal ?? 0) > 0 && (
              <Text style={styles.showcaseOriginalPrice}>
                R$ {Number(item.precoOriginal ?? 0).toFixed(2).replace('.', ',')}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Home() {
  const router = useRouter();
  const { products, loading } = useProducts();
  const destaques = useMemo(() => products.slice(0, 4), [products]);
  const saudacao = useMemo(() => saudacaoPorHorario(), []);

  if (loading) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
          <View>
            <Text style={styles.headerGreeting}>{saudacao}</Text>
            <Text style={styles.headerTitle}>Wave Care</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.green} />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.heroWrap}>
          <Animated.View entering={FadeIn.duration(700)} style={styles.hero}>
            <LinearGradient
              colors={['#012a24', COLORS.green, '#045c4f', '#067a6a']}
              locations={[0, 0.3, 0.7, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroPattern}>
                <View style={styles.heroCircle1} />
                <View style={styles.heroCircle2} />
              </View>

              <Animated.View entering={FadeInDown.delay(150).duration(550)} style={styles.heroBadgeRow}>
                <View style={styles.heroBadge}>
                  <View style={styles.heroBadgeDot} />
                  <Text style={styles.heroBadgeText}>{BOLETIM.texto}</Text>
                </View>
              </Animated.View>

              <Animated.Text entering={FadeInDown.delay(300).duration(650)} style={styles.heroTitle}>
                Cabelo que{'\n'}enfrenta a{'\n'}maresia
              </Animated.Text>
              <Animated.Text entering={FadeInDown.delay(450).duration(550)} style={styles.heroSubtitle}>
                {BOLETIM.recomendacao} — fórmulas pensadas{'\n'}para o litoral norte de São Paulo
              </Animated.Text>

              <Animated.View entering={FadeInDown.delay(600).duration(500)}>
                <TouchableOpacity
                  style={styles.heroCta}
                  activeOpacity={0.85}
                  onPress={() => router.push('/(tabs)/quiz')}
                >
                  <Text style={styles.heroCtaText}>Descobrir meu kit ideal</Text>
                  <Ionicons name="arrow-forward" size={15} color={COLORS.green} />
                </TouchableOpacity>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.eyebrow}>Calendário capilar</Text>
            <Text style={styles.sectionTitle}>Sua estação agora</Text>
          </View>
          <FlatList
            data={ESTACOES}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            keyExtractor={(item) => item.key}
            renderItem={({ item, index }) => (
              <EstacaoCard
                item={item}
                index={index}
                onPress={() => router.push({ pathname: '/(tabs)/estacoes', params: { season: item.key } })}
              />
            )}
          />
        </View>

        <View style={styles.dividerWrap}>
          <View style={styles.dividerLine} />
        </View>

        <View style={[styles.section, { marginTop: 30 }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.eyebrow}>Selecionados pra você</Text>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Mais amados</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/loja')} activeOpacity={0.7} style={styles.verTodosBtn}>
                <Text style={styles.verTodosText}>Ver todos</Text>
                <Ionicons name="arrow-forward" size={12} color={COLORS.greenMuted} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.showcaseGrid}>
            {destaques.map((p, index) => (
              <ShowcaseCard
                key={p.id}
                item={p}
                index={index}
                onPress={() => router.push('/(tabs)/loja')}
              />
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
  },
  headerGreeting: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.gray,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: COLORS.green,
    letterSpacing: -0.3,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  heroWrap: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  hero: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: COLORS.green,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  heroGradient: {
    paddingTop: 26,
    paddingBottom: 28,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  heroPattern: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroCircle1: { position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(201, 185, 154, 0.06)' },
  heroCircle2: { position: 'absolute', bottom: -30, left: -50, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255, 255, 255, 0.03)' },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201,185,154,0.35)',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },
  heroBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.gold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: COLORS.white,
    lineHeight: 38,
    marginBottom: 14,
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 19,
    marginBottom: 24,
    letterSpacing: 0.1,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.gold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 26,
  },
  heroCtaText: {
    fontFamily: 'Poppins_700Bold',
    color: COLORS.green,
    fontSize: 12.5,
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: 26,
  },
  sectionHeaderRow: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: COLORS.goldDark,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 19,
    color: COLORS.dark,
    letterSpacing: -0.3,
  },
  verTodosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verTodosText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: COLORS.greenMuted,
  },
  estacaoCard: {
    width: CARD_WIDTH,
    height: 175,
    marginRight: 14,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },
  estacaoImg: {
    width: '100%',
    height: '100%',
  },
  estacaoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '68%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  estacaoIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  estacaoLabel: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: COLORS.white,
    fontSize: 19,
    letterSpacing: -0.3,
  },
  estacaoSub: {
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11.5,
    marginTop: 2,
  },
  dividerWrap: {
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: 'center',
  },
  dividerLine: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  showcaseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 14,
  },
  showcaseCard: {
    width: GRID_CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  showcaseImageContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  showcaseImage: {
    width: '100%',
    height: GRID_CARD_WIDTH,
    backgroundColor: COLORS.lighterGray,
  },
  showcaseImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 36,
  },
  showcaseBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 9,
  },
  showcaseBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  showcaseDiscount: {
    position: 'absolute',
    bottom: 9,
    left: 10,
    backgroundColor: COLORS.red,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },
  showcaseDiscountText: {
    fontFamily: 'Poppins_700Bold',
    color: COLORS.white,
    fontSize: 9,
  },
  showcaseInfo: {
    padding: 13,
    gap: 2,
  },
  showcaseCategory: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 8.5,
    color: COLORS.goldDark,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  showcaseName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12.5,
    color: COLORS.dark,
    lineHeight: 17,
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  showcaseRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 7,
  },
  showcaseStars: {
    flexDirection: 'row',
    gap: 1,
  },
  showcaseReviewText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    color: COLORS.grayLight,
  },
  showcasePriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  showcasePrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: COLORS.green,
    letterSpacing: -0.2,
  },
  showcaseOriginalPrice: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10.5,
    color: COLORS.grayLight,
    textDecorationLine: 'line-through',
  },
});