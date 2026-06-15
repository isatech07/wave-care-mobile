import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { useUser } from '../../contexts/UserContext';
import { router } from 'expo-router';
import api from '../../services/api';
import * as ImagePicker from 'expo-image-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────

const C = {
  primary:      '#2D5A45',
  primaryLight: '#4A7B64',
  primaryDark:  '#1E3F2F',
  primaryGhost: '#F0F7F4',
  gold:         '#C9A96E',
  background:   '#FAFAF8',
  surface:      '#FFFFFF',
  surfaceAlt:   '#F7F5F2',
  border:       '#EDE9E4',
  borderLight:  '#F5F2EF',
  ink:          '#1A1A1A',
  inkSecondary: '#5C5C5C',
  inkTertiary:  '#9B9B9B',
  success:      '#3D8B5E',
  successBg:    '#EAF5EE',
  warning:      '#C07B2A',
  warningBg:    '#FEF6EC',
  danger:       '#C0392B',
  dangerBg:     '#FDECEA',
  info:         '#2471A3',
  infoBg:       '#EBF5FB',
  purple:       '#7D3C98',
  purpleBg:     '#F5EEF8',
  gradPrimary:  ['#2D5A45', '#1E3F2F'],
  gradGold:     ['#C9A96E', '#A07840'],
  gradSurface:  ['#FFFFFF', '#F7F5F2'],
};

const SHADOW = {
  xs: { shadowColor: '#1A1A1A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3,  elevation: 1 },
  sm: { shadowColor: '#1A1A1A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8,  elevation: 3 },
  md: { shadowColor: '#1A1A1A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 16, elevation: 6 },
};

const R = { xs: 8, sm: 12, md: 16, lg: 20, xl: 28, xxl: 36, full: 999 };

// ─────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────

const ORDER_STATUS = {
  pending:   { label: 'Pendente',   bg: C.warningBg, color: C.warning, icon: 'time-outline'            },
  confirmed: { label: 'Confirmado', bg: C.infoBg,    color: C.info,    icon: 'checkmark-circle-outline' },
  shipped:   { label: 'Enviado',    bg: C.purpleBg,  color: C.purple,  icon: 'bicycle-outline'          },
  delivered: { label: 'Entregue',   bg: C.successBg, color: C.success, icon: 'ribbon-outline'           },
  cancelled: { label: 'Cancelado',  bg: C.dangerBg,  color: C.danger,  icon: 'close-circle-outline'     },
};

const TABS = [
  { key: 'dashboard', label: 'Início',   icon: 'home-outline',        iconActive: 'home'        },
  { key: 'orders',    label: 'Pedidos',  icon: 'bag-outline',         iconActive: 'bag'         },
  { key: 'products',  label: 'Produtos', icon: 'pricetag-outline',    iconActive: 'pricetag'    },
  { key: 'users',     label: 'Usuários', icon: 'people-outline',      iconActive: 'people'      },
];

// ─────────────────────────────────────────────
// ATOMIC COMPONENTS
// ─────────────────────────────────────────────

const PressableScale = ({ onPress, style, children, disabled }) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[animStyle, style]}>
      <TouchableOpacity activeOpacity={1} disabled={disabled}
        onPressIn={() => { scale.value = withSpring(0.95); }}
        onPressOut={() => { scale.value = withSpring(1.0); }}
        onPress={onPress}
      >{children}</TouchableOpacity>
    </Animated.View>
  );
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const cfg = ORDER_STATUS[status] || ORDER_STATUS.pending;
  const small = size === 'xs';
  return (
    <View style={[s.statusBadge, { backgroundColor: cfg.bg }, small && { paddingHorizontal: 8, paddingVertical: 3 }]}>
      <View style={[s.statusDot, { backgroundColor: cfg.color }, small && { width: 5, height: 5 }]} />
      <Text style={[s.statusText, { color: cfg.color }, small && { fontSize: 10 }]}>{cfg.label}</Text>
    </View>
  );
};

