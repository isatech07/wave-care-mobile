import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  FadeIn,
  FadeOutUp,
  FadeInDown,
  SlideInRight,
  SlideOutRight,
  SlideInUp,
  SlideOutDown,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUser } from '../../contexts/UserContext';
import { useProducts } from '../../contexts/ProductContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  cream: '#f5f0e8',
  dark: '#1a1a1a',
  darkSoft: '#2d2d2d',
  gray: '#8a8a8a',
  grayLight: '#b0b0b0',
  lightGray: '#e8e5e0',
  lighterGray: '#f0ede8',
  red: '#c0392b',
  redLight: '#fff0ee',
  shadow: 'rgba(2, 60, 51, 0.08)',
  shadowDark: 'rgba(0, 0, 0, 0.12)',
};

const BADGE_COLORS = {
  'Novo':       { bg: '#e8f5e9', text: '#2e7d32' },
  'Popular':    { bg: '#fff3e0', text: '#e65100' },
  'Verão':      { bg: '#fff8e1', text: '#f57f17' },
  'Premium':    { bg: COLORS.goldLight, text: COLORS.green },
  'Kit':        { bg: '#e3f2fd', text: '#1565c0' },
  'Oferta':     { bg: '#fce4ec', text: '#c62828' },
  'Best Seller':{ bg: COLORS.goldLight, text: COLORS.goldDark },
  'Exclusivo':  { bg: '#f3e5f5', text: '#6a1b9a' },
  'Luxo':       { bg: '#212121', text: COLORS.gold },
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function Toast({ visible, message, icon }) {
  if (!visible) return null;
  return (
    <Animated.View entering={FadeInDown.duration(350).springify().damping(18)} exiting={FadeOutUp.duration(250)} style={styles.toast}>
      <LinearGradient colors={['rgba(2,60,51,0.96)', 'rgba(4,92,79,0.96)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.toastGradient}>
        <View style={styles.toastIconWrap}>
          <Ionicons name={icon || 'checkmark-circle'} size={16} color={COLORS.gold} />
        </View>
        <Text style={styles.toastText}>{message}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

function FilterPanel({ visible, onClose, selectedSeason, selectedCategory, onSeasonChange, onCategoryChange, onClear }) {
  const seasons = ['Todos', 'Verão', 'Outono', 'Inverno', 'Primavera'];
  const categories = ['Todos', 'Shampoo', 'Condicionador', 'Tratamento', 'Finalização', 'Nutrição', 'Kits'];
  const seasonIcons = { 'Todos': 'apps', 'Verão': 'sunny', 'Outono': 'leaf', 'Inverno': 'snow', 'Primavera': 'flower' };

  if (!visible) return null;

  const activeCount = (selectedSeason !== 'Todos' ? 1 : 0) + (selectedCategory !== 'Todos' ? 1 : 0);

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.filterOverlay}>
      <TouchableOpacity style={styles.filterBackdrop} onPress={onClose} activeOpacity={1} />
      <Animated.View entering={SlideInRight.duration(350).springify().damping(20)} exiting={SlideOutRight.duration(250)} style={styles.filterPanel}>
        <LinearGradient colors={[COLORS.offWhite, COLORS.background]} style={styles.filterPanelInner}>
          <View style={styles.filterHeader}>
            <View>
              <Text style={styles.filterTitle}>Filtros</Text>
              {activeCount > 0 && (
                <Text style={styles.filterActiveCount}>{activeCount} filtro{activeCount > 1 ? 's' : ''} ativo{activeCount > 1 ? 's' : ''}</Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.filterClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={styles.filterDivider} />
            <Text style={styles.filterSectionTitle}>Estação</Text>
            <Text style={styles.filterSectionSub}>Selecione a estação do ano</Text>
            <View style={styles.filterChips}>
              {seasons.map(season => (
                <TouchableOpacity
                  key={season}
                  style={[styles.filterChip, selectedSeason === season && styles.filterChipActive]}
                  onPress={() => onSeasonChange(season)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={seasonIcons[season]} size={14} color={selectedSeason === season ? COLORS.white : COLORS.gray} style={{ marginRight: 6 }} />
                  <Text style={[styles.filterChipText, selectedSeason === season && styles.filterChipTextActive]}>
                    {season}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.filterDivider} />
            <Text style={styles.filterSectionTitle}>Categoria</Text>
            <Text style={styles.filterSectionSub}>Tipo de produto</Text>
            <View style={styles.filterChips}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
                  onPress={() => onCategoryChange(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.filterFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={onClear} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={16} color={COLORS.green} />
              <Text style={styles.clearButtonText}>Limpar filtros</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.applyButtonText}>Aplicar</Text>
              <Ionicons name="checkmark" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

function CartSheet({ visible, cart, onClose, onAdd, onRemove, onDelete, onCheckout }) {
  const total = cart.reduce((sum, item) => sum + (item.preco || item.price || 0) * item.qty, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);

  if (!visible) return null;

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.cartOverlay}>
      <TouchableOpacity style={styles.cartBackdrop} onPress={onClose} activeOpacity={1} />
      <Animated.View entering={SlideInUp.duration(400).springify().damping(18)} exiting={SlideOutDown.duration(300)} style={styles.cartSheet}>
        <View style={styles.cartHandle} />
        <View style={styles.cartHeader}>
          <View>
            <Text style={styles.cartTitle}>Minha Sacola</Text>
            {itemCount > 0 && (
              <Text style={styles.cartItemCount}>{itemCount} {itemCount === 1 ? 'item' : 'itens'}</Text>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.cartCloseBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color={COLORS.dark} />
          </TouchableOpacity>
        </View>

        {cart.length === 0 ? (
          <View style={styles.cartEmpty}>
            <View style={styles.cartEmptyIcon}>
              <Ionicons name="cart-outline" size={40} color={COLORS.lightGray} />
            </View>
            <Text style={styles.cartEmptyTitle}>Sua sacola está vazia</Text>
            <Text style={styles.cartEmptyText}>Adicione produtos para começar</Text>
            <TouchableOpacity style={styles.cartEmptyBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cartEmptyBtnText}>Explorar produtos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
              {cart.map((item, index) => (
                <Animated.View key={item.id} entering={FadeInDown.delay(index * 80).springify()} style={styles.cartItem}>
                  <Image source={{ uri: item.imageUrl }} style={styles.cartItemImage} contentFit="cover" />
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.cartItemCategory}>{item.category}</Text>
                    <Text style={styles.cartItemPrice}>R$ {(Number(item.price ?? 0) * item.qty).toFixed(2).replace('.', ',')}</Text>
                    <View style={styles.cartQtyRow}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => onRemove(item.id)} activeOpacity={0.7}>
                        <Ionicons name="remove" size={14} color={COLORS.green} />
                      </TouchableOpacity>
                      <View style={styles.qtyDisplay}>
                        <Text style={styles.qtyText}>{item.qty}</Text>
                      </View>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => onAdd(item)} activeOpacity={0.7}>
                        <Ionicons name="add" size={14} color={COLORS.green} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)} activeOpacity={0.7}>
                    <Ionicons name="trash-outline" size={16} color={COLORS.red} />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>

            <View style={styles.cartFooter}>
              <View style={styles.cartFooterDivider} />
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.subtotalValue}>R$ {(total ?? 0).toFixed(2)}</Text>
              </View>
              <View style={styles.shippingRow}>
                <Text style={styles.shippingLabel}>Frete</Text>
                <Text style={styles.shippingFree}>Grátis</Text>
              </View>
              <View style={styles.totalDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>R$ {(total ?? 0).toFixed(2)}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.85} onPress={onCheckout}>
                <LinearGradient colors={[COLORS.green, COLORS.greenLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.checkoutGradient}>
                  <Text style={styles.checkoutBtnText}>Finalizar Compra</Text>
                  <View style={styles.checkoutArrow}>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.green} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </Animated.View>
  );
}

function ProductCard({ item, viewMode, onAddToCart, isFavorite, onToggleFavorite, index }) {
  const heartScale = useSharedValue(1);
  const cardScale = useSharedValue(1);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handleFavorite = () => {
    heartScale.value = withSequence(
      withSpring(0.6, { damping: 8 }),
      withSpring(1.3, { damping: 6 }),
      withSpring(1, { damping: 10 })
    );
    onToggleFavorite(item);
  };

  const handlePressIn = () => {
    cardScale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    cardScale.value = withSpring(1, { damping: 12 });
  };

  const badgeStyle = item.badge && BADGE_COLORS[item.badge] ? BADGE_COLORS[item.badge] : { bg: COLORS.green, text: COLORS.white };
  const discount = (item.precoOriginal ?? 0) > 0 ? Math.round((1 - Number(item.price ?? 0) / Number(item.precoOriginal ?? 0)) * 100) : 0;

  const isGrid = viewMode === 'grid';

  if (isGrid) {
    return (
      <Animated.View entering={FadeInDown.delay(index * 70).springify().damping(16)} style={[styles.gridCard, cardStyle]}>
        <TouchableOpacity activeOpacity={1} onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <View style={styles.cardImageContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.gridImage} contentFit="cover" transition={300} />
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.03)']} style={styles.imageOverlay} />
            {item.badge && (
              <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
                <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{item.badge}</Text>
              </View>
            )}
            {discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discount}%</Text>
              </View>
            )}
            <AnimatedTouchable style={[styles.heartBtn, heartStyle]} onPress={handleFavorite} activeOpacity={0.8}>
              <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={16} color={isFavorite ? COLORS.red : COLORS.darkSoft} />
            </AnimatedTouchable>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardCategory}>{item.category}</Text>
            <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
            <View style={styles.ratingRow}>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map(s => (
                  <Ionicons key={s} name={s <= Math.floor(item.rating) ? 'star' : (s - 0.5 <= item.rating ? 'star-half' : 'star-outline')} size={10} color={COLORS.gold} />
                ))}
              </View>
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.reviewText}>({item.reviews})</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.price}>R$ {Number(item.price ?? 0).toFixed(2)}</Text>
              {(item.precoOriginal ?? 0) > 0 && (
                <Text style={styles.originalPrice}>R$ {Number(item.precoOriginal ?? 0).toFixed(2)}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={() => onAddToCart(item)} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.greenLight, COLORS.greenMuted]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addBtnGradient}>
                <Text style={styles.addBtnText}>Adicionar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.delay(index * 70).springify().damping(16)} style={[styles.compactCard, cardStyle]}>
      <TouchableOpacity activeOpacity={1} onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.compactInner}>
        <View style={styles.compactImageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.compactImage} contentFit="cover" transition={300} />
          {item.badge && (
            <View style={[styles.badgeCompact, { backgroundColor: badgeStyle.bg }]}>
              <Text style={[styles.badgeTextCompact, { color: badgeStyle.text }]}>{item.badge}</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={styles.discountBadgeCompact}>
              <Text style={styles.discountTextCompact}>-{discount}%</Text>
            </View>
          )}
        </View>
        <View style={styles.compactInfo}>
          <View>
            <Text style={styles.cardCategory}>{item.category} · {item.season}</Text>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.compactDesc} numberOfLines={2}>{item.description}</Text>
          </View>
          <View style={styles.compactBottom}>
            <View>
              <Text style={styles.price}>R$ {Number(item.price ?? 0).toFixed(2)}</Text>
              {(item.precoOriginal ?? 0) > 0 && (
                <Text style={styles.originalPrice}>R$ {Number(item.precoOriginal ?? 0).toFixed(2)}</Text>
              )}
            </View>
            <View style={styles.compactActions}>
              <AnimatedTouchable style={[styles.heartBtnSmall, heartStyle]} onPress={handleFavorite} activeOpacity={0.7}>
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={16} color={isFavorite ? COLORS.red : COLORS.darkSoft} />
              </AnimatedTouchable>
              <TouchableOpacity style={styles.addBtnSmall} onPress={() => onAddToCart(item)} activeOpacity={0.8}>
                <LinearGradient colors={[COLORS.greenLight, COLORS.greenMuted]} style={styles.addBtnSmallGradient}>
                  <Ionicons name="cart-outline" size={16} color={COLORS.white} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function FloatingCartButton({ cartCount, onPress }) {
  const pulseScale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (cartCount > 0) {
      pulseScale.value = withSequence(
        withSpring(1.2, { damping: 6 }),
        withSpring(1, { damping: 10 })
      );
      rotation.value = withSequence(
        withTiming(-8, { duration: 80 }),
        withTiming(8, { duration: 80 }),
        withTiming(-4, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
    }
  }, [cartCount]);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseScale.value },
      { rotate: rotation.value + 'deg' },
    ],
  }));

  return (
    <Animated.View entering={ZoomIn.delay(600).springify()} style={[styles.fab, fabStyle]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <LinearGradient colors={[COLORS.greenLight, COLORS.greenMuted]} style={styles.fabBtn}>
          <Ionicons name="cart-outline" size={24} color={COLORS.white} />
          {cartCount > 0 && (
            <Animated.View entering={ZoomIn.springify()} style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </Animated.View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function loja() {
  const router = useRouter();
  const { products, loading } = useProducts();
  const { user, toggleFavorite, cart, addToCart, removeFromCart, deleteFromCart, addOrder, clearCart } = useUser();

  const [selectedSeason, setSelectedSeason] = useState('Todos');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortOrder, setSortOrder] = useState('default');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastIcon, setToastIcon] = useState('checkmark-circle');
  const toastTimeout = useRef(null);


  // Carrega favoritos do usuário quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      if (user && !user.guest && user.favorites) {
        const favoriteIds = user.favorites.map(fav => fav.id);
        setFavorites(favoriteIds);
      } else {
        setFavorites([]);
      }
    }, [user])
  );

  const showToast = useCallback((message, icon = 'checkmark-circle') => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToastMessage(message);
    setToastIcon(icon);
    setToastVisible(true);
    toastTimeout.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  const handleAddToCart = useCallback((item) => {
    addToCart(item);
    showToast(item.name + ' adicionado!', 'cart-outline');
  }, [showToast, addToCart]);

  const handleRemoveFromCart = useCallback((id) => {
    removeFromCart(id);
  }, [removeFromCart]);

  const handleDeleteFromCart = useCallback((id) => {
    deleteFromCart(id);
  }, [deleteFromCart]);

  const handleCheckout = useCallback(async () => {
    if (!user || user.guest) {
      showToast('Faça login para finalizar a compra', 'log-in-outline');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }

    if (cart.length === 0) {
      showToast('Seu carrinho está vazio', 'cart-outline');
      return;
    }

    const total = cart.reduce((sum, item) => sum + (item.preco || item.price || 0) * item.qty, 0);

    try {
      await addOrder({
        products: cart.map(item => ({
          id: item.id,
          name: item.name || item.nome,
          price: item.preco || item.price,
          qty: item.qty,
        })),
        total: total,
        status: 'aguardando',
      });

      await clearCart();
      setCartVisible(false);
      showToast('Pedido realizado com sucesso!', 'checkmark-circle');
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      showToast('Erro ao finalizar pedido. Tente novamente.', 'alert-circle');
    }
  }, [user, cart, addOrder, clearCart, showToast, router]);

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
      setFavorites(prev => [...prev, product.id]);
      showToast(product.name + ' adicionado aos favoritos', 'heart');
    } else {
      setFavorites(prev => prev.filter(id => id !== product.id));
      showToast(product.name + ' removido dos favoritos', 'heart-dislike-outline');
    }
  }, [user, toggleFavorite, showToast, router]);

  const filteredProducts = products
    .filter(p => {
      const matchSeason = selectedSeason === 'Todos' || p.season === selectedSeason;
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
      return matchSeason && matchCat;
    })
    .sort((a, b) => {
      if (sortOrder === 'priceAsc') return a.price - b.price;
      if (sortOrder === 'priceDesc') return b.price - a.price;
      if (sortOrder === 'rating') return b.rating - a.rating;
      return 0;
    });

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const renderItem = useCallback(({ item, index }) => (
    <ProductCard
      item={item}
      viewMode={viewMode}
      index={index}
      onAddToCart={handleAddToCart}
      isFavorite={favorites.includes(item.id)}
      onToggleFavorite={handleToggleFavorite}
    />
  ), [viewMode, handleAddToCart, favorites, handleToggleFavorite]);

  if (loading) return null;

  const ListHeader = (
    <View>
      <Animated.View entering={FadeIn.duration(700)} style={styles.hero}>
        <LinearGradient colors={['#012a24', COLORS.green, '#045c4f', '#067a6a']} locations={[0, 0.3, 0.7, 1]} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.heroGradient}>
          <View style={styles.heroPattern}>
            <View style={styles.heroCircle1} />
            <View style={styles.heroCircle2} />
          </View>
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={11} color={COLORS.green} />
              <Text style={styles.heroBadgeText}>Nova coleção 2025</Text>
            </View>
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(350).duration(700)} style={styles.heroTitle}>
            Cuide do seu{'\n'}cabelo em{'\n'}cada estação
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(500).duration(600)} style={styles.heroSubtitle}>
            Fórmulas exclusivas criadas para nutrir, proteger{'\n'}e realçar a beleza natural dos seus fios
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(650).duration(600)} style={styles.heroStats}>
            {[
              ['12+', 'Produtos', 'leaf-outline'],
              ['98%', 'Aprovação', 'heart-outline'],
              ['5K+', 'Clientes', 'people-outline'],
            ].map(([val, label, icon]) => (
              <View key={label} style={styles.heroStat}>
                <View style={styles.heroStatIcon}>
                  <Ionicons name={icon} size={14} color={COLORS.gold} />
                </View>
                <Text style={styles.heroStatValue}>{val}</Text>
                <Text style={styles.heroStatLabel}>{label}</Text>
              </View>
            ))}
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(800).duration(500)}>
            <TouchableOpacity style={styles.heroCta} activeOpacity={0.85}>
              <Text style={styles.heroCtaText}>Ver novidades</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.green} />
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterVisible(true)} activeOpacity={0.7}>
          <Ionicons name="options-outline" size={16} color={COLORS.green} />
          <Text style={styles.filterBtnText}>Filtros</Text>
          {(selectedSeason !== 'Todos' || selectedCategory !== 'Todos') && (
            <View style={styles.filterDot} />
          )}
        </TouchableOpacity>
        <View style={styles.toolbarRight}>
          <Text style={styles.productCount}>{filteredProducts.length} produtos</Text>
          <View style={styles.viewToggle}>
            <TouchableOpacity style={[styles.viewBtn, viewMode === 'grid' && styles.viewBtnActive]} onPress={() => setViewMode('grid')} activeOpacity={0.7}>
              <Ionicons name="grid-outline" size={15} color={viewMode === 'grid' ? COLORS.white : COLORS.gray} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.viewBtn, viewMode === 'compact' && styles.viewBtnActive]} onPress={() => setViewMode('compact')} activeOpacity={0.7}>
              <Ionicons name="list-outline" size={15} color={viewMode === 'compact' ? COLORS.white : COLORS.gray} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow} contentContainerStyle={styles.sortContent}>
        {[
          { key: 'default',   label: 'Relevância',      icon: 'flash-outline' },
          { key: 'rating',    label: 'Melhor avaliados', icon: 'star-outline' },
          { key: 'priceAsc',  label: 'Menor preço',      icon: 'trending-down-outline' },
          { key: 'priceDesc', label: 'Maior preço',      icon: 'trending-up-outline' },
        ].map(opt => (
          <TouchableOpacity key={opt.key} style={[styles.sortChip, sortOrder === opt.key && styles.sortChipActive]} onPress={() => setSortOrder(opt.key)} activeOpacity={0.7}>
            <Ionicons name={opt.icon} size={13} color={sortOrder === opt.key ? COLORS.green : COLORS.gray} style={{ marginRight: 5 }} />
            <Text style={[styles.sortChipText, sortOrder === opt.key && styles.sortChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.green} />
      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : undefined}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Ionicons name="search-outline" size={48} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>Nenhum produto encontrado</Text>
            <Text style={styles.emptyText}>Tente ajustar os filtros</Text>
          </View>
        }
      />
      <FloatingCartButton cartCount={cartCount} onPress={() => setCartVisible(true)} />
      <View style={styles.toastContainer} pointerEvents="none">
        <Toast visible={toastVisible} message={toastMessage} icon={toastIcon} />
      </View>
      <FilterPanel
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        selectedSeason={selectedSeason}
        selectedCategory={selectedCategory}
        onSeasonChange={setSelectedSeason}
        onCategoryChange={setSelectedCategory}
        onClear={() => { setSelectedSeason('Todos'); setSelectedCategory('Todos'); }}
      />
      <CartSheet
        visible={cartVisible}
        cart={cart}
        onClose={() => setCartVisible(false)}
        onAdd={handleAddToCart}
        onRemove={handleRemoveFromCart}
        onDelete={handleDeleteFromCart}
        onCheckout={handleCheckout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { paddingBottom: 120 },
  hero: { marginBottom: 0 },
  heroGradient: { paddingTop: Platform.OS === 'ios' ? 64 : 48, paddingBottom: 44, paddingHorizontal: 28, overflow: 'hidden' },
  heroPattern: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroCircle1: { position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(201, 185, 154, 0.06)' },
  heroCircle2: { position: 'absolute', bottom: -30, left: -50, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255, 255, 255, 0.03)' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.gold, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 24, marginBottom: 22 },
  heroBadgeText: { fontFamily: 'Poppins_700Bold', color: COLORS.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  heroTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 36, color: COLORS.white, lineHeight: 44, marginBottom: 18, letterSpacing: -0.8 },
  heroSubtitle: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 22, marginBottom: 32, letterSpacing: 0.2 },
  heroStats: { flexDirection: 'row', gap: 28, marginBottom: 28 },
  heroStat: { alignItems: 'center' },
  heroStatIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(201, 185, 154, 0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  heroStatValue: { fontFamily: 'Poppins_700Bold', fontSize: 20, fontWeight: '900', color: COLORS.gold, letterSpacing: -0.3 },
  heroStatLabel: { fontFamily: 'Poppins_500Medium', fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '500', letterSpacing: 0.5, textTransform: 'uppercase' },
  heroCta: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8, backgroundColor: COLORS.gold, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 28 },
  heroCtaText: { fontFamily: 'Poppins_700Bold', color: COLORS.green, fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.lighterGray },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: COLORS.lightGray, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 3 },
  filterBtnText: { fontFamily: 'Poppins_700Bold', fontSize: 13, color: COLORS.green, fontWeight: '700' },
  filterDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.red, marginLeft: 2 },
  toolbarRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  productCount: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: COLORS.gray, fontWeight: '600' },
  viewToggle: { flexDirection: 'row', backgroundColor: COLORS.lighterGray, borderRadius: 12, padding: 3 },
  viewBtn: { padding: 6, borderRadius: 10 },
  viewBtnActive: { backgroundColor: COLORS.green, shadowColor: COLORS.green, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  sortRow: { backgroundColor: COLORS.background, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.lighterGray },
  sortContent: { paddingHorizontal: 20, gap: 8 },
  sortChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 24, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.lighterGray },
  sortChipActive: { backgroundColor: COLORS.goldLight, borderColor: COLORS.goldAccent },
  sortChipText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: COLORS.gray, fontWeight: '600' },
  sortChipTextActive: { color: COLORS.green, fontWeight: '800' },
  columnWrapper: { gap: 14, paddingHorizontal: 20, marginTop: 14 },
  gridCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: 22, overflow: 'hidden', shadowColor: COLORS.shadowDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 5 },
  cardImageContainer: { position: 'relative', overflow: 'hidden' },
  gridImage: { width: '100%', height: (SCREEN_WIDTH / 2 - 34) * 1.0, backgroundColor: COLORS.lighterGray },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40 },
  badge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  badgeCompact: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeTextCompact: { fontSize: 8, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  discountBadge: { position: 'absolute', bottom: 10, left: 12, backgroundColor: COLORS.red, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  discountText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  discountBadgeCompact: { position: 'absolute', bottom: 8, left: 8, backgroundColor: COLORS.red, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discountTextCompact: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
  heartBtn: { position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardInfo: { padding: 14, gap: 2 },
  cardCategory: { fontFamily: 'Poppins_700Bold', fontSize: 9, color: COLORS.goldDark, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  cardName: { fontFamily: 'Poppins_700Bold', fontSize: 13, color: COLORS.dark, fontWeight: '700', lineHeight: 18, marginBottom: 6, letterSpacing: -0.2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  ratingStars: { flexDirection: 'row', gap: 1 },
  ratingText: { fontFamily: 'Poppins_700Bold', fontSize: 11, color: COLORS.dark, fontWeight: '800', marginLeft: 2 },
  reviewText: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: COLORS.grayLight, fontWeight: '500' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 12 },
  price: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: COLORS.green, fontWeight: '900', letterSpacing: -0.3 },
  originalPrice: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.grayLight, textDecorationLine: 'line-through', fontWeight: '500' },
  addBtn: { borderRadius: 14, overflow: 'hidden' },
  addBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 14 },
  addBtnText: { fontFamily: 'Poppins_700Bold', color: COLORS.white, fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  compactCard: { backgroundColor: COLORS.white, borderRadius: 22, marginHorizontal: 20, marginTop: 14, overflow: 'hidden', shadowColor: COLORS.shadowDark, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 14, elevation: 4 },
  compactInner: { flexDirection: 'row' },
  compactImageContainer: { position: 'relative', overflow: 'hidden' },
  compactImage: { width: 120, height: 140, backgroundColor: COLORS.lighterGray },
  compactInfo: { flex: 1, padding: 16, justifyContent: 'space-between' },
  compactDesc: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray, lineHeight: 17, marginTop: 4, letterSpacing: 0.1 },
  compactBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  compactActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heartBtnSmall: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.lighterGray, alignItems: 'center', justifyContent: 'center' },
  addBtnSmall: { borderRadius: 17, overflow: 'hidden' },
  addBtnSmallGradient: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  emptyList: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 8 },
  emptyTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, fontWeight: '700', color: COLORS.dark, marginTop: 8 },
  emptyText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray },
  fab: { position: 'absolute', bottom: 36, right: 24 },
  fabBtn: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.greenLight, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 12 },
  cartBadge: { position: 'absolute', top: -3, right: -3, minWidth: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.red, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: COLORS.white, paddingHorizontal: 4 },
  cartBadgeText: { fontFamily: 'Poppins_700Bold', color: COLORS.white, fontSize: 10, fontWeight: '900' },
  toastContainer: { position: 'absolute', top: Platform.OS === 'ios' ? 64 : 44, left: 0, right: 0, alignItems: 'center', zIndex: 9999 },
  toast: { borderRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 10 },
  toastGradient: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 22, paddingVertical: 14, borderRadius: 28 },
  toastIconWrap: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(201, 185, 154, 0.2)', alignItems: 'center', justifyContent: 'center' },
  toastText: { fontFamily: 'Poppins_600SemiBold', color: COLORS.white, fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
  filterOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, flexDirection: 'row', justifyContent: 'flex-end' },
  filterBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  filterPanel: { width: SCREEN_WIDTH * 0.82, backgroundColor: COLORS.background },
  filterPanelInner: { flex: 1, paddingTop: Platform.OS === 'ios' ? 64 : 44, paddingHorizontal: 24 },
  filterHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 },
  filterTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, fontWeight: '900', color: COLORS.dark, letterSpacing: -0.5 },
  filterActiveCount: { fontSize: 12, color: COLORS.green, fontWeight: '600', marginTop: 4 },
  filterClose: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.lighterGray, alignItems: 'center', justifyContent: 'center' },
  filterDivider: { height: 1, backgroundColor: COLORS.lighterGray, marginVertical: 20 },
  filterSectionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 14, fontWeight: '800', color: COLORS.dark, letterSpacing: 0.3, marginBottom: 4 },
  filterSectionSub: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray, marginBottom: 14 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.lighterGray },
  filterChipActive: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  filterChipText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.dark, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.white, fontWeight: '700' },
  filterFooter: { flexDirection: 'row', gap: 12, paddingVertical: 20, borderTopWidth: 1, borderTopColor: COLORS.lighterGray },
  clearButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 18, borderWidth: 1.5, borderColor: COLORS.green },
  clearButtonText: { fontFamily: 'Poppins_600SemiBold', color: COLORS.green, fontSize: 13, fontWeight: '700' },
  applyButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.green, paddingVertical: 14, borderRadius: 18 },
  applyButtonText: { fontFamily: 'Poppins_700Bold', color: COLORS.white, fontSize: 13, fontWeight: '800' },
  cartOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, justifyContent: 'flex-end' },
  cartBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  cartSheet: { backgroundColor: COLORS.offWhite, borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: SCREEN_HEIGHT * 0.82, paddingBottom: Platform.OS === 'ios' ? 38 : 24 },
  cartHandle: { width: 44, height: 4, borderRadius: 2, backgroundColor: COLORS.lightGray, alignSelf: 'center', marginTop: 14, marginBottom: 4 },
  cartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: COLORS.lighterGray },
  cartTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, fontWeight: '900', color: COLORS.dark, letterSpacing: -0.3 },
  cartItemCount: { fontSize: 12, color: COLORS.gray, fontWeight: '600', marginTop: 2 },
  cartCloseBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.lighterGray, alignItems: 'center', justifyContent: 'center' },
  cartEmpty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 4 },
  cartEmptyIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.lighterGray, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cartEmptyTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 17, fontWeight: '800', color: COLORS.dark },
  cartEmptyText: { fontFamily: 'Poppins_400Regular', marginTop: 4, fontSize: 13, color: COLORS.gray },
  cartEmptyBtn: { marginTop: 24, backgroundColor: COLORS.green, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 24 },
  cartEmptyBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  cartList: { maxHeight: SCREEN_HEIGHT * 0.38 },
  cartItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.lighterGray },
  cartItemImage: { width: 64, height: 64, borderRadius: 16, backgroundColor: COLORS.lighterGray },
  cartItemInfo: { flex: 1, marginLeft: 14 },
  cartItemName: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, fontWeight: '700', color: COLORS.dark, marginBottom: 2, letterSpacing: -0.1 },
  cartItemCategory: { fontFamily: 'Poppins_500Medium', fontSize: 10, color: COLORS.grayLight, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  cartItemPrice: { fontFamily: 'Poppins_700Bold', fontSize: 15, fontWeight: '900', color: COLORS.green, marginBottom: 10, letterSpacing: -0.2 },
  cartQtyRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.goldLight, alignItems: 'center', justifyContent: 'center' },
  qtyDisplay: { minWidth: 32, alignItems: 'center' },
  qtyText: { fontFamily: 'Poppins_700Bold', fontSize: 14, fontWeight: '900', color: COLORS.dark },
  deleteBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.redLight, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  cartFooter: { paddingHorizontal: 24, paddingTop: 8 },
  cartFooterDivider: { height: 1, backgroundColor: COLORS.lighterGray, marginBottom: 16 },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  subtotalLabel: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray, fontWeight: '500' },
  subtotalValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: COLORS.dark, fontWeight: '600' },
  shippingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  shippingLabel: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray, fontWeight: '500' },
  shippingFree: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.greenMuted, fontWeight: '700' },
  totalDivider: { height: 1, backgroundColor: COLORS.lightGray, marginBottom: 14 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: COLORS.dark, fontWeight: '700' },
  totalValue: { fontFamily: 'Poppins_700Bold', fontSize: 24, fontWeight: '900', color: COLORS.green, letterSpacing: -0.5 },
  checkoutBtn: { borderRadius: 20, overflow: 'hidden' },
  checkoutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 17, borderRadius: 20 },
  checkoutBtnText: { fontFamily: 'Poppins_700Bold', color: COLORS.white, fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },
  checkoutArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' },
});