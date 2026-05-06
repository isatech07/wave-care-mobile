import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  useFonts,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_800ExtraBold,
} from '@expo-google-fonts/playfair-display';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

const { width } = Dimensions.get('window');

const C = {
  bg: '#FDF5F8',
  fg: '#2D1220',
  accent: '#9D1A52',
  accentHover: '#821545',
  accentLight: '#F3D6E4',
  muted: '#8C5A6E',
  cardBg: '#FFFFFF',

  bgCard: '#FFFFFF',
  bgCardAlt: '#FAEAF1',
  bgCardDark: '#F6DFE9',
  accentSoft: 'rgba(157,26,82,0.10)',
  accentBorder: 'rgba(157,26,82,0.24)',
  mutedLight: '#B07A91',
  border: 'rgba(45,18,32,0.12)',
  borderMed: 'rgba(45,18,32,0.20)',
  gold: '#C95D8B',
  goldSoft: 'rgba(201,93,139,0.14)',
  cream: '#FDF5F8',
  shadow: '#2D1220',
};

const IMAGES = {
  kitCompleto: require('../../assets/products/primavera-produtos/Bloom-kit-mobile.png'),
  condicionador: require('../../assets/products/primavera-produtos/primavera-condicionador.png'),
  creme: require('../../assets/products/primavera-produtos/primavera-creme.png'),
  gelatina: require('../../assets/products/primavera-produtos/primavera-gelatina.png'),
  kit1: require('../../assets/products/primavera-produtos/primavera-kit-1.png'),
  kit2: require('../../assets/products/primavera-produtos/primavera-kit-2.png'),
  kit3: require('../../assets/products/primavera-produtos/primavera-kit-3.png'),
  kit4: require('../../assets/products/primavera-produtos/primavera-kit-4.png'),
  kit5: require('../../assets/products/primavera-produtos/primavera-kit-5.png'),
  mascara: require('../../assets/products/primavera-produtos/primavera-mascara.png'),
  oleo: require('../../assets/products/primavera-produtos/primavera-oleo.png'),
  shampoo: require('../../assets/products/primavera-produtos/primavera-shampoo.png'),
  propaganda: require('../../assets/products/primavera-produtos/propaganda-primavera.png'),
};

function useFadeSlide(delay = 0, fromY = 24) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(fromY)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 540, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 540, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity: fade, transform: [{ translateY: slide }] };
}

function Circle({ size, color, style }) {
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color, position: 'absolute' },
        style,
      ]}
    />
  );
}

function Badge({ iconName, label, dark, style }) {
  return (
    <View style={[styles.badge, dark && styles.badgeDark, style]}>
      {iconName ? (
        <Ionicons name={iconName} size={12} color={dark ? C.bg : C.accent} style={{ marginRight: 5 }} />
      ) : null}
      <Text style={[styles.badgeText, dark && styles.badgeTextDark]}>{label}</Text>
    </View>
  );
}

function Stat({ iconName, value, label, delay, dark }) {
  const anim = useFadeSlide(delay, 14);
  return (
    <Animated.View style={[styles.statItem, anim]}>
      <Ionicons name={iconName} size={20} color={dark ? C.bg : C.accent} />
      <Text style={[styles.statValue, dark && { color: C.bg }]}>{value}</Text>
      <Text style={[styles.statLabel, dark && { color: C.mutedLight }]}>{label}</Text>
    </Animated.View>
  );
}