const Avatar = ({ name = '?', size = 44, bg = C.primaryGhost, textColor = C.primary, imageUrl = null }) => {
  if (imageUrl) {
    return (
      <Image source={{ uri: imageUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />
    );
  }
  return (
    <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[s.avatarText, { color: textColor, fontSize: size * 0.38 }]}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
};

const SearchInput = ({ value, onChangeText, placeholder = 'Buscar...' }) => (
  <View style={s.searchContainer}>
    <Ionicons name="search-outline" size={18} color={C.inkTertiary} style={s.searchIcon} />
    <TextInput style={s.searchInput} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={C.inkTertiary} />
    {value.length > 0 && (
      <TouchableOpacity onPress={() => onChangeText('')}>
        <Ionicons name="close-circle" size={18} color={C.inkTertiary} />
      </TouchableOpacity>
    )}
  </View>
);

const FilterPill = ({ label, active, onPress }) => (
  <PressableScale onPress={onPress}>
    <LinearGradient colors={active ? C.gradPrimary : [C.surface, C.surface]} style={[s.filterPill, !active && { borderColor: C.border, borderWidth: 1 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <Text style={[s.filterPillText, active && s.filterPillTextActive]}>{label}</Text>
    </LinearGradient>
  </PressableScale>
);

const Divider = ({ mx = 16 }) => <View style={[s.divider, { marginHorizontal: mx }]} />;

const Card = ({ children, style, pa = 16 }) => (
  <Animated.View entering={FadeInDown.duration(350).springify()} style={[s.card, { padding: pa }, style]}>
    {children}
  </Animated.View>
);

const LoadingOverlay = () => (
  <View style={s.loadingOverlay}>
    <ActivityIndicator size="large" color={C.primary} />
  </View>
);

// ─────────────────────────────────────────────
// LOGOUT MODAL
// ─────────────────────────────────────────────

const LogoutModal = ({ visible, onConfirm, onCancel, loading }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={s.logoutOverlay}>
      <Animated.View entering={FadeInDown.duration(300).springify()} style={s.logoutModal}>
        <LinearGradient colors={[C.dangerBg, '#fff']} style={s.logoutIconWrap}>
          <View style={s.logoutIconCircle}>
            <Ionicons name="log-out-outline" size={32} color={C.danger} />
          </View>
        </LinearGradient>
        <Text style={s.logoutTitle}>Encerrar sessão</Text>
        <Text style={s.logoutBody}>Você será desconectado. Deseja continuar?</Text>
        <View style={s.logoutActions}>
          <TouchableOpacity style={s.logoutCancelBtn} onPress={onCancel} disabled={loading}>
            <Text style={s.logoutCancelText}>Voltar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.logoutConfirmBtn, loading && { opacity: 0.7 }]} onPress={onConfirm} disabled={loading}>
            <LinearGradient colors={[C.danger, '#A93226']} style={s.logoutConfirmGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading ? <Text style={s.logoutConfirmText}>Saindo...</Text> : <><Ionicons name="log-out-outline" size={16} color="#FFF" /><Text style={s.logoutConfirmText}>Sair</Text></>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  </Modal>
);

// ─────────────────────────────────────────────
// PRODUCT FORM MODAL (COM IMAGEM)
// ─────────────────────────────────────────────

const ProductFormModal = ({ visible, onClose, onSave, editingProduct }) => {
  const isEdit = !!editingProduct;
  const [form, setForm] = useState({
    name: '', description: '', price: '', stock: '', category: '', season: '',
    image: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name:        editingProduct.name        ?? '',
        description: editingProduct.description ?? '',
        price:       String(editingProduct.price ?? ''),
        stock:       String(editingProduct.stock ?? ''),
        category:    editingProduct.category    ?? '',
        season:      editingProduct.season      ?? '',
        image:       editingProduct.image       ?? '',
      });
    } else {
      setForm({ name: '', description: '', price: '', stock: '', category: '', season: '', image: '' });
    }
  }, [editingProduct, visible]);

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para adicionar imagem.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: false,
    });
    if (!result.canceled && result.assets[0].uri) {
      setField('image', result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { Alert.alert('Erro', 'Nome do produto é obrigatório.'); return; }
    if (!form.price || isNaN(Number(form.price))) { Alert.alert('Erro', 'Preço inválido.'); return; }
    setSaving(true);
    try {
      // Prepara payload sem badge, com image
      const payload = {
        name:        form.name.trim(),
        description: form.description.trim(),
        price:       Number(form.price),
        stock:       Number(form.stock) || 0,
        category:    form.category.trim(),
        season:      form.season.trim(),
        image:       form.image.trim() || null,
      };
      await onSave(payload);
      onClose();
    } catch (e) {
      Alert.alert('Erro', e?.response?.data?.message ?? 'Não foi possível salvar o produto.');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'name',        label: 'Nome *',      placeholder: 'Ex: Shampoo Wave Care',  keyboard: 'default' },
    { key: 'description', label: 'Descrição',   placeholder: 'Breve descrição',        keyboard: 'default' },
    { key: 'price',       label: 'Preço (R$) *',placeholder: '0.00',                   keyboard: 'numeric' },
    { key: 'stock',       label: 'Estoque',     placeholder: '0',                      keyboard: 'numeric' },
    { key: 'category',    label: 'Categoria',   placeholder: 'Ex: Shampoo',            keyboard: 'default' },
    { key: 'season',      label: 'Estação',     placeholder: 'Ex: Verão',              keyboard: 'default' },
    { key: 'image',       label: 'URL da Imagem', placeholder: 'https://... ou deixe vazio', keyboard: 'default' },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
        <View style={s.formModalHeader}>
          <TouchableOpacity onPress={onClose} style={s.modalCloseBtn}>
            <Ionicons name="close" size={22} color={C.ink} />
          </TouchableOpacity>
          <Text style={s.formModalTitle}>{isEdit ? 'Editar Produto' : 'Novo Produto'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving} style={[s.formSaveBtn, saving && { opacity: 0.6 }]}>
            {saving ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={s.formSaveBtnText}>Salvar</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
          {fields.map(({ key, label, placeholder, keyboard }) => (
            <View key={key}>
              <Text style={s.fieldLabel}>{label}</Text>
              <TextInput
                style={s.fieldInput}
                value={form[key]}
                onChangeText={v => setField(key, v)}
                placeholder={placeholder}
                placeholderTextColor={C.inkTertiary}
                keyboardType={keyboard}
                multiline={key === 'description'}
                numberOfLines={key === 'description' ? 3 : 1}
              />
            </View>
          ))}
          <TouchableOpacity style={s.imagePickerBtn} onPress={pickImage}>
            <Ionicons name="images-outline" size={20} color={C.primary} />
            <Text style={s.imagePickerText}>Escolher imagem da galeria</Text>
          </TouchableOpacity>
          {form.image ? (
            <Image source={{ uri: form.image }} style={s.imagePreview} />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// ORDER STATUS MODAL
// ─────────────────────────────────────────────

const OrderStatusModal = ({ visible, order, onClose, onUpdate }) => {
  const [updating, setUpdating] = useState(false);
  if (!order) return null;

  const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  const handleStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await onUpdate(order.id, newStatus);
      onClose();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível atualizar o status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.logoutOverlay}>
        <Animated.View entering={FadeInDown.duration(300).springify()} style={[s.logoutModal, { maxWidth: 400 }]}>
          <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={s.logoutTitle}>Alterar Status</Text>
            <Text style={[s.logoutBody, { marginBottom: 0 }]}>Pedido #{order.id}</Text>
          </View>
          <ScrollView style={{ maxHeight: 380 }}>
            {statuses.map(status => {
              const cfg = ORDER_STATUS[status];
              const isCurrent = order.status === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[s.statusOption, isCurrent && { backgroundColor: C.primaryGhost }]}
                  onPress={() => !isCurrent && handleStatus(status)}
                  disabled={updating || isCurrent}
                >
                  <View style={[s.statusOptionDot, { backgroundColor: cfg.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.statusOptionLabel, isCurrent && { color: C.primary, fontFamily: 'Poppins_700Bold' }]}>{cfg.label}</Text>
                  </View>
                  {isCurrent && <Ionicons name="checkmark-circle" size={20} color={C.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={{ padding: 16 }}>
            <TouchableOpacity style={s.logoutCancelBtn} onPress={onClose} disabled={updating}>
              <Text style={s.logoutCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────

const AppHeader = ({ activeTab }) => {
  const { logout } = useUser();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      setLogoutModalVisible(false);
    } catch (err) {
      setLogoutLoading(false);
      Alert.alert('Erro', 'Não foi possível encerrar a sessão.');
    }
  };

  const tabTitles = { dashboard: 'Dashboard', orders: 'Pedidos', products: 'Produtos', users: 'Usuários' };

  return (
    <>
      <View style={s.header}>
        <View>
          <Text style={s.headerBrand}>Wave Care</Text>
          <Text style={s.headerSub}>{tabTitles[activeTab] ?? 'Admin'}</Text>
        </View>
        <TouchableOpacity onPress={() => setLogoutModalVisible(true)} style={[s.headerIconBtn, s.logoutIconBtn]}>
          <Ionicons name="log-out-outline" size={20} color={C.danger} />
        </TouchableOpacity>
      </View>
      <LogoutModal visible={logoutModalVisible} onConfirm={handleLogoutConfirm} onCancel={() => setLogoutModalVisible(false)} loading={logoutLoading} />
    </>
  );
};

// ─────────────────────────────────────────────
// TAB BAR
// ─────────────────────────────────────────────

const TabBar = ({ activeTab, setActiveTab }) => (
  <View style={s.tabBar}>
    {TABS.map((tab) => {
      const active = activeTab === tab.key;
      return <TabItem key={tab.key} tab={tab} active={active} onPress={() => setActiveTab(tab.key)} />;
    })}
  </View>
);

const TabItem = ({ tab, active, onPress }) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(active ? 1.1 : 1, { damping: 12 });
    translateY.value = withSpring(active ? -2 : 0, { damping: 12 });
  }, [active]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { translateY: translateY.value }] }));

  return (
    <TouchableOpacity style={s.tabItem} onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[s.tabInner, animStyle]}>
        {active && <LinearGradient colors={C.gradPrimary} style={s.tabActiveIndicator} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />}
        <Ionicons name={active ? tab.iconActive : tab.icon} size={22} color={active ? C.primary : C.inkTertiary} />
        <Text style={[s.tabLabel, active && s.tabLabelActive]}>{tab.label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────
// DASHBOARD SCREEN
// ─────────────────────────────────────────────

const DashboardScreen = ({ setActiveTab }) => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [o, p, u] = await Promise.all([
        api.get('/order').then(r => r.data).catch(() => []),
        api.get('/products').then(r => r.data).catch(() => []),
        api.get('/users').then(r => r.data).catch(() => []),
      ]);
      setOrders(Array.isArray(o) ? o : []);
      setProducts(Array.isArray(p) ? p : []);
      setUsers(Array.isArray(u) ? u : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, []);

  const metrics = useMemo(() => {
    const activeOrders = orders.filter(o => o.status !== 'cancelled');
    const revenueTotal = activeOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const activeProducts = products.filter(p => (p.stock ?? 0) > 0).length;
    const outOfStock = products.filter(p => (p.stock ?? 0) === 0).length;
    return { revenueTotal, pendingOrders, activeProducts, outOfStock, totalUsers: users.length };
  }, [orders, products, users]);

  const recentOrders = orders.slice(0, 5);
  const toBRL = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

  if (loading) return <LoadingOverlay />;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.screenContent} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} tintColor={C.primary} />}>
      <Animated.View entering={FadeInDown.delay(50).duration(400)}>
        <LinearGradient colors={C.gradPrimary} style={s.welcomeCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={s.welcomeLabel}>Painel Administrativo</Text>
          <Text style={s.welcomeTitle}>Wave Care ✦</Text>
          <Text style={s.welcomeSub}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </LinearGradient>
      </Animated.View>

      <View style={s.metricsGrid}>
        {[
          { label: 'Receita Total',    value: toBRL(metrics.revenueTotal),       icon: 'trending-up-outline', color: C.success },
          { label: 'Pedidos Pendentes',value: String(metrics.pendingOrders),      icon: 'hourglass-outline',   color: C.warning },
          { label: 'Produtos Ativos',  value: String(metrics.activeProducts),     icon: 'pricetag-outline',    color: C.info    },
          { label: 'Usuários',         value: String(metrics.totalUsers),         icon: 'people-outline',      color: C.purple  },
        ].map((m, i) => (
          <Animated.View key={m.label} entering={FadeInDown.delay(100 + i * 50).duration(350).springify()} style={s.metricCard}>
            <View style={[s.metricIconBox, { backgroundColor: m.color + '18' }]}>
              <Ionicons name={m.icon} size={20} color={m.color} />
            </View>
            <Text style={s.metricValue}>{m.value}</Text>
            <Text style={s.metricLabel}>{m.label}</Text>
          </Animated.View>
        ))}
      </View>

      {metrics.outOfStock > 0 && (
        <View style={[s.alertChip, { backgroundColor: C.dangerBg, marginBottom: 4 }]}>
          <Ionicons name="alert-circle-outline" size={14} color={C.danger} />
          <Text style={[s.alertChipText, { color: C.danger }]}>{metrics.outOfStock} produto(s) esgotado(s)</Text>
        </View>
      )}

      <Animated.View entering={FadeInDown.delay(350).duration(350)}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Pedidos Recentes</Text>
          <TouchableOpacity onPress={() => setActiveTab('orders')}><Text style={s.sectionLink}>Ver todos</Text></TouchableOpacity>
        </View>
        <Card pa={0}>
          {recentOrders.length === 0
            ? <View style={{ padding: 20, alignItems: 'center' }}><Text style={s.emptySub}>Nenhum pedido ainda</Text></View>
            : recentOrders.map((order, i) => (
              <React.Fragment key={order.id}>
                {i > 0 && <Divider />}
                <View style={s.orderRow}>
                  <View style={[s.orderRowIcon, { backgroundColor: C.primaryGhost }]}>
                    <Ionicons name="bag-outline" size={16} color={C.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.orderRowId}>#{order.id}</Text>
                    <Text style={s.orderRowClient}>{order.user?.name ?? 'Cliente'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={s.orderRowTotal}>{toBRL(order.total)}</Text>
                    <StatusBadge status={order.status} size="xs" />
                  </View>
                </View>
              </React.Fragment>
            ))
          }
        </Card>
      </Animated.View>
    </ScrollView>
  );
};

// ─────────────────────────────────────────────
// ORDERS SCREEN
// ─────────────────────────────────────────────

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [statusModal, setStatusModal] = useState({ visible: false, order: null });

  const fetchOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const { data } = await api.get('/order');
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os pedidos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    await api.put(`/order/${orderId}`, { status: newStatus });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const filters = [
    { key: 'all', label: 'Todos' }, { key: 'pending', label: 'Pendente' },
    { key: 'confirmed', label: 'Confirmado' }, { key: 'shipped', label: 'Enviado' },
    { key: 'delivered', label: 'Entregue' }, { key: 'cancelled', label: 'Cancelado' },
  ];

  const filtered = useMemo(() => orders.filter(o => {
    const matchFilter = activeFilter === 'all' || o.status === activeFilter;
    const clientName = o.user?.name ?? '';
    const matchSearch = search.length === 0
      || String(o.id).includes(search.toLowerCase())
      || clientName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  }), [orders, search, activeFilter]);

  const toBRL = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;
  const toDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '';

  if (loading) return <LoadingOverlay />;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.screenContent}
        stickyHeaderIndices={[0]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchOrders(true)} tintColor={C.primary} />}
      >
        <View style={s.stickySearchBar}>
          <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar pedido ou cliente..." />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtersRow}>
            {filters.map(f => <FilterPill key={f.key} label={f.label} active={activeFilter === f.key} onPress={() => setActiveFilter(f.key)} />)}
          </ScrollView>
        </View>

        <Text style={s.resultsCount}>{filtered.length} pedido(s)</Text>

        {filtered.map((order, i) => (
          <Animated.View key={order.id} entering={FadeInDown.delay(i * 50).duration(300)}>
            <Card style={s.orderCard} pa={0}>
              <LinearGradient colors={[C.surface, C.surfaceAlt]} style={s.orderCardHeader}>
                <View>
                  <Text style={s.orderCardId}>Pedido #{order.id}</Text>
                  <Text style={s.orderCardDate}>{toDate(order.createdAt)}</Text>
                </View>
                <StatusBadge status={order.status} />
              </LinearGradient>

              <View style={s.orderCardBody}>
                <View style={s.orderClientRow}>
                  <Avatar name={order.user?.name ?? 'C'} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.orderClientName}>{order.user?.name ?? 'Cliente'}</Text>
                    <Text style={s.orderClientEmail}>{order.user?.email ?? ''}</Text>
                  </View>
                </View>

                {order.items?.length > 0 && (
                  <View style={s.orderItems}>
                    {order.items.map((item, idx) => (
                      <View key={idx} style={s.orderItemChip}>
                        <Text style={s.orderItemChipText}>{item.product?.name ?? `Item ${idx + 1}`}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={s.orderCardFooter}>
                  <Text style={s.orderCardTotal}>{toBRL(order.total)}</Text>
                  <PressableScale onPress={() => setStatusModal({ visible: true, order })}>
                    <LinearGradient colors={C.gradPrimary} style={s.btnPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <Ionicons name="swap-horizontal-outline" size={14} color="#FFF" />
                      <Text style={s.btnPrimaryText}>Status</Text>
                    </LinearGradient>
                  </PressableScale>
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}

        {filtered.length === 0 && (
          <View style={s.emptyState}>
            <Ionicons name="bag-outline" size={52} color={C.inkTertiary} />
            <Text style={s.emptyTitle}>Nenhum pedido encontrado</Text>
          </View>
        )}
      </ScrollView>

      <OrderStatusModal
        visible={statusModal.visible}
        order={statusModal.order}
        onClose={() => setStatusModal({ visible: false, order: null })}
        onUpdate={handleUpdateStatus}
      />
    </View>
  );
};

// ─────────────────────────────────────────────
// PRODUCTS SCREEN (COM IMAGEM E NOME DO CLIENTE NOS PEDIDOS)
// ─────────────────────────────────────────────

const ProductsScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [formModal, setFormModal] = useState({ visible: false, product: null });
  const [deleteModal, setDeleteModal] = useState({ visible: false, product: null });

  const fetchProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, []);

  const handleSave = async (formData) => {
    const { product } = formModal;
    if (product) {
      const { data } = await api.put(`/products/${product.id}`, formData);
      setProducts(prev => prev.map(p => p.id === product.id ? data : p));
    } else {
      const { data } = await api.post('/products', formData);
      setProducts(prev => [data, ...prev]);
    }
  };

  const handleDelete = (product) => {
    setDeleteModal({ visible: true, product });
  };

  const confirmDelete = async () => {
    const product = deleteModal.product;
    setDeleteModal({ visible: false, product: null });
    try {
      await api.delete(`/products/${product.id}`);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      Alert.alert('Sucesso', 'Produto excluído');
    } catch (err) {
      Alert.alert('Erro', err?.response?.data?.message || 'Não foi possível excluir');
    }
  };

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'low', label: 'Estoque Baixo' },
    { key: 'out', label: 'Esgotados' },
  ];

  const filtered = useMemo(() => products.filter(p => {
    const matchSearch = search.length === 0
      || p.name.toLowerCase().includes(search.toLowerCase())
      || (p.category ?? '').toLowerCase().includes(search.toLowerCase());
    const stock = p.stock ?? 0;
    const matchFilter = filter === 'all' ? true : filter === 'low' ? stock > 0 && stock <= 8 : filter === 'out' ? stock === 0 : true;
    return matchSearch && matchFilter;
  }), [products, search, filter]);

  const stockColor = (p) => (p.stock ?? 0) === 0 ? C.danger : (p.stock ?? 0) <= 8 ? C.warning : C.success;
  const stockLabel = (p) => (p.stock ?? 0) === 0 ? 'Esgotado' : `${p.stock} un.`;
  const toBRL = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;

  if (loading) return <LoadingOverlay />;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.screenContent}
        stickyHeaderIndices={[0]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchProducts(true)} tintColor={C.primary} />}
      >
        <View style={s.stickySearchBar}>
          <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar produto..." />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtersRow}>
            {filters.map(f => <FilterPill key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />)}
          </ScrollView>
        </View>

        <View style={s.actionBarRow}>
          <Text style={s.resultsCount}>{filtered.length} produto(s)</Text>
          <PressableScale onPress={() => setFormModal({ visible: true, product: null })}>
            <LinearGradient colors={C.gradPrimary} style={s.addBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={s.addBtnText}>Novo Produto</Text>
            </LinearGradient>
          </PressableScale>
        </View>

   {filtered.map((product, i) => {
  // Gera a URL da imagem (pode ser removida se não precisar mais do log)
  const imageUrl = product.image
    ? (product.image.startsWith('http') ? product.image : `http://localhost:3002${product.image}`)
    : null;
  console.log(`🖼️ Produto: ${product.name} | URL:`, imageUrl);

  return (
    <Animated.View key={product.id} entering={FadeInDown.delay(i * 50).duration(300)}>
      <Card pa={0} style={s.productCard}>
        {(product.stock ?? 0) === 0 && (
          <View style={s.productOutBadge}><Text style={s.productOutBadgeText}>ESGOTADO</Text></View>
        )}
        <View style={s.productCardInner}>
          {/* Exibe a imagem do produto se existir, senão mostra ícone */}
          {product.image ? (
            <Image source={{ uri: imageUrl }} style={s.productImage} />
          ) : (
            <View style={[s.productThumb, { backgroundColor: C.primary + '12' }]}>
              <Ionicons name="flask-outline" size={24} color={C.primary} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={s.productName}>{product.name}</Text>
            {product.category && <Text style={s.productCategory}>{product.category}</Text>}
            <View style={s.productMeta}>
              <Text style={s.productPrice}>{toBRL(product.price)}</Text>
              <View style={[s.stockBadge, { backgroundColor: stockColor(product) + '18' }]}>
                <View style={[s.stockDot, { backgroundColor: stockColor(product) }]} />
                <Text style={[s.stockText, { color: stockColor(product) }]}>{stockLabel(product)}</Text>
              </View>
            </View>
          </View>
          <View style={s.productCardActions}>
            <TouchableOpacity style={s.editIconBtn} onPress={() => setFormModal({ visible: true, product })}>
              <Ionicons name="create-outline" size={18} color={C.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[s.editIconBtn, { backgroundColor: C.dangerBg }]} onPress={() => handleDelete(product)}>
              <Ionicons name="trash-outline" size={18} color={C.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
})}

        {filtered.length === 0 && (
          <View style={s.emptyState}>
            <Ionicons name="pricetag-outline" size={52} color={C.inkTertiary} />
            <Text style={s.emptyTitle}>Nenhum produto encontrado</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de exclusão fora do ScrollView */}
    {deleteModal.visible && (
      <View style={s.modalOverlay}>
        <View style={s.modalBox}>
          <Text style={s.modalTitle}>Excluir Produto</Text>
          <Text style={s.modalMessage}>
            Deseja excluir "{deleteModal.product?.name}"? Esta ação não pode ser desfeita.
          </Text>
          <View style={s.modalButtons}>
            <TouchableOpacity style={s.modalBtnCancel} onPress={() => setDeleteModal({ visible: false, product: null })}>
              <Text style={s.modalBtnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.modalBtnConfirm, { backgroundColor: C.danger }]} onPress={confirmDelete}>
              <Text style={s.modalBtnConfirmText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )}
      <ProductFormModal
        visible={formModal.visible}
        editingProduct={formModal.product}
        onClose={() => setFormModal({ visible: false, product: null })}
        onSave={handleSave}
      />
    </View>
  );
};

// ─────────────────────────────────────────────
// USERS SCREEN
// ─────────────────────────────────────────────

const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => users.filter(u =>
    search.length === 0
    || (u.name ?? '').toLowerCase().includes(search.toLowerCase())
    || (u.email ?? '').toLowerCase().includes(search.toLowerCase())
  ), [users, search]);

  const handleDeleteUser = (user) => {
    Alert.alert('Excluir Usuário', `Deseja excluir a conta de "${user.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/users/${user.id}`);
            setUsers(prev => prev.filter(u => u.id !== user.id));
          } catch { Alert.alert('Erro', 'Não foi possível excluir o usuário.'); }
        }
      },
    ]);
  };

  if (loading) return <LoadingOverlay />;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.screenContent}
      stickyHeaderIndices={[0]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchUsers(true)} tintColor={C.primary} />}
    >
      <View style={s.stickySearchBar}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar usuário..." />
      </View>

      <Text style={s.resultsCount}>{filtered.length} usuário(s)</Text>

      {filtered.map((user, i) => {
        const isExpanded = expanded === user.id;
        const isAdmin = user.role === 'admin';
        return (
          <Animated.View key={user.id} entering={FadeInDown.delay(i * 40).duration(300)}>
            <Card pa={0} style={{ overflow: 'hidden', marginBottom: 0 }}>
              <TouchableOpacity
                style={s.userCardHeader}
                onPress={() => setExpanded(isExpanded ? null : user.id)}
                activeOpacity={0.8}
              >
                <Avatar name={user.name ?? user.email ?? '?'} size={44} bg={isAdmin ? C.primary : C.primaryGhost} textColor={isAdmin ? '#FFF' : C.primary} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={s.userCardName}>{user.name ?? 'Sem nome'}</Text>
                    {isAdmin && <View style={s.adminBadge}><Text style={s.adminBadgeText}>Admin</Text></View>}
                  </View>
                  <Text style={s.userCardEmail}>{user.email}</Text>
                </View>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={C.inkTertiary} />
              </TouchableOpacity>

              {isExpanded && (
                <View style={s.userCardExpanded}>
                  <Divider mx={0} />
                  <View style={{ padding: 16, gap: 10 }}>
                    {[
                      { label: 'ID', value: String(user.id) },
                      { label: 'Telefone', value: user.telefone ?? 'Não informado' },
                      { label: 'Cidade', value: user.cidade ?? 'Não informado' },
                      { label: 'Role', value: user.role ?? 'user' },
                    ].map(({ label, value }) => (
                      <View key={label} style={s.userDetailRow}>
                        <Text style={s.userDetailLabel}>{label}</Text>
                        <Text style={s.userDetailValue}>{value}</Text>
                      </View>
                    ))}
                    {!isAdmin && (
                      <TouchableOpacity style={s.deleteUserBtn} onPress={() => handleDeleteUser(user)}>
                        <Ionicons name="trash-outline" size={16} color={C.danger} />
                        <Text style={s.deleteUserBtnText}>Excluir conta</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </Card>
          </Animated.View>
        );
      })}

      {filtered.length === 0 && (
        <View style={s.emptyState}>
          <Ionicons name="people-outline" size={52} color={C.inkTertiary} />
          <Text style={s.emptyTitle}>Nenhum usuário encontrado</Text>
        </View>
      )}
    </ScrollView>
  );
};

// ─────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────

const SCREENS = {
  dashboard: DashboardScreen,
  orders:    OrdersScreen,
  products:  ProductsScreen,
  users:     UsersScreen,
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const Screen = SCREENS[activeTab] || DashboardScreen;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />
      <AppHeader activeTab={activeTab} />
      <Animated.View key={activeTab} entering={FadeIn.duration(250)} style={{ flex: 1 }}>
        <Screen setActiveTab={setActiveTab} />
      </Animated.View>
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </SafeAreaView>
  );
}
// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },

  loadingOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.background },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, ...SHADOW.xs },
  headerBrand: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: C.primary, letterSpacing: 0.5 },
  headerSub:   { fontFamily: 'Poppins_400Regular', fontSize: 11, color: C.inkTertiary, marginTop: -2 },
  headerIconBtn: { width: 42, height: 42, borderRadius: R.full, backgroundColor: C.surfaceAlt, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  logoutIconBtn: { backgroundColor: C.dangerBg, borderWidth: 1, borderColor: C.danger + '30' },

  // Logout Modal
  logoutOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logoutModal: { width: '100%', maxWidth: 360, backgroundColor: C.surface, borderRadius: R.xl, overflow: 'hidden', ...SHADOW.md },
  logoutIconWrap: { alignItems: 'center', paddingTop: 32, paddingBottom: 20 },
  logoutIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: C.dangerBg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.danger + '30' },
  logoutTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: C.ink, textAlign: 'center', paddingHorizontal: 24, marginBottom: 10 },
  logoutBody:  { fontFamily: 'Poppins_400Regular', fontSize: 14, color: C.inkSecondary, textAlign: 'center', paddingHorizontal: 28, lineHeight: 22, marginBottom: 28 },
  logoutActions: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingBottom: 24 },
  logoutCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: R.lg, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  logoutCancelText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: C.inkSecondary },
  logoutConfirmBtn: { flex: 1.4, borderRadius: R.lg, overflow: 'hidden' },
  logoutConfirmGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  logoutConfirmText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#FFF' },

  // Status Modal
  statusOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 14, borderBottomWidth: 1, borderBottomColor: C.borderLight },
  statusOptionDot: { width: 12, height: 12, borderRadius: 6 },
  statusOptionLabel: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: C.ink },

  // Form Modal
  formModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.surface },
  formModalTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: C.ink },
  formSaveBtn: { backgroundColor: C.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: R.full },
  formSaveBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#FFF' },
  fieldLabel: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: C.inkSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 },
  fieldInput: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Poppins_400Regular', fontSize: 14, color: C.ink },

  // Modal shared
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surfaceAlt, alignItems: 'center', justifyContent: 'center' },

  // Tab Bar
  tabBar: { flexDirection: 'row', backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 24 : 8, ...SHADOW.sm },
  tabItem: { flex: 1, alignItems: 'center' },
  tabInner: { alignItems: 'center', position: 'relative', paddingTop: 4, gap: 3 },
  tabActiveIndicator: { position: 'absolute', top: -8, width: 32, height: 3, borderRadius: 2 },
  tabLabel:       { fontFamily: 'Poppins_400Regular', fontSize: 10, color: C.inkTertiary },
  tabLabelActive: { fontFamily: 'Poppins_500Medium', color: C.primary },

  // Screen Layout
  screenContent: { padding: 16, paddingBottom: 32, gap: 12 },

  // Welcome
  welcomeCard: { borderRadius: R.xl, padding: 24, marginBottom: 4, overflow: 'hidden', ...SHADOW.md },
  welcomeLabel: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  welcomeTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 28, color: '#FFF', letterSpacing: 0.5 },
  welcomeSub:   { fontFamily: 'Poppins_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6, textTransform: 'capitalize' },
  welcomeOrb:   { position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.07)' },

  // Metrics
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  metricCard:  { width: (SCREEN_WIDTH - 42) / 2, marginHorizontal: 5, marginBottom: 10, backgroundColor: C.surface, borderRadius: R.lg, padding: 16, borderWidth: 1, borderColor: C.border, ...SHADOW.xs },
  metricIconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  metricValue:   { fontFamily: 'Poppins_700Bold', fontSize: 20, color: C.ink, marginBottom: 2 },
  metricLabel:   { fontFamily: 'Poppins_400Regular', fontSize: 11, color: C.inkTertiary },

  // Alert
  alertChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: R.full },
  alertChipText: { fontFamily: 'Poppins_500Medium', fontSize: 12 },

  // Section
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, paddingHorizontal: 2 },
  sectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: C.ink },
  sectionLink:  { fontFamily: 'Poppins_500Medium', fontSize: 12, color: C.primary },

  // Card
  card: { backgroundColor: C.surface, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, ...SHADOW.xs },
  divider: { height: 1, backgroundColor: C.borderLight },

  // Order Row (dashboard)
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  orderRowIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  orderRowId:     { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: C.ink, marginBottom: 2 },
  orderRowClient: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: C.inkTertiary },
  orderRowTotal:  { fontFamily: 'Poppins_700Bold', fontSize: 13, color: C.primary, marginBottom: 4 },

  // Avatar
  avatar:    { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Poppins_700Bold' },

  // Status Badge
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.full },
  statusDot:   { width: 6, height: 6, borderRadius: 3 },
  statusText:  { fontFamily: 'Poppins_500Medium', fontSize: 11 },

  // Search
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surfaceAlt, borderRadius: R.full, paddingHorizontal: 14, paddingVertical: 10, gap: 8, borderWidth: 1, borderColor: C.border },
  searchIcon:  { marginRight: 2 },
  searchInput: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 13, color: C.ink, padding: 0 },

  // Filters
  stickySearchBar: { backgroundColor: C.background, paddingBottom: 8, gap: 10 },
  filtersRow:      { marginBottom: 2 },
  filterPill:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: R.full, marginRight: 8 },
  filterPillText:       { fontFamily: 'Poppins_500Medium', fontSize: 12, color: C.inkSecondary },
  filterPillTextActive: { color: '#FFF' },

  resultsCount: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: C.inkTertiary, marginBottom: 4 },
  actionBarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  addBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 9, borderRadius: R.full },
  addBtnText: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: '#FFF' },

  // Buttons
  btnPrimary:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: R.lg },
  btnPrimaryText: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#FFF' },

  // Order Card
  orderCard: { overflow: 'hidden' },
  orderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  orderCardId:   { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: C.ink },
  orderCardDate: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: C.inkTertiary, marginTop: 2 },
  orderCardBody: { padding: 16, gap: 12 },
  orderClientRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderClientName:  { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: C.ink },
  orderClientEmail: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: C.inkTertiary },
  orderItems:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  orderItemChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.full, backgroundColor: C.primaryGhost, borderWidth: 1, borderColor: C.primary + '25' },
  orderItemChipText: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: C.primaryLight },
  orderCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: C.borderLight, paddingTop: 12, marginTop: 4 },
  orderCardTotal:  { fontFamily: 'Poppins_700Bold', fontSize: 16, color: C.primary },

  // Product Card
  productCard: { overflow: 'hidden' },
  productOutBadge: { backgroundColor: C.dangerBg, paddingVertical: 4, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.danger + '30' },
  productOutBadgeText: { fontFamily: 'Poppins_700Bold', fontSize: 10, color: C.danger, letterSpacing: 1 },
  productCardInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  productThumb:     { width: 52, height: 52, borderRadius: R.md, alignItems: 'center', justifyContent: 'center' },
  productName:      { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: C.ink, marginBottom: 2 },
  productCategory:  { fontFamily: 'Poppins_400Regular', fontSize: 11, color: C.inkTertiary, marginBottom: 6 },
  productMeta:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  productPrice:     { fontFamily: 'Poppins_700Bold', fontSize: 14, color: C.primary },
  stockBadge:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.full },
  stockDot:         { width: 5, height: 5, borderRadius: 3 },
  stockText:        { fontFamily: 'Poppins_500Medium', fontSize: 11 },
  productCardActions: { alignItems: 'flex-end', gap: 8 },
  editIconBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: C.primaryGhost, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 999,
},

  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  modalMessage: { fontSize: 14, color: '#555', marginBottom: 24 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  modalBtnCancel: { flex: 1, paddingVertical: 12, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center' },
  modalBtnCancelText: { color: '#555', fontWeight: '600' },
  modalBtnConfirm: { flex: 1, paddingVertical: 12, backgroundColor: C.primary, borderRadius: 8, alignItems: 'center' },
  modalBtnConfirmText: { color: '#fff', fontWeight: '600' },

  // User Card
  userCardHeader:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  userCardName:    { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: C.ink },
  userCardEmail:   { fontFamily: 'Poppins_400Regular', fontSize: 12, color: C.inkTertiary, marginTop: 2 },
  userCardExpanded: {},
  userDetailRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userDetailLabel: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: C.inkTertiary },
  userDetailValue: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: C.ink },
  adminBadge:      { backgroundColor: C.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: R.full },
  adminBadgeText:  { fontFamily: 'Poppins_700Bold', fontSize: 9, color: '#FFF', letterSpacing: 0.5 },
  deleteUserBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: R.md, backgroundColor: C.dangerBg, alignSelf: 'flex-start' },
  deleteUserBtnText: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: C.danger },
  productImage: { width: 52, height: 52, borderRadius: R.md, resizeMode: 'cover' },

  // Empty State
  emptyState:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
  emptyTitle:   { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: C.ink, textAlign: 'center' },
  emptySub:     { fontFamily: 'Poppins_400Regular', fontSize: 13, color: C.inkTertiary, textAlign: 'center' },


});