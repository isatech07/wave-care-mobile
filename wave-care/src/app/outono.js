import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
import { useUser } from '../contexts/UserContext';
import { useProducts } from '../contexts/ProductContext';
import CartSheet from '../components/CartSheet';
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
  bg:           '#F5F0E8',
  bgCard:       '#FBF7F1',
  bgCardAlt:    '#EFE7DB',
  bgCardDark:   '#E8DDCF',
  accent:       '#698609',
  accentHover:  '#394A00',
  accentSoft:   'rgba(105,134,9,0.10)',
  accentBorder: 'rgba(105,134,9,0.26)',
  fg:           '#2C2016',
  muted:        '#7A6A55',
  mutedLight:   '#9C8E7C',
  border:       'rgba(44,32,22,0.12)',
  borderMed:    'rgba(44,32,22,0.20)',
  gold:         '#9A7B2F',
  goldSoft:     'rgba(154,123,47,0.12)',
  cream:        '#F5F0E8',
  shadow:       '#2C2016',
};

// Imagens dos produtos (mantidas para preservar estrutura visual)
const IMAGES = {
  kitCompleto:    require('../../assets/products/outono-produtos/Autumn-Bloom-mobile.png'),
  condicionador:  require('../../assets/products/outono-produtos/outono-condicionador.png'),
  creme:          require('../../assets/products/outono-produtos/outono-creme.png'),
  gelatina:       require('../../assets/products/outono-produtos/outono-gelatina.png'),
  kit1:           require('../../assets/products/outono-produtos/Autumn-kit-1.png'),
  kit2:           require('../../assets/products/outono-produtos/Autumn-kit-2.png'),
  kit3:           require('../../assets/products/outono-produtos/Autumn-kit-3.png'),
  kit4:           require('../../assets/products/outono-produtos/Autumn-kit-4.png'),
  kit5:           require('../../assets/products/outono-produtos/Autumn-kit-5.png'),
  mascara:        require('../../assets/products/outono-produtos/outono-mascara.png'),
  oleo:           require('../../assets/products/outono-produtos/outono-oleo.png'),
  shampoo:        require('../../assets/products/outono-produtos/outono-shampoo.png'),
  propaganda:     require('../../assets/products/outono-produtos/propaganda-outono.png'),
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

function ProductCard({ name, desc, price, oldPrice, stars, reviews, highlight, image, delay, onAddToCart, isFavorite, onToggleFavorite }) {
  const anim = useFadeSlide(delay, 20);

  return (
    <Animated.View style={[styles.productCard, highlight && styles.productCardHighlight, anim]}>
      <View style={[styles.productThumb, highlight && styles.productThumbHighlight]}>
        {image ? (
          <Image source={{ uri: image.uri || image }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image-outline" size={44} color={C.mutedLight} />
          </View>
        )}

        <TouchableOpacity style={styles.favBtn} onPress={() => onToggleFavorite && onToggleFavorite({ id: name, name: name, preco: parseFloat(price.replace('R$ ', '').replace(',', '.')), image, categoria: 'Produto', estacao: 'Outono' })} activeOpacity={0.8}>
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={isFavorite ? '#E53E3E' : C.muted} />
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
            <TouchableOpacity style={styles.cartBtn} onPress={() => onAddToCart && onAddToCart({ name, price, image })} activeOpacity={0.8}>
              <Ionicons name="cart-outline" size={18} color={C.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyBtn} onPress={() => onAddToCart && onAddToCart({ name, price, image })} activeOpacity={0.8}>
              <Text style={styles.buyBtnText}>Comprar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function ProductCardSmall({ name, price, stars, reviews, image, delay, type, onAddToCart, isFavorite, onToggleFavorite }) {
  const anim = useFadeSlide(delay, 20);

  return (
    <Animated.View style={[styles.productCardSmall, anim]}>
      <View style={styles.productThumbSmall}>
        {image ? (
          <Image source={{ uri: image.uri || image }} style={styles.productImageSmall} resizeMode="cover" />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={C.mutedLight} />
          </View>
        )}

        <TouchableOpacity style={styles.favBtn} onPress={() => onToggleFavorite && onToggleFavorite({ id: name, nome: name, preco: parseFloat(price?.replace('R$ ', '').replace(',', '.') ?? '0'), image, categoria: 'Produto', estacao: 'Outono' })} activeOpacity={0.8}>
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={15} color={isFavorite ? '#E53E3E' : C.muted} />
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
          <TouchableOpacity style={styles.smallCartBtn} onPress={() => onAddToCart && onAddToCart({ name, price, image })} activeOpacity={0.8}>
            <Ionicons name="cart-outline" size={16} color={C.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyBtnFull} onPress={() => onAddToCart && onAddToCart({ name, price, image })} activeOpacity={0.8}>
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

function Toast({ visible, message, icon }) {
  if (!visible) return null;
  return (
    <View style={styles.toast}>
      <View style={styles.toastIconWrap}>
        <Ionicons name={icon || 'checkmark-circle'} size={16} color={C.accent} />
      </View>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

export default function AutumnScreen() {
  const { getBySeason, loading } = useProducts();
  if (loading) return null;

  const router = useRouter();
  const scrollViewRef = useRef(null);
  const { user, toggleFavorite, cart, addToCart, removeFromCart, deleteFromCart } = useUser();
  const seasonProducts = getBySeason('outono');
  const [activeFilter, setActiveFilter] = useState('todos');
  const [benefitIndex, setBenefitIndex] = useState(0);
  const [cartVisible, setCartVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastIcon, setToastIcon] = useState('checkmark-circle');
  const toastTimeout = useRef(null);
  const autumnBenefits = useMemo(
    () => [
      { iconName: 'leaf-outline', text: 'Nutrição sazonal' },
      { iconName: 'cloudy-night-outline', text: 'Proteção contra vento frio' },
      { iconName: 'color-filter-outline', text: 'Tons terrosos luminosos' },
      { iconName: 'water-outline', text: 'Hidratação de transição' },
      { iconName: 'sparkles-outline', text: 'Maciez de colheita' },
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
      setBenefitIndex((prev) => (prev + 1) % autumnBenefits.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [autumnBenefits.length]);

  const showToast = useCallback((message, icon = 'checkmark-circle') => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToastMessage(message);
    setToastIcon(icon);
    setToastVisible(true);
    toastTimeout.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  const handleAddToCart = useCallback((product) => {
    const priceNum = typeof product.price === 'string' 
      ? parseFloat(product.price.replace('R$ ', '').replace(',', '.'))
      : (product.price || 0);
    
    const productWithPrice = {
      ...product,
      preco: priceNum,
      price: priceNum,
      nome: product.name,
      categoria: 'Produto',
      id: product.name
    };
    
    setCart(prev => {
      const existing = prev.find(i => i.name === product.name);
      if (existing) return prev.map(i => i.name === product.name ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...productWithPrice, qty: 1 }];
    });
    showToast(product.name + ' adicionado!', 'cart-outline');
  }, [showToast]);

  const handleRemoveFromCart = useCallback((id) => {
    setCart(prev => {
      const existing = prev.find(i => i.name === id || i.id === id);
      if (existing && existing.qty === 1) return prev.filter(i => i.name !== id && i.id !== id);
      return prev.map(i => i.name === id || i.id === id ? { ...i, qty: i.qty - 1 } : i);
    });
  }, []);

  const handleDeleteFromCart = useCallback((id) => {
    setCart(prev => prev.filter(i => i.name !== id && i.id !== id));
  }, []);

  const handleToggleFavorite = useCallback(async (product) => {
    if (!user || user.guest) {
      showToast('Faça login para favoritar produtos', 'log-in-outline');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }

    const wasAdded = await toggleFavorite(product);

    if (wasAdded) {
      showToast(product.name + ' adicionado aos favoritos', 'heart');
    } else {
      showToast(product.name + ' removido dos favoritos', 'heart-dislike-outline');
    }
  }, [user, toggleFavorite, showToast, router]);

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
          <Circle size={280} color="rgba(105,134,9,0.14)" style={{ top: -80, right: -80 }} />
          <Circle size={160} color="rgba(57,74,0,0.10)" style={{ top: 60, right: 20 }} />
          <Circle size={200} color="rgba(105,134,9,0.07)" style={{ bottom: -50, left: -70 }} />

          <Animated.View style={badgeAnim}>
            <Badge iconName="leaf" label="NOVA COLEÇÃO DE OUTONO 2026" />
          </Animated.View>

          <Animated.Text style={[styles.heroTitle, titleAnim]}>
            Abrace a{'\n'}transição dos{'\n'}fios no outono
          </Animated.Text>

          <Animated.Text style={[styles.heroSub, subAnim]}>
            Ativos nutritivos pensados para dias de vento frio,
            folhas caindo e mudanças de clima, com brilho terroso e leveza.
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

        {/* ===== BENEFICIOS ===== */}
        <View style={styles.section}>
          <Badge iconName="cloudy" label="POR QUE AUTUMN?" />
          <View style={styles.autoCarouselWrap}>
            <BenefitChip
              iconName={autumnBenefits[benefitIndex].iconName}
              text={autumnBenefits[benefitIndex].text}
            />
          </View>
        </View>

        {/* ===== PRODUTO DESTAQUE ===== */}
        <View style={styles.section}>
          <Badge iconName="trophy" label="MAIS VENDIDO" />
          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
            Autumn Total{'\n'}Transition
          </Text>
          <Text style={styles.sectionSub}>
            O kit mais completo da estação para nutrição e equilíbrio dos seus fios
          </Text>
          <ProductCard
            name="Kit Autumn Total Nutrition"
            desc="Kit completo com shampoo, condicionador, máscara e óleo nutritivo para dias frios"
            price="R$ 229,90"
            oldPrice="R$ 249,90"
            stars="4.8"
            reviews="250"
            highlight
            image={IMAGES.kitCompleto}
            delay={200}
            onAddToCart={handleAddToCart}
            isFavorite={user?.favorites?.some(f => f.name === 'Kit Autumn Total Nutrition')}
            onToggleFavorite={handleToggleFavorite}
          />
        </View>

        {/* ===== LINHA COMPLETA ===== */}
        <View style={styles.section}>
          <Badge iconName="grid" label="LINHA COMPLETA" />
          <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
            Linha de Produtos{'\n'}& Kits de Outono
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
            {seasonProducts
              .filter((p) => activeFilter === 'todos' || (p.categoria?.toLowerCase() === 'produtos' ? 'produto' : p.categoria?.toLowerCase()) === activeFilter)
              .map((p) => {
                const delay = 150;
                const type = p.categoria?.toLowerCase() === 'produtos' ? 'produto' : p.categoria?.toLowerCase();
                return (
                  <ProductCardSmall 
                    key={p.id} 
                    name={p.name}
                    desc={p.description}
                    price={`R$ ${p.price?.toFixed(2).replace('.', ',')}`}
                    stars="4.8"
                    reviews="200"
                    image={{ uri: p.imageUrl }}
                    delay={delay}
                    type={p.category}
                    onAddToCart={handleAddToCart}
                    isFavorite={user?.favorites?.some(f => f.id === p.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                );
              })}
          </View>
        </View>

        {/* ===== DIFERENCIAIS ===== */}
        <View style={styles.section}>
          <Badge iconName="bulb" label="DIFERENCIAIS" />
          <View style={[styles.highlightsRow, { marginTop: 14 }]}>
            <HighlightCard iconName="leaf" title="Sazonal" text="Ativos da estação de colheita" delay={200} />
            <HighlightCard iconName="flask" title="Clinico" text="Testes para climas de transição" delay={350} />
            <HighlightCard iconName="refresh" title="Consciente" text="Embalagens com foco sustentável" delay={500} />
          </View>
        </View>

        {/* ===== CTA FINAL ===== */}
        <View style={styles.ctaCard}>
          <Circle size={220} color="rgba(105,134,9,0.16)" style={{ top: -60, right: -60 }} />
          <Circle size={130} color="rgba(57,74,0,0.10)" style={{ bottom: -40, left: -40 }} />

          <Badge iconName="gift" label="OFERTA ESPECIAL" />

          <Text style={styles.ctaCardTitle}>Monte seu{'\n'}kit outono</Text>
          <Text style={styles.ctaCardSub}>
            Combine produtos e ganhe até 20% de desconto na sua linha Autumn personalizada.
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
      <Toast visible={toastVisible} message={toastMessage} icon={toastIcon} />
      <TouchableOpacity
        style={styles.floatingCartBtn}
        activeOpacity={0.85}
        onPress={() => setCartVisible(true)}
      >
        <Ionicons name="cart-outline" size={22} color="#FFFFFF" />
        {cart.reduce((sum, i) => sum + i.qty, 0) > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cart.reduce((sum, i) => sum + i.qty, 0)}</Text>
          </View>
        )}
      </TouchableOpacity>
      <CartSheet
        visible={cartVisible}
        cart={cart}
        onClose={() => setCartVisible(false)}
        onAdd={handleAddToCart}
        onRemove={handleRemoveFromCart}
        onDelete={handleDeleteFromCart}
      />
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
    backgroundColor: 'rgba(245,240,232,0.10)',
    borderColor: 'rgba(245,240,232,0.20)',
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
    backgroundColor: 'rgba(245,240,232,0.85)',
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
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#E53E3E',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 12,
  },
  toast: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: C.accent,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  toastIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  toastText: {
    fontFamily: 'Poppins_500Medium',
    color: C.bg,
    fontSize: 13,
    flex: 1,
  },
  placeholderText: {
    fontFamily: 'Poppins_400Regular',
    color: C.mutedLight,
    fontSize: 11,
  },
});