function BenefitChip({ iconName, text }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={iconName} size={14} color={C.accent} />
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

function ProductCard({ name, desc, price, oldPrice, stars, reviews, highlight, image, delay }) {
  const anim = useFadeSlide(delay, 20);
  const [fav, setFav] = useState(false);

  return (
    <Animated.View style={[styles.productCard, highlight && styles.productCardHighlight, anim]}>
      <View style={[styles.productThumb, highlight && styles.productThumbHighlight]}>
        {image ? (
          <Image source={image} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image-outline" size={44} color={C.mutedLight} />
          </View>
        )}

        <TouchableOpacity style={styles.favBtn} onPress={() => setFav(!fav)} activeOpacity={0.8}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={18} color={fav ? '#E53E3E' : C.muted} />
        </TouchableOpacity>

        {highlight && (
          <View style={styles.featuredBadge}>
            <Ionicons name="trophy" size={10} color={C.bg} style={{ marginRight: 3 }} />
            <Text style={styles.featuredBadgeText}>DESTAQUE</Text>
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <View style={styles.starsRow}>
          <Ionicons name="star" size={12} color={C.gold} />
          <Text style={styles.starsText}>{stars}  ({reviews} avaliacoes)</Text>
        </View>
        <Text style={styles.productName}>{name}</Text>
        <Text style={styles.productDesc}>{desc}</Text>

        <View style={styles.productFooter}>
          <View>
            {oldPrice ? <Text style={styles.oldPrice}>{oldPrice}</Text> : null}
            <Text style={styles.productPrice}>{price}</Text>
          </View>
          <View style={styles.productActions}>
            <TouchableOpacity style={styles.cartBtn} activeOpacity={0.8}>
              <Ionicons name="cart-outline" size={18} color={C.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyBtn} activeOpacity={0.8}>
              <Text style={styles.buyBtnText}>Comprar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function ProductCardSmall({ name, price, stars, reviews, image, delay, type }) {
  const anim = useFadeSlide(delay, 20);
  const [fav, setFav] = useState(false);

  return (
    <Animated.View style={[styles.productCardSmall, anim]}>
      <View style={styles.productThumbSmall}>
        {image ? (
          <Image source={image} style={styles.productImageSmall} resizeMode="cover" />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={C.mutedLight} />
          </View>
        )}

        <TouchableOpacity style={styles.favBtn} onPress={() => setFav(!fav)} activeOpacity={0.8}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={15} color={fav ? '#E53E3E' : C.muted} />
        </TouchableOpacity>
      </View>

      <View style={styles.productInfoSmall}>
        <View style={styles.starsRow}>
          <Ionicons name="star" size={11} color={C.gold} />
          <Text style={styles.starsText}>{stars} ({reviews})</Text>
        </View>
        <Text style={styles.productNameSmall}>{name}</Text>
        <Text style={styles.productPriceSmall}>{price}</Text>

        <View style={styles.smallCardActions}>
          <TouchableOpacity style={styles.smallCartBtn} activeOpacity={0.8}>
            <Ionicons name="cart-outline" size={16} color={C.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyBtnFull} activeOpacity={0.8}>
            <Text style={styles.buyBtnText}>Comprar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

function HighlightCard({ iconName, title, text, delay }) {
  const anim = useFadeSlide(delay, 18);
  return (
    <Animated.View style={[styles.highlightCard, anim]}>
      <View style={styles.highlightIconBox}>
        <Ionicons name={iconName} size={20} color={C.accent} />
      </View>
      <Text style={styles.highlightTitle}>{title}</Text>
      <Text style={styles.highlightText}>{text}</Text>
    </Animated.View>
  );
}

function Divider({ label }) {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.dividerLine} />
      {label ? <Text style={styles.dividerLabel}>{label}</Text> : null}
      <View style={styles.dividerLine} />
    </View>
  );
}

export default function SpringScreen() {
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [benefitIndex, setBenefitIndex] = useState(0);
  const springBenefits = useMemo(
    () => [
      { iconName: 'flower-outline', text: 'Leveza floral' },
      { iconName: 'water-outline', text: 'Hidratacao renovadora' },
      { iconName: 'sparkles-outline', text: 'Brilho de renascimento' },
      { iconName: 'leaf-outline', text: 'Toque fresco e natural' },
      { iconName: 'sunny-outline', text: 'Protecao para dias claros' },
    ],
    []
  );

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_800ExtraBold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const badgeAnim = useFadeSlide(60, 0);
  const titleAnim = useFadeSlide(180, 36);
  const subAnim = useFadeSlide(340, 20);
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBenefitIndex((prev) => (prev + 1) % springBenefits.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [springBenefits.length]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Circle size={280} color="rgba(157,26,82,0.14)" style={{ top: -80, right: -80 }} />
          <Circle size={160} color="rgba(130,21,69,0.11)" style={{ top: 60, right: 20 }} />
          <Circle size={200} color="rgba(157,26,82,0.08)" style={{ bottom: -50, left: -70 }} />

          <Animated.View style={badgeAnim}>
            <Badge iconName="flower" label="NOVA COLEÇÃO DE PRIMAVERA 2026" />
          </Animated.View>

          <Animated.Text style={[styles.heroTitle, titleAnim]}>
            Renove seus{'\n'}fios na energia{'\n'}da primavera
          </Animated.Text>

          <Animated.Text style={[styles.heroSub, subAnim]}>
            Formulas leves para a estacao das flores,
            com frescor, suavidade e definicao natural em cada finalizacao.
          </Animated.Text>

          <View style={styles.heroDivider} />

          <View style={styles.statsRow}>
            <Stat iconName="leaf" value="12+" label="PRODUTOS" delay={480} />
            <View style={styles.statDivider} />
            <Stat iconName="thumbs-up" value="98%" label="APROVACAO" delay={620} />
            <View style={styles.statDivider} />
            <Stat iconName="people" value="5K+" label="CLIENTES" delay={760} />
          </View>
        </View>

        <View style={styles.section}>
          <Badge iconName="flower" label="POR QUE BLOOM?" />
          <View style={styles.autoCarouselWrap}>
            <BenefitChip
              iconName={springBenefits[benefitIndex].iconName}
              text={springBenefits[benefitIndex].text}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Badge iconName="trophy" label="MAIS VENDIDO" />
          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
            Winter Frost{'\n'}Spring Bloom
          </Text>
          <Text style={styles.sectionSub}>
            O kit mais completo da estacao para renovacao e maciez dos seus fios
          </Text>
          <ProductCard
            name="Spring Total Bloom"
            desc="Kit completo com shampoo, condicionador, mascara e oleo leve para brilho primaveril"
            price="R$ 229,90"
            oldPrice="R$ 249,90"
            stars="4.8"
            reviews="250"
            highlight
            image={IMAGES.kitCompleto}
            delay={200}
          />
        </View>

        <View style={styles.section}>
          <Badge iconName="grid" label="LINHA COMPLETA" />
          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
            Linha Winter Frost{'\n'}& Kits de Primavera
          </Text>
          <Divider />

          <View style={styles.filterRow}>
            {[
              { key: 'todos', label: 'Todos' },
              { key: 'produto', label: 'Produtos' },
              { key: 'kit', label: 'Kits' },
            ].map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
                onPress={() => setActiveFilter(f.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.productsGrid}>
            {[
              { name: 'Bloom Conditioner',      desc: 'Maciez e brilho com fragrância floral suave.',    price: 'R$ 45,80',  stars: '4.7', reviews: '162', image: IMAGES.condicionador, delay: 150, type: 'produto' },
              { name: 'Bloom Repair Mask',      desc: 'Revitaliza fios ressecados com nutrição floral.', price: 'R$ 56,90',  stars: '4.5', reviews: '134', image: IMAGES.mascara,       delay: 200, type: 'produto' },
              { name: 'Bloom Leave-In',  desc: 'Véu leve floral que controla o frizz.',           price: 'R$ 49,90',  stars: '4.7', reviews: '211', image: IMAGES.creme,         delay: 250, type: 'produto' },
              { name: 'Bloom Definition Jelly', desc: 'Definição leve com perfume floral duradouro.',    price: 'R$ 48,90',  stars: '4.8', reviews: '243', image: IMAGES.gelatina,      delay: 300, type: 'produto' },
              { name: 'Bloom Hair Oil',         desc: 'Óleo floral ultraleve que sela e ilumina.',        price: 'R$ 41,90',  stars: '4.3', reviews: '107', image: IMAGES.oleo,          delay: 350, type: 'produto' },
              { name: 'Spring Essential Kit',   desc: 'Limpeza, condicionamento e tratamento floral.',   price: 'R$ 129,90', stars: '4.8', reviews: '250', image: IMAGES.kit1,          delay: 400, type: 'kit' },
              { name: 'Spring Full Bloom',      desc: 'Proteção botânica e hidratação profunda.',        price: 'R$ 189,90', stars: '4.8', reviews: '250', image: IMAGES.kit2,          delay: 450, type: 'kit' },
              { name: 'Spring Definition Duo',  desc: 'Definição duradoura e controle do frizz.',        price: 'R$ 89,90',  stars: '4.8', reviews: '250', image: IMAGES.kit3,          delay: 500, type: 'kit' },
              { name: 'Spring Finishing Trio',  desc: 'Finalização floral com brilho na primavera.',     price: 'R$ 109,90', stars: '4.8', reviews: '250', image: IMAGES.kit4,          delay: 550, type: 'kit' },
              { name: 'Spring Styling Duo',     desc: 'Modela e nutre com fragrância floral.',           price: 'R$ 69,90',  stars: '4.8', reviews: '250', image: IMAGES.kit5,          delay: 600, type: 'kit' },
              { name: 'Spring Total Bloom',     desc: 'Experiência completa de florescimento capilar.',  price: 'R$ 249,90', stars: '4.9', reviews: '300', image: IMAGES.kitCompleto,   delay: 650, type: 'kit' },
              { name: 'Bloom Shampoo',          desc: 'Limpeza suave com extrato de flores.',            price: 'R$ 42,90',  stars: '4.8', reviews: '198', image: IMAGES.shampoo,      delay: 100, type: 'produto' },
            ]
              .filter((p) => activeFilter === 'todos' || p.type === activeFilter)
              .map((p) => (
                <ProductCardSmall key={p.name} {...p} />
              ))}
          </View>
        </View>

        <View style={styles.section}>
          <Badge iconName="bulb" label="DIFERENCIAIS" />
          <View style={[styles.highlightsRow, { marginTop: 14 }]}>
            <HighlightCard iconName="flower" title="Leve" text="Texturas suaves para o dia a dia" delay={200} />
            <HighlightCard iconName="flask" title="Ativo" text="Complexo botanico de renovacao" delay={350} />
            <HighlightCard iconName="refresh" title="Fresco" text="Sensacao limpa e luminosa" delay={500} />
          </View>
        </View>

        <View style={styles.ctaCard}>
          <Circle size={220} color="rgba(157,26,82,0.16)" style={{ top: -60, right: -60 }} />
          <Circle size={130} color="rgba(130,21,69,0.11)" style={{ bottom: -40, left: -40 }} />

          <Badge iconName="gift" label="OFERTA ESPECIAL" />

          <Text style={styles.ctaCardTitle}>Monte seu{'\n'}kit primavera</Text>
          <Text style={styles.ctaCardSub}>
            Combine produtos e ganhe ate 20% de desconto na sua linha Winter Frost personalizada.
          </Text>

          <TouchableOpacity
            style={styles.ctaBtnLight}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/loja')}
          >
            <Text style={styles.ctaBtnLightText}>Montar kit</Text>
            <View style={styles.ctaArrowDark}>
              <Ionicons name="arrow-forward" size={16} color={C.bg} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
      <TouchableOpacity
        style={styles.floatingCartBtn}
        activeOpacity={0.85}
        onPress={() => router.push('/(tabs)/loja')}
      >
        <Ionicons name="cart-outline" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 20,
  },

  heroCard: {
    backgroundColor: C.bgCardDark,
    borderRadius: 28,
    padding: 28,
    overflow: 'hidden',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  heroTitle: {
    fontFamily: 'PlayfairDisplay_800ExtraBold',
    color: C.accent,
    fontSize: 46,
    lineHeight: 54,
    letterSpacing: -0.5,
    marginBottom: 14,
    marginTop: 6,
  },
  heroSub: {
    fontFamily: 'Poppins_400Regular',
    color: C.muted,
    fontSize: 14,
    lineHeight: 23,
    marginBottom: 26,
  },
  heroDivider: {
    height: 1,
    backgroundColor: C.accent,
    marginBottom: 22,
  },

  section: {
    gap: 0,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: C.accent,
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sectionSub: {
    fontFamily: 'Poppins_400Regular',
    color: C.muted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: C.accentSoft,
    borderWidth: 1,
    borderColor: C.accentBorder,
    borderRadius: 100,
    paddingHorizontal: 13,
    paddingVertical: 5,
  },
  badgeDark: {
    backgroundColor: 'rgba(253,245,248,0.10)',
    borderColor: 'rgba(253,245,248,0.20)',
    marginBottom: 18,
  },
  badgeText: {
    fontFamily: 'Poppins_600SemiBold',
    color: C.accent,
    fontSize: 10,
    letterSpacing: 1.3,
  },
  badgeTextDark: {
    color: C.bg,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: 'Poppins_700Bold',
    color: C.fg,
    fontSize: 22,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontFamily: 'Poppins_600SemiBold',
    color: C.muted,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: C.border,
  },

  ctaBtnLight: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: C.bg,
    borderRadius: 100,
    paddingVertical: 12,
    paddingLeft: 22,
    paddingRight: 7,
    gap: 10,
  },
  ctaBtnLightText: {
    fontFamily: 'Poppins_600SemiBold',
    color: C.accent,
    fontSize: 14,
  },
  ctaArrowDark: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: C.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },

  ctaCard: {
    backgroundColor: C.bgCardDark,
    borderRadius: 28,
    padding: 28,
    overflow: 'hidden',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  ctaCardTitle: {
    fontFamily: 'PlayfairDisplay_800ExtraBold',
    color: C.accent,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.4,
    marginBottom: 10,
    marginTop: 4,
  },
  ctaCardSub: {
    fontFamily: 'Poppins_400Regular',
    color: C.muted,
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 24,
  },

  autoCarouselWrap: {
    marginTop: 12,
    minHeight: 42,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bgCardAlt,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 7,
  },
  chipText: {
    fontFamily: 'Poppins_500Medium',
    color: C.fg,
    fontSize: 12,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerLabel: {
    fontFamily: 'Poppins_500Medium',
    color: C.mutedLight,
    fontSize: 10,
    letterSpacing: 1,
  },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: C.bgCard,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  filterChipActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
  },
  filterChipText: {
    fontFamily: 'Poppins_600SemiBold',
    color: C.muted,
    fontSize: 13,
  },
  filterChipTextActive: {
    color: C.bg,
  },

  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },

  productCard: {
    backgroundColor: C.bgCard,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  productCardHighlight: {
    borderColor: C.accentBorder,
    borderWidth: 1.5,
  },
  productThumb: {
    height: 220,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productThumbHighlight: {
    height: 280,
    backgroundColor: 'transparent',
  },
  productImage: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  productImagePlaceholder: {
    alignItems: 'center',
    gap: 6,
    zIndex: 1,
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(253,245,248,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    borderWidth: 1,
    borderColor: C.border,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.accent,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 2,
  },
  featuredBadgeText: {
    fontFamily: 'Poppins_700Bold',
    color: C.bg,
    fontSize: 9,
    letterSpacing: 1.1,
  },
  productInfo: {
    padding: 18,
    gap: 6,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsText: {
    fontFamily: 'Poppins_500Medium',
    color: C.gold,
    fontSize: 12,
  },
  productName: {
    fontFamily: 'Poppins_600SemiBold',
    color: C.fg,
    fontSize: 16,
    lineHeight: 23,
  },
  productDesc: {
    fontFamily: 'Poppins_400Regular',
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  oldPrice: {
    fontFamily: 'Poppins_400Regular',
    color: C.mutedLight,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  productPrice: {
    fontFamily: 'Poppins_700Bold',
    color: C.fg,
    fontSize: 20,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: C.accentBorder,
    backgroundColor: C.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtn: {
    backgroundColor: C.accent,
    borderRadius: 100,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buyBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    color: C.bg,
    fontSize: 13,
  },

  productCardSmall: {
    backgroundColor: C.bgCard,
    borderRadius: 18,
    overflow: 'hidden',
    width: (width - 46) / 2,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  productThumbSmall: {
    height: 170,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImageSmall: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  productInfoSmall: {
    padding: 14,
    gap: 4,
  },
  productNameSmall: {
    fontFamily: 'Poppins_600SemiBold',
    color: C.fg,
    fontSize: 13,
    lineHeight: 18,
  },
  productPriceSmall: {
    fontFamily: 'Poppins_700Bold',
    color: C.fg,
    fontSize: 16,
  },
  smallCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  smallCartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.accentBorder,
    backgroundColor: C.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtnFull: {
    flex: 1,
    backgroundColor: C.accent,
    borderRadius: 100,
    paddingVertical: 9,
    alignItems: 'center',
  },

  highlightsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderRadius: 18,
    padding: 16,
    gap: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  highlightIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightTitle: {
    fontFamily: 'Poppins_600SemiBold',
    color: C.fg,
    fontSize: 13,
    textAlign: 'center',
  },
  highlightText: {
    fontFamily: 'Poppins_400Regular',
    color: C.muted,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
  },

  floatingCartBtn: {
    position: 'absolute',
    right: 22,
    bottom: 28,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 10,
  },
  placeholderText: {
    fontFamily: 'Poppins_400Regular',
    color: C.mutedLight,
    fontSize: 11,
  },
});
