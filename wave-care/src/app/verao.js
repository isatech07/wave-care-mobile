import React, { useEffect, useRef, useState } from 'react';
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
  bg:           '#FCFAF7',
  bgCard:       '#FFFFFF',
  bgCardAlt:    '#FEF6EE',
  bgCardDark:   '#F5E6D3',
  accent:       '#C2410C',
  accentHover:  '#B33A0A',
  accentSoft:   'rgba(194,65,12,0.08)',
  accentBorder: 'rgba(194,65,12,0.22)',
  fg:           '#1C1917',
  muted:        '#78716C',
  mutedLight:   '#A8A29E',
  border:       'rgba(28,25,23,0.10)',
  borderMed:    'rgba(28,25,23,0.18)',
  gold:         '#D97706',
  goldSoft:     'rgba(217,119,6,0.10)',
  cream:        '#FCFAF7',
  shadow:       '#1C1917',
};

// Imagens dos produtos de verão
const IMAGES = {
  kitCompleto:    require('../../assets/products/verao-produtos/Summer-Protection-kit.png'),
  condicionador:  require('../../assets/products/verao-produtos/verao-condicionador.png'),
  creme:          require('../../assets/products/verao-produtos/verao-creme.png'),
  gelatina:       require('../../assets/products/verao-produtos/verao-gelatina.png'),
  kit1:           require('../../assets/products/verao-produtos/verao-kit-1.png'),
  kit2:           require('../../assets/products/verao-produtos/verao-kit-2.png'),
  kit3:           require('../../assets/products/verao-produtos/verao-kit-3.png'),
  kit4:           require('../../assets/products/verao-produtos/verao-kit-4.png'),
  kit5:           require('../../assets/products/verao-produtos/verao-kit-5.png'),
  mascara:        require('../../assets/products/verao-produtos/verao-mascara.png'),
  oleo:           require('../../assets/products/verao-produtos/verao-oleo.png'),
  shampoo:        require('../../assets/products/verao-produtos/verao-shampoo.png'),
  propaganda:     require('../../assets/products/verao-produtos/propaganda-verao.jpg'),
};

function useFadeSlide(delay = 0, fromY = 24) {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(fromY)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 540, delay, useNativeDriver: true }),
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
          <Text style={styles.starsText}>{stars}  ({reviews} avaliações)</Text>
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

export default function SummerScreen() {
  const scrollViewRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('todos');

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_800ExtraBold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const badgeAnim = useFadeSlide(60,  0);
  const titleAnim = useFadeSlide(180, 36);
  const subAnim   = useFadeSlide(340, 20);
  const btnFade   = useRef(new Animated.Value(0)).current;
  const btnScale  = useRef(new Animated.Value(0.90)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(btnFade,  { toValue: 1, duration: 480, delay: 680, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, tension: 80, friction: 7, delay: 680, useNativeDriver: true }),
    ]).start();
  }, []);

  const animatePress = (animValue) => {
    Animated.sequence([
      Animated.timing(animValue, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.spring(animValue, { toValue: 1, tension: 120, friction: 5, useNativeDriver: true }),
    ]).start();
  };

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
        {/* ===== HERO ===== */}
        <View style={styles.heroCard}>
          <Circle size={280} color="rgba(194,65,12,0.12)" style={{ top: -80,   right: -80 }} />
          <Circle size={160} color="rgba(217,119,6,0.10)" style={{ top: 60,    right: 20  }} />
          <Circle size={200} color="rgba(194,65,12,0.06)" style={{ bottom: -50, left: -70 }} />

          <Animated.View style={badgeAnim}>
            <Badge iconName="sunny" label="NOVA COLEÇÃO VERÃO 2025" />
          </Animated.View>

          <Animated.Text style={[styles.heroTitle, titleAnim]}>
            Cuide dos{'\n'}seus fios{'\n'}no verão
          </Animated.Text>

          <Animated.Text style={[styles.heroSub, subAnim]}>
            Fórmulas exclusivas criadas para proteger do sol,
            maresia e calor — realçando brilho e definição natural.
          </Animated.Text>

          <View style={styles.heroDivider} />

          <View style={styles.statsRow}>
            <Stat iconName="leaf"      value="12+"  label="PRODUTOS"  delay={480} />
            <View style={styles.statDivider} />
            <Stat iconName="thumbs-up" value="98%"  label="APROVAÇÃO" delay={620} />
            <View style={styles.statDivider} />
            <Stat iconName="people"    value="5K+"  label="CLIENTES"  delay={760} />
          </View>

          <Animated.View style={{ opacity: btnFade, transform: [{ scale: btnScale }], alignSelf: 'flex-start' }}>
            <TouchableOpacity
              style={styles.ctaBtn}
              activeOpacity={0.85}
              onPress={() => animatePress(btnScale)}
            >
              <Text style={styles.ctaBtnText}>Ver novidades</Text>
              <View style={styles.ctaArrow}>
                <Ionicons name="arrow-forward" size={16} color={C.bg} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ===== BENEFÍCIOS ===== */}
        <View style={styles.section}>
          <Badge iconName="water" label="POR QUE SUMMER?" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
            style={{ marginTop: 12 }}
          >
            <BenefitChip iconName="sunny-outline"    text="Proteção UV" />
            <BenefitChip iconName="water-outline"    text="Hidratação profunda" />
            <BenefitChip iconName="sparkles-outline" text="Brilho intenso" />
            <BenefitChip iconName="waves-outline"    text="Anti-maresia" />
            <BenefitChip iconName="leaf-outline"     text="Ingredientes naturais" />
          </ScrollView>
        </View>

        {/* ===== PRODUTO DESTAQUE ===== */}
        <View style={styles.section}>
          <Badge iconName="trophy" label="MAIS VENDIDO" />
          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
            Summer Total{'\n'}Protection
          </Text>
          <Text style={styles.sectionSub}>
            O kit mais completo da estação para proteção total dos seus fios
          </Text>
          <ProductCard
            name="Wave Care Kit Summer"
            desc="Kit completo com shampoo, condicionador, máscara e óleo protetor solar para fios"
            price="R$ 249,90"
            oldPrice="R$ 299,90"
            stars="4.8"
            reviews="250"
            highlight
            image={IMAGES.kitCompleto}
            delay={200}
          />
        </View>

        {/* ===== LINHA COMPLETA ===== */}
        <View style={styles.section}>
          <Badge iconName="grid" label="LINHA COMPLETA" />
          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
            Linha de Produtos{'\n'}& Kits de Verão
          </Text>
          <Divider />

          {/* Filtro */}
          <View style={styles.filterRow}>
            {[
              { key: 'todos',    label: 'Todos' },
              { key: 'produto',  label: 'Produtos' },
              { key: 'kit',      label: 'Kits' },
            ].map(f => (
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
              { name: 'SunShield Shampoo',       price: 'R$ 39,90',  stars: '4.8', reviews: '234', image: IMAGES.shampoo,       delay: 100, type: 'produto' },
              { name: 'Condicionador Verão',      price: 'R$ 44,90',  stars: '4.7', reviews: '198', image: IMAGES.condicionador,  delay: 150, type: 'produto' },
              { name: 'Solar Repair Mask',        price: 'R$ 59,90',  stars: '4.9', reviews: '189', image: IMAGES.mascara,        delay: 200, type: 'produto' },
              { name: 'Creme Protetor Solar',     price: 'R$ 49,90',  stars: '4.6', reviews: '142', image: IMAGES.creme,          delay: 250, type: 'produto' },
              { name: 'Gelatina Modeladora',      price: 'R$ 42,90',  stars: '4.8', reviews: '167', image: IMAGES.gelatina,       delay: 300, type: 'produto' },
              { name: 'Óleo Protetor Capilar',    price: 'R$ 54,90',  stars: '4.9', reviews: '213', image: IMAGES.oleo,           delay: 350, type: 'produto' },
              { name: 'Kit Verão Essencial',      price: 'R$ 99,90',  stars: '4.8', reviews: '156', image: IMAGES.kit1,           delay: 400, type: 'kit'     },
              { name: 'Kit Hidratação Intensa',   price: 'R$ 119,90', stars: '4.7', reviews: '134', image: IMAGES.kit2,           delay: 450, type: 'kit'     },
              { name: 'Kit Proteção Solar',       price: 'R$ 129,90', stars: '4.9', reviews: '178', image: IMAGES.kit3,           delay: 500, type: 'kit'     },
              { name: 'Kit Brilho & Definição',   price: 'R$ 109,90', stars: '4.8', reviews: '145', image: IMAGES.kit4,           delay: 550, type: 'kit'     },
              { name: 'Kit Summer Premium',       price: 'R$ 149,90', stars: '5.0', reviews: '201', image: IMAGES.kit5,           delay: 600, type: 'kit'     },
              { name: 'Wave Care Kit Summer',     price: 'R$ 249,90', stars: '4.8', reviews: '250', image: IMAGES.kitCompleto,    delay: 650, type: 'kit'     },
            ]
              .filter(p => activeFilter === 'todos' || p.type === activeFilter)
              .map((p, i) => (
                <ProductCardSmall key={p.name} {...p} />
              ))
            }
          </View>
        </View>

        {/* ===== DIFERENCIAIS ===== */}
        <View style={styles.section}>
          <Badge iconName="bulb" label="DIFERENCIAIS" />
          <View style={[styles.highlightsRow, { marginTop: 14 }]}>
            <HighlightCard iconName="leaf"    title="Natural" text="Ingredientes 100% naturais"    delay={200} />
            <HighlightCard iconName="flask"   title="Testado" text="Dermatologicamente aprovado"   delay={350} />
            <HighlightCard iconName="refresh" title="Eco"     text="Embalagens recicláveis"         delay={500} />
          </View>
        </View>

        {/* ===== CTA FINAL ===== */}
        <View style={styles.ctaCard}>
          <Circle size={220} color="rgba(194,65,12,0.15)" style={{ top: -60,   right: -60 }} />
          <Circle size={130} color="rgba(217,119,6,0.10)" style={{ bottom: -40, left: -40 }} />

          <Badge iconName="gift" label="OFERTA ESPECIAL" />

          <Text style={styles.ctaCardTitle}>Monte seu{'\n'}kit verão</Text>
          <Text style={styles.ctaCardSub}>
            Combine produtos e ganhe até 20% de desconto na sua linha Summer personalizada.
          </Text>

          <TouchableOpacity style={styles.ctaBtnLight} activeOpacity={0.85}>
            <Text style={styles.ctaBtnLightText}>Montar kit</Text>
            <View style={styles.ctaArrowDark}>
              <Ionicons name="arrow-forward" size={16} color={C.bg} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  // ─── Layout base ─────────────────────────────────────────────────────────
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

  // ─── Hero ────────────────────────────────────────────────────────────────
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

  // ─── Seções ──────────────────────────────────────────────────────────────
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

  // ─── Badge ───────────────────────────────────────────────────────────────
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
    backgroundColor: 'rgba(252,250,247,0.10)',
    borderColor: 'rgba(252,250,247,0.20)',
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

  // ─── Stats ───────────────────────────────────────────────────────────────
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

  // ─── Botões CTA ──────────────────────────────────────────────────────────
  ctaBtn: {
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
  ctaBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    color: C.accent,
    fontSize: 14,
    letterSpacing: 0.1,
  },
  ctaArrow: {
    width: 30,
    height: 30,
    borderRadius: 25,
    backgroundColor: C.accent,
    justifyContent: 'center',
    alignItems: 'center',
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

  // ─── CTA Card ────────────────────────────────────────────────────────────
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

  // ─── Chips de benefício ───────────────────────────────────────────────────
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
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

  // ─── Divider ─────────────────────────────────────────────────────────────
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

  // ─── Filtro ──────────────────────────────────────────────────────────────
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

  // ─── Grid de produtos ─────────────────────────────────────────────────────
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },

  // ─── Card grande (destaque) ───────────────────────────────────────────────
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
    backgroundColor: 'rgba(252,250,247,0.85)',
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

  // ─── Card pequeno ─────────────────────────────────────────────────────────
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

  // ─── Diferenciais ────────────────────────────────────────────────────────
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

  // ─── Misc ─────────────────────────────────────────────────────────────────
  placeholderText: {
    fontFamily: 'Poppins_400Regular',
    color: C.mutedLight,
    fontSize: 11,
  },
});
  