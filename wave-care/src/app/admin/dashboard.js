import React, {
  useState,
  useCallback,
  useRef,
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
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { create } from 'zustand';
import { useUser } from '../../contexts/UserContext';
import { router } from 'expo-router';

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
// MOCK DATA
// ─────────────────────────────────────────────

const MOCK_ORDERS = [
  { id: 'ORD-001', client: 'Ana Lima',       email: 'ana.lima@email.com',       total: 189.90, status: 'pending',   date: '2025-01-10', items: ['Shampoo Wave Care', 'Condicionador Deep'],              address: 'Rua das Flores, 123 – SP'   },
  { id: 'ORD-002', client: 'Carlos Melo',    email: 'carlos.melo@email.com',    total: 95.00,  status: 'confirmed', date: '2025-01-09', items: ['Máscara Hidratante'],                                    address: 'Av. Paulista, 1000 – SP'    },
  { id: 'ORD-003', client: 'Beatriz Costa',  email: 'beatriz.costa@email.com',  total: 320.50, status: 'shipped',   date: '2025-01-08', items: ['Kit Verão', 'Óleo Capilar'],                             address: 'Rua do Comércio, 55 – RJ'  },
  { id: 'ORD-004', client: 'Diego Silva',    email: 'diego.silva@email.com',    total: 65.00,  status: 'delivered', date: '2025-01-05', items: ['Finalizador Wave'],                                      address: 'Rua Nova, 77 – MG'          },
  { id: 'ORD-005', client: 'Fernanda Rocha', email: 'fernanda.rocha@email.com', total: 450.00, status: 'pending',   date: '2025-01-11', items: ['Shampoo Wave Care', 'Condicionador Deep', 'Máscara'],    address: 'Rua das Acácias, 45 – SP'  },
];

const MOCK_PRODUCTS = [
  { id: 'PROD-001', name: 'Shampoo Wave Care',         price: 89.90,  category: 'Cabelo',     stock: 42, active: true  },
  { id: 'PROD-002', name: 'Condicionador Deep',         price: 99.90,  category: 'Cabelo',     stock: 5,  active: true  },
  { id: 'PROD-003', name: 'Máscara Hidratante Intensa', price: 149.90, category: 'Tratamento', stock: 20, active: true  },
  { id: 'PROD-004', name: 'Óleo Capilar Brilho',        price: 75.00,  category: 'Styling',    stock: 0,  active: false },
];

const MOCK_BLOGS = [
  { id: 'POST-001', title: 'Guia completo para cuidados capilares', excerpt: 'Aprenda as melhores práticas para manter seus cabelos saudáveis.',      status: 'published', date: '2025-01-08', views: 1240, author: 'Dra. Ana Paula'  },
  { id: 'POST-002', title: 'Rotina capilar para cabelos cacheados',  excerpt: 'Um guia detalhado para quem busca definição e hidratação duradoura.', status: 'published', date: '2025-01-03', views: 870,  author: 'Carlos Silva'   },
  { id: 'POST-003', title: 'Lançamentos Coleção Inverno 2025',       excerpt: 'Conheça os novos produtos para os meses mais frios do ano.',           status: 'draft',     date: '2025-01-12', views: 0,    author: 'Mariana Santos' },
];

const MOCK_CHATS = [
  {
    id: 'CHAT-001', clientName: 'Ana Lima', clientEmail: 'ana.lima@email.com',
    lastMessage: 'Meu pedido está com atraso na entrega?', unread: 2, status: 'open', online: true,
    messages: [
      { id: 'm1', from: 'client', text: 'Olá! Fiz o pedido ORD-001 há 5 dias e ainda não recebi.', time: '10:30' },
      { id: 'm2', from: 'admin',  text: 'Olá Ana! Deixa-me verificar o status do seu pedido.',      time: '10:35' },
      { id: 'm3', from: 'client', text: 'Meu pedido está com atraso na entrega?',                    time: '10:40' },
    ],
  },
  {
    id: 'CHAT-002', clientName: 'Carlos Melo', clientEmail: 'carlos.melo@email.com',
    lastMessage: 'Muito obrigado pelo suporte!', unread: 0, status: 'resolved', online: false,
    messages: [
      { id: 'm4', from: 'client', text: 'Gostaria de realizar uma troca de produto.', time: '09:00' },
      { id: 'm5', from: 'admin',  text: 'Claro! Informe o número do pedido.',         time: '09:05' },
      { id: 'm6', from: 'client', text: 'Muito obrigado pelo suporte!',               time: '09:20' },
    ],
  },
];

const MOCK_NOTIFICATIONS = [
  { id: 'N001', type: 'order', icon: 'bag-handle-outline',   title: 'Novo pedido recebido',      body: 'ORD-005 – Fernanda Rocha – R$ 450,00',   time: '14:32', read: false },
  { id: 'N002', type: 'stock', icon: 'alert-circle-outline', title: 'Estoque crítico',            body: 'Condicionador Deep – apenas 5 unidades', time: '13:10', read: false },
  { id: 'N003', type: 'chat',  icon: 'chatbubble-outline',   title: 'Nova mensagem de Ana Lima', body: 'Meu pedido está com atraso na entrega?', time: '10:40', read: true  },
  { id: 'N004', type: 'order', icon: 'bag-handle-outline',   title: 'Pedido entregue',           body: 'ORD-004 – Diego Silva',                  time: '09:00', read: true  },
];

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

const NEXT_STATUS = { pending: 'confirmed', confirmed: 'shipped', shipped: 'delivered' };

const TABS = [
  { key: 'dashboard', label: 'Início',   icon: 'home-outline',        iconActive: 'home'        },
  { key: 'orders',    label: 'Pedidos',  icon: 'bag-outline',         iconActive: 'bag'         },
  { key: 'products',  label: 'Produtos', icon: 'pricetag-outline',    iconActive: 'pricetag'    },
  { key: 'blog',      label: 'Blog',     icon: 'newspaper-outline',   iconActive: 'newspaper'   },
  { key: 'chat',      label: 'Suporte',  icon: 'chatbubbles-outline', iconActive: 'chatbubbles' },
  { key: 'users',     label: 'Usuários', icon: 'people-outline',      iconActive: 'people'      },
];

// ─────────────────────────────────────────────
// ZUSTAND STORE
// ─────────────────────────────────────────────

const useStore = create((set, get) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  orders: [...MOCK_ORDERS],
  updateOrderStatus: (orderId) => {
    const { orders } = get();
    const order = orders.find((o) => o.id === orderId);
    const nextStatus = NEXT_STATUS[order?.status];
    if (!nextStatus) return;
    if (nextStatus === 'confirmed') get().addNotification({ type: 'order', icon: 'checkmark-circle-outline', title: 'Pedido confirmado', body: `${orderId} – ${order.client}` });
    if (nextStatus === 'delivered') get().addNotification({ type: 'order', icon: 'ribbon-outline', title: 'Pedido entregue', body: `${orderId} – ${order.client}` });
    set({ orders: orders.map((o) => o.id === orderId ? { ...o, status: nextStatus } : o) });
  },
  cancelOrder: (orderId) => set({ orders: get().orders.map((o) => o.id === orderId ? { ...o, status: 'cancelled' } : o) }),

  products: [...MOCK_PRODUCTS],
  toggleProduct: (productId) => set({ products: get().products.map((p) => p.id === productId ? { ...p, active: !p.active } : p) }),

  blogs: [...MOCK_BLOGS],
  toggleBlog: (blogId) => set({ blogs: get().blogs.map((b) => b.id === blogId ? { ...b, status: b.status === 'published' ? 'draft' : 'published' } : b) }),

  chats: [...MOCK_CHATS],
  selectedChatId: MOCK_CHATS[0]?.id,
  setSelectedChatId: (id) => set({ selectedChatId: id }),
  sendMessage: (chatId, text) => {
    const msg = { id: `msg-${Date.now()}`, from: 'admin', text, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
    set({ chats: get().chats.map((c) => c.id === chatId ? { ...c, messages: [...c.messages, msg], lastMessage: text, unread: 0 } : c) });
  },
  toggleChatStatus: (chatId) => set({ chats: get().chats.map((c) => c.id === chatId ? { ...c, status: c.status === 'open' ? 'resolved' : 'open' } : c) }),

  notifications: [...MOCK_NOTIFICATIONS],
  notifModalVisible: false,
  setNotifModalVisible: (v) => set({ notifModalVisible: v }),
  addNotification: (notif) => {
    const newNotif = { id: `N-${Date.now()}`, ...notif, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), read: false };
    set({ notifications: [newNotif, ...get().notifications] });
  },
  markNotifRead: (id) => set({ notifications: get().notifications.map((n) => n.id === id ? { ...n, read: true } : n) }),
  markAllNotifRead: () => set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) }),
  clearNotifications: () => set({ notifications: [] }),
}));

// ─────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────

function useDashboardMetrics() {
  const { orders, products, chats } = useStore();
  return useMemo(() => {
    const activeOrders   = orders.filter((o) => o.status !== 'cancelled');
    const revenueTotal   = activeOrders.reduce((s, o) => s + o.total, 0);
    const pendingOrders  = orders.filter((o) => o.status === 'pending').length;
    const activeProducts = products.filter((p) => p.active).length;
    const lowStock       = products.filter((p) => p.stock > 0 && p.stock <= 8).length;
    const outOfStock     = products.filter((p) => p.stock === 0).length;
    const openChats      = chats.filter((c) => c.status === 'open').length;
    const totalUnread    = chats.reduce((s, c) => s + c.unread, 0);
    return { revenueTotal, pendingOrders, activeProducts, lowStock, outOfStock, openChats, totalUnread };
  }, [orders, products, chats]);
}

const toBRL = (v) => `R$ ${v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
const toDateBR = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

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

const Avatar = ({ name = '?', size = 44, bg = C.primaryGhost, textColor = C.primary }) => (
  <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
    <Text style={[s.avatarText, { color: textColor, fontSize: size * 0.38 }]}>{name.charAt(0).toUpperCase()}</Text>
  </View>
);

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

// ─────────────────────────────────────────────
// LOGOUT MODAL
// ─────────────────────────────────────────────

const LogoutModal = ({ visible, onConfirm, onCancel, loading }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={s.logoutOverlay}>
      <Animated.View entering={FadeInDown.duration(300).springify()} style={s.logoutModal}>
        {/* Ícone */}
        <LinearGradient colors={[C.dangerBg, '#fff']} style={s.logoutIconWrap}>
          <View style={s.logoutIconCircle}>
            <Ionicons name="log-out-outline" size={32} color={C.danger} />
          </View>
        </LinearGradient>

        <Text style={s.logoutTitle}>Encerrar sessão</Text>
        <Text style={s.logoutBody}>
          Você será desconectado do painel administrativo. Deseja continuar?
        </Text>

        <View style={s.logoutActions}>
          {/* Cancelar */}
          <TouchableOpacity style={s.logoutCancelBtn} onPress={onCancel} disabled={loading} activeOpacity={0.75}>
            <Text style={s.logoutCancelText}>Voltar</Text>
          </TouchableOpacity>

          {/* Confirmar */}
          <TouchableOpacity style={[s.logoutConfirmBtn, loading && { opacity: 0.7 }]} onPress={onConfirm} disabled={loading} activeOpacity={0.8}>
            <LinearGradient colors={[C.danger, '#A93226']} style={s.logoutConfirmGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {loading
                ? <Text style={s.logoutConfirmText}>Saindo...</Text>
                : <>
                    <Ionicons name="log-out-outline" size={16} color="#FFF" />
                    <Text style={s.logoutConfirmText}>Sair da conta</Text>
                  </>
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  </Modal>
);

// ─────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────

const AppHeader = () => {
  const { notifications, setNotifModalVisible } = useStore();
  const { logout } = useUser();
  const unread = notifications.filter((n) => !n.read).length;

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const pulse = useSharedValue(1);
  useEffect(() => {
    if (unread > 0) {
      pulse.value = withRepeat(withSequence(withTiming(1.3, { duration: 400 }), withTiming(1.0, { duration: 400 })), 3, false);
    } else {
      pulse.value = 1;
    }
  }, [unread]);

  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);
    try {
      if (typeof logout === 'function') {
        await logout();
      }
      setLogoutModalVisible(false);
      // Pequeno delay para garantir que o estado seja limpo antes de navegar
      setTimeout(() => {
        try {
          router.replace('/seja-bem-vindo');
        } catch (navErr) {
          console.warn('Erro ao navegar após logout:', navErr?.message);
          // Tenta rota alternativa
          router.replace('/');
        }
      }, 100);
    } catch (err) {
      console.error('Erro no logout:', err);
      setLogoutLoading(false);
      Alert.alert('Erro', 'Não foi possível encerrar a sessão. Tente novamente.');
    }
  };

  return (
    <>
      <View style={s.header}>
        <View>
          <Text style={s.headerBrand}>Wave Care</Text>
          <Text style={s.headerSub}>Painel Administrativo</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Notificações */}
          <PressableScale onPress={() => setNotifModalVisible(true)}>
            <View style={s.headerIconBtn}>
              <Ionicons name="notifications-outline" size={22} color={C.ink} />
              {unread > 0 && (
                <Animated.View style={[s.bellBadge, badgeStyle]}>
                  <Text style={s.bellBadgeText}>{unread > 9 ? '9+' : unread}</Text>
                </Animated.View>
              )}
            </View>
          </PressableScale>

          {/* Botão de Logout */}
          <TouchableOpacity
            onPress={() => setLogoutModalVisible(true)}
            activeOpacity={0.75}
            style={[s.headerIconBtn, s.logoutIconBtn]}
          >
            <Ionicons name="log-out-outline" size={20} color={C.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <LogoutModal
        visible={logoutModalVisible}
        onConfirm={handleLogoutConfirm}
        onCancel={() => !logoutLoading && setLogoutModalVisible(false)}
        loading={logoutLoading}
      />
    </>
  );
};

// ─────────────────────────────────────────────
// NOTIFICATIONS MODAL
// ─────────────────────────────────────────────

const NotifModal = () => {
  const { notifications, notifModalVisible, setNotifModalVisible, markNotifRead, markAllNotifRead, clearNotifications } = useStore();
  const unread = notifications.filter((n) => !n.read).length;
  const notifTypeColor = { order: C.primary, stock: C.warning, chat: C.purple };

  return (
    <Modal visible={notifModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setNotifModalVisible(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.background }}>
        <View style={s.modalHeader}>
          <View>
            <Text style={s.modalTitle}>Notificações</Text>
            {unread > 0 && <Text style={s.modalSubtitle}>{unread} não lida{unread > 1 ? 's' : ''}</Text>}
          </View>
          <View style={s.modalHeaderActions}>
            {unread > 0 && (
              <TouchableOpacity onPress={markAllNotifRead} style={s.modalAction}>
                <Text style={s.modalActionText}>Ler todas</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setNotifModalVisible(false)} style={s.modalCloseBtn}>
              <Ionicons name="close" size={22} color={C.ink} />
            </TouchableOpacity>
          </View>
        </View>

        {notifications.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="notifications-off-outline" size={56} color={C.inkTertiary} />
            <Text style={s.emptyTitle}>Nenhuma notificação</Text>
            <Text style={s.emptySub}>Você está em dia com tudo ✨</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(n) => n.id}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item: n }) => (
              <TouchableOpacity onPress={() => markNotifRead(n.id)} activeOpacity={0.75}>
                <View style={[s.notifItem, !n.read && s.notifItemUnread]}>
                  <View style={[s.notifIconBox, { backgroundColor: (notifTypeColor[n.type] || C.primary) + '18' }]}>
                    <Ionicons name={n.icon} size={20} color={notifTypeColor[n.type] || C.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.notifTitle, !n.read && { color: C.ink }]}>{n.title}</Text>
                    <Text style={s.notifBody} numberOfLines={1}>{n.body}</Text>
                    <Text style={s.notifTime}>{n.time}</Text>
                  </View>
                  {!n.read && <View style={s.notifDot} />}
                </View>
              </TouchableOpacity>
            )}
            ListFooterComponent={notifications.length > 0 ? (
              <TouchableOpacity style={s.clearBtn} onPress={clearNotifications}>
                <Text style={s.clearBtnText}>Limpar todas</Text>
              </TouchableOpacity>
            ) : null}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// TAB BAR
// ─────────────────────────────────────────────

const TabBar = () => {
  const { activeTab, setActiveTab, orders, chats } = useStore();
  const getBadge = useCallback((key) => {
    if (key === 'orders') return orders.filter((o) => o.status === 'pending').length;
    if (key === 'chat')   return chats.reduce((s, c) => s + c.unread, 0);
    return 0;
  }, [orders, chats]);

  return (
    <View style={s.tabBar}>
      {TABS.map((tab) => {
        const active = activeTab === tab.key;
        const badge  = getBadge(tab.key);
        return <TabItem key={tab.key} tab={tab} active={active} badge={badge} onPress={() => setActiveTab(tab.key)} />;
      })}
    </View>
  );
};

const TabItem = ({ tab, active, badge, onPress }) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value     = withSpring(active ? 1.1 : 1,  { damping: 12 });
    translateY.value = withSpring(active ? -2 : 0, { damping: 12 });
  }, [active]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { translateY: translateY.value }] }));

  return (
    <TouchableOpacity style={s.tabItem} onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[s.tabInner, animStyle]}>
        {active && <LinearGradient colors={C.gradPrimary} style={s.tabActiveIndicator} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />}
        <Ionicons name={active ? tab.iconActive : tab.icon} size={22} color={active ? C.primary : C.inkTertiary} />
        <Text style={[s.tabLabel, active && s.tabLabelActive]}>{tab.label}</Text>
        {badge > 0 && (
          <View style={s.tabBadge}>
            <Text style={s.tabBadgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─────────────────────────────────────────────
// DASHBOARD SCREEN
// ─────────────────────────────────────────────

const DashboardScreen = () => {
  const { orders, chats, notifications, setActiveTab } = useStore();
  const metrics = useDashboardMetrics();
  const recentOrders = orders.slice(0, 4);
  const recentNotifs = notifications.slice(0, 3);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.screenContent}>
      <Animated.View entering={FadeInDown.delay(50).duration(400)}>
        <LinearGradient colors={C.gradPrimary} style={s.welcomeCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={s.welcomeLabel}>Bem-vinda de volta</Text>
          <Text style={s.welcomeTitle}>Wave Care ✦</Text>
          <Text style={s.welcomeSub}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          <View style={s.welcomeOrb} />
        </LinearGradient>
      </Animated.View>

      <View style={s.metricsGrid}>
        <MetricCard label="Receita Total"     value={toBRL(metrics.revenueTotal)}   icon="trending-up-outline" color={C.success} delay={100} />
        <MetricCard label="Pedidos Pendentes" value={String(metrics.pendingOrders)} icon="hourglass-outline"   color={C.warning} delay={150} />
        <MetricCard label="Produtos Ativos"   value={String(metrics.activeProducts)} icon="pricetag-outline"   color={C.info}    delay={200} />
        <MetricCard label="Chats Abertos"     value={String(metrics.openChats)}     icon="chatbubbles-outline" color={C.purple}  delay={250} />
      </View>

      {(metrics.lowStock > 0 || metrics.outOfStock > 0) && (
        <Animated.View entering={FadeInDown.delay(300).duration(350)}>
          <View style={s.alertsRow}>
            {metrics.outOfStock > 0 && (
              <View style={[s.alertChip, { backgroundColor: C.dangerBg }]}>
                <Ionicons name="alert-circle-outline" size={14} color={C.danger} />
                <Text style={[s.alertChipText, { color: C.danger }]}>{metrics.outOfStock} produto{metrics.outOfStock > 1 ? 's' : ''} esgotado{metrics.outOfStock > 1 ? 's' : ''}</Text>
              </View>
            )}
            {metrics.lowStock > 0 && (
              <View style={[s.alertChip, { backgroundColor: C.warningBg }]}>
                <Ionicons name="warning-outline" size={14} color={C.warning} />
                <Text style={[s.alertChipText, { color: C.warning }]}>{metrics.lowStock} com estoque baixo</Text>
              </View>
            )}
          </View>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(350).duration(350)}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Pedidos Recentes</Text>
          <TouchableOpacity onPress={() => setActiveTab('orders')}><Text style={s.sectionLink}>Ver todos</Text></TouchableOpacity>
        </View>
        <Card pa={0}>
          {recentOrders.map((order, i) => (
            <React.Fragment key={order.id}>
              {i > 0 && <Divider />}
              <View style={s.orderRow}>
                <View style={[s.orderRowIcon, { backgroundColor: C.primaryGhost }]}>
                  <Ionicons name="bag-outline" size={16} color={C.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.orderRowId}>{order.id}</Text>
                  <Text style={s.orderRowClient}>{order.client}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={s.orderRowTotal}>{toBRL(order.total)}</Text>
                  <StatusBadge status={order.status} size="xs" />
                </View>
              </View>
            </React.Fragment>
          ))}
        </Card>
      </Animated.View>

      {recentNotifs.length > 0 && (
        <Animated.View entering={FadeInDown.delay(400).duration(350)}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Notificações</Text>
            <TouchableOpacity onPress={() => useStore.getState().setNotifModalVisible(true)}><Text style={s.sectionLink}>Ver todas</Text></TouchableOpacity>
          </View>
          <Card pa={0}>
            {recentNotifs.map((n, i) => (
              <React.Fragment key={n.id}>
                {i > 0 && <Divider />}
                <View style={[s.notifRow, !n.read && { backgroundColor: C.primaryGhost + '60' }]}>
                  <View style={[s.notifRowIcon, { backgroundColor: C.primary + '15' }]}>
                    <Ionicons name={n.icon} size={16} color={C.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.notifRowTitle}>{n.title}</Text>
                    <Text style={s.notifRowBody} numberOfLines={1}>{n.body}</Text>
                  </View>
                  <Text style={s.notifRowTime}>{n.time}</Text>
                </View>
              </React.Fragment>
            ))}
          </Card>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(450).duration(350)}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>Suporte Ativo</Text>
          <TouchableOpacity onPress={() => setActiveTab('chat')}><Text style={s.sectionLink}>Ver todos</Text></TouchableOpacity>
        </View>
        <Card pa={0}>
          {chats.filter((c) => c.status === 'open').map((chat, i) => (
            <React.Fragment key={chat.id}>
              {i > 0 && <Divider />}
              <View style={s.chatRow}>
                <View style={{ position: 'relative' }}>
                  <Avatar name={chat.clientName} size={42} />
                  {chat.online && <View style={s.onlineDot} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.chatRowName}>{chat.clientName}</Text>
                  <Text style={s.chatRowMsg} numberOfLines={1}>{chat.lastMessage}</Text>
                </View>
                {chat.unread > 0 && <View style={s.unreadBadge}><Text style={s.unreadBadgeText}>{chat.unread}</Text></View>}
              </View>
            </React.Fragment>
          ))}
          {chats.filter((c) => c.status === 'open').length === 0 && (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={s.emptySub}>Nenhum chat em aberto ✨</Text>
            </View>
          )}
        </Card>
      </Animated.View>
    </ScrollView>
  );
};

const MetricCard = ({ label, value, icon, color, delay = 0 }) => (
  <Animated.View entering={FadeInDown.delay(delay).duration(350).springify()} style={s.metricCard}>
    <View style={[s.metricIconBox, { backgroundColor: color + '18' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={s.metricValue}>{value}</Text>
    <Text style={s.metricLabel}>{label}</Text>
  </Animated.View>
);

// ─────────────────────────────────────────────
// ORDERS SCREEN
// ─────────────────────────────────────────────

const OrdersScreen = () => {
  const { orders, updateOrderStatus, cancelOrder } = useStore();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { key: 'all', label: 'Todos' }, { key: 'pending', label: 'Pendente' },
    { key: 'confirmed', label: 'Confirmado' }, { key: 'shipped', label: 'Enviado' },
    { key: 'delivered', label: 'Entregue' }, { key: 'cancelled', label: 'Cancelado' },
  ];

  const filtered = useMemo(() => orders.filter((o) => {
    const matchFilter = activeFilter === 'all' || o.status === activeFilter;
    const matchSearch = search.length === 0 || o.id.toLowerCase().includes(search.toLowerCase()) || o.client.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  }), [orders, search, activeFilter]);

  const handleCancel = (order) => {
    Alert.alert('Cancelar Pedido', `Deseja cancelar o pedido ${order.id} de ${order.client}?`, [
      { text: 'Não', style: 'cancel' },
      { text: 'Cancelar pedido', style: 'destructive', onPress: () => cancelOrder(order.id) },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.screenContent} stickyHeaderIndices={[0]}>
        <View style={s.stickySearchBar}>
          <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar pedido ou cliente..." />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtersRow}>
            {filters.map((f) => <FilterPill key={f.key} label={f.label} active={activeFilter === f.key} onPress={() => setActiveFilter(f.key)} />)}
          </ScrollView>
        </View>

        <Text style={s.resultsCount}>{filtered.length} pedido{filtered.length !== 1 ? 's' : ''}</Text>

        {filtered.map((order, i) => {
          const canUpdate     = !!NEXT_STATUS[order.status];
          const isCancellable = order.status !== 'cancelled' && order.status !== 'delivered';
          const next    = NEXT_STATUS[order.status];
          const nextCfg = next ? ORDER_STATUS[next] : null;

          return (
            <Animated.View key={order.id} entering={FadeInDown.delay(i * 60).duration(350)}>
              <Card style={s.orderCard} pa={0}>
                <LinearGradient colors={[C.surface, C.surfaceAlt]} style={s.orderCardHeader}>
                  <View>
                    <Text style={s.orderCardId}>{order.id}</Text>
                    <Text style={s.orderCardDate}>{toDateBR(order.date)}</Text>
                  </View>
                  <StatusBadge status={order.status} />
                </LinearGradient>

                <View style={s.orderCardBody}>
                  <View style={s.orderClientRow}>
                    <Avatar name={order.client} size={36} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.orderClientName}>{order.client}</Text>
                      <Text style={s.orderClientEmail}>{order.email}</Text>
                    </View>
                  </View>
                  <View style={s.orderMeta}>
                    <Ionicons name="location-outline" size={13} color={C.inkTertiary} />
                    <Text style={s.orderMetaText}>{order.address}</Text>
                  </View>
                  <View style={s.orderItems}>
                    {order.items.map((item, idx) => (
                      <View key={idx} style={s.orderItemChip}><Text style={s.orderItemChipText}>{item}</Text></View>
                    ))}
                  </View>
                  <View style={s.orderCardFooter}>
                    <Text style={s.orderCardTotal}>{toBRL(order.total)}</Text>
                    <View style={s.orderCardActions}>
                      {isCancellable && (
                        <PressableScale onPress={() => handleCancel(order)}>
                          <View style={s.btnDangerOutline}><Text style={s.btnDangerOutlineText}>Cancelar</Text></View>
                        </PressableScale>
                      )}
                      {canUpdate && nextCfg && (
                        <PressableScale onPress={() => updateOrderStatus(order.id)}>
                          <LinearGradient colors={C.gradPrimary} style={s.btnPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Ionicons name={nextCfg.icon} size={14} color="#FFF" />
                            <Text style={s.btnPrimaryText}>→ {nextCfg.label}</Text>
                          </LinearGradient>
                        </PressableScale>
                      )}
                    </View>
                  </View>
                </View>
              </Card>
            </Animated.View>
          );
        })}

        {filtered.length === 0 && (
          <View style={s.emptyState}>
            <Ionicons name="bag-outline" size={52} color={C.inkTertiary} />
            <Text style={s.emptyTitle}>Nenhum pedido encontrado</Text>
            <Text style={s.emptySub}>Tente ajustar a busca ou filtros</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ─────────────────────────────────────────────
// PRODUCTS SCREEN
// ─────────────────────────────────────────────

const ProductsScreen = () => {
  const { products, toggleProduct } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filters = [
    { key: 'all', label: 'Todos' }, { key: 'active', label: 'Ativos' },
    { key: 'inactive', label: 'Inativos' }, { key: 'low', label: 'Estoque Baixo' }, { key: 'out', label: 'Esgotados' },
  ];

  const filtered = useMemo(() => products.filter((p) => {
    const matchSearch = search.length === 0 || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ? true : filter === 'active' ? p.active && p.stock > 0 : filter === 'inactive' ? !p.active : filter === 'low' ? p.stock > 0 && p.stock <= 8 : filter === 'out' ? p.stock === 0 : true;
    return matchSearch && matchFilter;
  }), [products, search, filter]);

  const stockColor = (p) => p.stock === 0 ? C.danger : p.stock <= 8 ? C.warning : C.success;
  const stockLabel = (p) => p.stock === 0 ? 'Esgotado' : `${p.stock} un.`;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.screenContent} stickyHeaderIndices={[0]}>
        <View style={s.stickySearchBar}>
          <SearchInput value={search} onChangeText={setSearch} placeholder="Buscar produto..." />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtersRow}>
            {filters.map((f) => <FilterPill key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />)}
          </ScrollView>
        </View>

        <View style={s.actionBarRow}>
          <Text style={s.resultsCount}>{filtered.length} produto{filtered.length !== 1 ? 's' : ''}</Text>
          <PressableScale onPress={() => Alert.alert('Em breve', 'Módulo de criação de produtos disponível em breve.')}>
            <LinearGradient colors={C.gradPrimary} style={s.addBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={s.addBtnText}>Novo</Text>
            </LinearGradient>
          </PressableScale>
        </View>

        {filtered.map((product, i) => (
          <Animated.View key={product.id} entering={FadeInDown.delay(i * 60).duration(350)}>
            <Card pa={0} style={s.productCard}>
              {product.stock === 0 && (
                <View style={s.productOutBadge}><Text style={s.productOutBadgeText}>ESGOTADO</Text></View>
              )}
              <View style={s.productCardInner}>
                <View style={[s.productThumb, { backgroundColor: C.primary + '12' }]}>
                  <Ionicons name="flask-outline" size={24} color={C.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.productName}>{product.name}</Text>
                  <Text style={s.productCategory}>{product.category}</Text>
                  <View style={s.productMeta}>
                    <Text style={s.productPrice}>{toBRL(product.price)}</Text>
                    <View style={[s.stockBadge, { backgroundColor: stockColor(product) + '18' }]}>
                      <View style={[s.stockDot, { backgroundColor: stockColor(product) }]} />
                      <Text style={[s.stockText, { color: stockColor(product) }]}>{stockLabel(product)}</Text>
                    </View>
                  </View>
                </View>
                <View style={s.productCardActions}>
                  <PressableScale onPress={() => toggleProduct(product.id)}>
                    <View style={[s.toggleBtn, product.active ? s.toggleBtnOn : s.toggleBtnOff]}>
                      <Text style={[s.toggleBtnText, product.active ? s.toggleBtnTextOn : s.toggleBtnTextOff]}>
                        {product.active ? 'Ativo' : 'Inativo'}
                      </Text>
                    </View>
                  </PressableScale>
                  <TouchableOpacity style={s.editIconBtn} onPress={() => Alert.alert('Editar produto', 'Módulo de edição em breve.')}>
                    <Ionicons name="create-outline" size={18} color={C.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}

        {filtered.length === 0 && (
          <View style={s.emptyState}>
            <Ionicons name="pricetag-outline" size={52} color={C.inkTertiary} />
            <Text style={s.emptyTitle}>Nenhum produto encontrado</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ─────────────────────────────────────────────
// BLOG SCREEN
// ─────────────────────────────────────────────

const BlogScreen = () => {
  const { blogs, toggleBlog } = useStore();
  const [filter, setFilter] = useState('all');
  const filters = [{ key: 'all', label: 'Todos' }, { key: 'published', label: 'Publicados' }, { key: 'draft', label: 'Rascunhos' }];
  const filtered = useMemo(() => filter === 'all' ? blogs : blogs.filter((b) => b.status === filter), [blogs, filter]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.screenContent}>
      <View style={s.actionBarRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {filters.map((f) => <FilterPill key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />)}
          </View>
        </ScrollView>
        <PressableScale onPress={() => Alert.alert('Em breve', 'Editor de artigos em breve.')}>
          <LinearGradient colors={C.gradPrimary} style={s.addBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="add" size={18} color="#FFF" />
            <Text style={s.addBtnText}>Novo</Text>
          </LinearGradient>
        </PressableScale>
      </View>

      {filtered.map((post, i) => {
        const pub = post.status === 'published';
        return (
          <Animated.View key={post.id} entering={FadeInDown.delay(i * 70).duration(350)}>
            <Card pa={0} style={s.blogCard}>
              <LinearGradient colors={pub ? [C.success + '22', C.success + '08'] : [C.warning + '22', C.warning + '08']} style={s.blogCardTop}>
                <View style={[s.blogStatusPill, { backgroundColor: pub ? C.successBg : C.warningBg }]}>
                  <View style={[s.statusDotRaw, { backgroundColor: pub ? C.success : C.warning }]} />
                  <Text style={[s.blogStatusText, { color: pub ? C.success : C.warning }]}>{pub ? 'Publicado' : 'Rascunho'}</Text>
                </View>
                <Text style={s.blogDate}>{toDateBR(post.date)}</Text>
              </LinearGradient>
              <View style={{ padding: 16 }}>
                <Text style={s.blogTitle}>{post.title}</Text>
                <Text style={s.blogAuthor}>por {post.author}</Text>
                <Text style={s.blogExcerpt} numberOfLines={2}>{post.excerpt}</Text>
                {pub && (
                  <View style={s.blogViewsRow}>
                    <Ionicons name="eye-outline" size={14} color={C.inkTertiary} />
                    <Text style={s.blogViewsText}>{post.views.toLocaleString('pt-BR')} visualizações</Text>
                  </View>
                )}
                <View style={s.blogActions}>
                  <PressableScale onPress={() => toggleBlog(post.id)} style={{ flex: 1 }}>
                    <LinearGradient colors={pub ? [C.warning + 'DD', C.warning] : C.gradPrimary} style={s.blogToggleBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      <Text style={s.blogToggleBtnText}>{pub ? 'Despublicar' : 'Publicar'}</Text>
                    </LinearGradient>
                  </PressableScale>
                  <TouchableOpacity style={s.blogEditBtn} onPress={() => Alert.alert('Editar artigo', 'Editor em breve.')}>
                    <Ionicons name="create-outline" size={16} color={C.primary} />
                    <Text style={s.blogEditBtnText}>Editar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
};

// ─────────────────────────────────────────────
// CHAT SCREEN
// ─────────────────────────────────────────────

const ChatScreen = () => {
  const { chats, selectedChatId, setSelectedChatId, sendMessage, toggleChatStatus } = useStore();
  const [inputMessage, setInputMessage] = useState('');
  const [searchChat, setSearchChat] = useState('');
  const [showList, setShowList] = useState(true);
  const scrollRef = useRef(null);

  const selectedChat = chats.find((c) => c.id === selectedChatId);
  const filteredChats = useMemo(() => chats.filter((c) => searchChat.length === 0 || c.clientName.toLowerCase().includes(searchChat.toLowerCase())), [chats, searchChat]);

  const handleSend = () => {
    if (!inputMessage.trim() || !selectedChat) return;
    sendMessage(selectedChat.id, inputMessage.trim());
    setInputMessage('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  };

  const openChat = (chatId) => {
    setSelectedChatId(chatId);
    if (!IS_TABLET) setShowList(false);
  };

  const ChatList = () => (
    <View style={s.chatListContainer}>
      <View style={s.chatListHeader}>
        <Text style={s.chatListTitle}>Conversas</Text>
        <View style={[s.unreadBadge, { marginLeft: 8 }]}>
          <Text style={s.unreadBadgeText}>{chats.reduce((sum, c) => sum + c.unread, 0)}</Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 12, marginBottom: 8 }}>
        <SearchInput value={searchChat} onChangeText={setSearchChat} placeholder="Buscar conversa..." />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredChats.map((chat) => (
          <TouchableOpacity key={chat.id} style={[s.chatListItem, selectedChatId === chat.id && s.chatListItemActive]} onPress={() => openChat(chat.id)} activeOpacity={0.75}>
            <View style={{ position: 'relative' }}>
              <Avatar name={chat.clientName} size={48} />
              {chat.online && <View style={s.onlineDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.chatListNameRow}>
                <Text style={s.chatListName}>{chat.clientName}</Text>
                {chat.unread > 0 && <View style={s.unreadBadge}><Text style={s.unreadBadgeText}>{chat.unread}</Text></View>}
              </View>
              <Text style={s.chatListMsg} numberOfLines={1}>{chat.lastMessage}</Text>
              <Text style={[s.chatListStatus, chat.status === 'open' ? { color: C.success } : { color: C.inkTertiary }]}>
                {chat.status === 'open' ? '● Aberto' : '○ Resolvido'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const ChatWindow = () => (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      {selectedChat ? (
        <>
          <View style={s.chatWindowHeader}>
            {!IS_TABLET && (
              <TouchableOpacity onPress={() => setShowList(true)} style={{ marginRight: 8 }}>
                <Ionicons name="arrow-back" size={22} color={C.primary} />
              </TouchableOpacity>
            )}
            <View style={{ position: 'relative', marginRight: 10 }}>
              <Avatar name={selectedChat.clientName} size={38} />
              {selectedChat.online && <View style={[s.onlineDot, { width: 10, height: 10 }]} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.chatWindowName}>{selectedChat.clientName}</Text>
              <Text style={s.chatWindowSub}>{selectedChat.online ? 'online agora' : selectedChat.clientEmail}</Text>
            </View>
            <PressableScale onPress={() => toggleChatStatus(selectedChat.id)}>
              <View style={[s.chatStatusBtn, selectedChat.status === 'open' ? { backgroundColor: C.successBg } : { backgroundColor: C.warningBg }]}>
                <Text style={[s.chatStatusBtnText, selectedChat.status === 'open' ? { color: C.success } : { color: C.warning }]}>
                  {selectedChat.status === 'open' ? 'Resolver' : 'Reabrir'}
                </Text>
              </View>
            </PressableScale>
          </View>

          <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={s.messagesContent} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
            {selectedChat.messages.map((msg, i) => {
              const isAdmin = msg.from === 'admin';
              return (
                <Animated.View key={msg.id} entering={FadeInDown.delay(i * 30).duration(250)} style={[s.msgRow, isAdmin && s.msgRowAdmin]}>
                  {!isAdmin && <Avatar name={selectedChat.clientName} size={30} />}
                  <View style={[s.msgBubble, isAdmin && s.msgBubbleAdmin]}>
                    <Text style={[s.msgText, isAdmin && s.msgTextAdmin]}>{msg.text}</Text>
                    <Text style={[s.msgTime, isAdmin && s.msgTimeAdmin]}>{msg.time}</Text>
                  </View>
                </Animated.View>
              );
            })}
          </ScrollView>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={s.msgInputBar}>
              <TextInput style={s.msgInput} value={inputMessage} onChangeText={setInputMessage} placeholder="Escreva uma mensagem..." placeholderTextColor={C.inkTertiary} multiline maxHeight={100} />
              <PressableScale onPress={handleSend} disabled={!inputMessage.trim()}>
                <LinearGradient colors={inputMessage.trim() ? C.gradPrimary : [C.border, C.border]} style={s.sendBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Ionicons name="send" size={18} color={inputMessage.trim() ? '#FFF' : C.inkTertiary} />
                </LinearGradient>
              </PressableScale>
            </View>
          </KeyboardAvoidingView>
        </>
      ) : (
        <View style={s.emptyState}>
          <Ionicons name="chatbubbles-outline" size={52} color={C.inkTertiary} />
          <Text style={s.emptyTitle}>Selecione uma conversa</Text>
        </View>
      )}
    </View>
  );

  if (IS_TABLET) {
    return <View style={{ flex: 1, flexDirection: 'row' }}><ChatList /><ChatWindow /></View>;
  }

  return showList ? <ChatList /> : <ChatWindow />;
};

// ─────────────────────────────────────────────
// USERS SCREEN
// ─────────────────────────────────────────────

const UsersScreen = () => (
  <View style={s.emptyState}>
    <LinearGradient colors={C.gradPrimary} style={[s.emptyIconBox, { marginBottom: 16 }]}>
      <Ionicons name="people-outline" size={32} color="#FFF" />
    </LinearGradient>
    <Text style={s.emptyTitle}>Gestão de Usuários</Text>
    <Text style={s.emptySub}>Módulo disponível em breve</Text>
  </View>
);

// ─────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────

const SCREENS = {
  dashboard: DashboardScreen,
  orders:    OrdersScreen,
  products:  ProductsScreen,
  blog:      BlogScreen,
  chat:      ChatScreen,
  users:     UsersScreen,
};

export default function AdminDashboard() {
  const { activeTab } = useStore();
  const Screen = SCREENS[activeTab] || DashboardScreen;

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.background} />
      <AppHeader />
      <Animated.View key={activeTab} entering={FadeIn.duration(250)} style={{ flex: 1 }}>
        <Screen />
      </Animated.View>
      <TabBar />
      <NotifModal />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, ...SHADOW.xs },
  headerBrand: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: C.primary, letterSpacing: 0.5 },
  headerSub:   { fontFamily: 'Poppins_400Regular', fontSize: 11, color: C.inkTertiary, marginTop: -2 },
  headerIconBtn: { width: 42, height: 42, borderRadius: R.full, backgroundColor: C.surfaceAlt, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  logoutIconBtn: { backgroundColor: C.dangerBg, borderWidth: 1, borderColor: C.danger + '30' },

  bellBadge: { position: 'absolute', top: 6, right: 6, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: C.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: C.surface },
  bellBadgeText: { fontFamily: 'Poppins_700Bold', fontSize: 9, color: '#FFF' },

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

  // Notifications Modal
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  modalTitle:    { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: C.ink },
  modalSubtitle: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: C.inkTertiary, marginTop: 2 },
  modalHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalAction:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: R.full, backgroundColor: C.primaryGhost },
  modalActionText: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: C.primary },
  modalCloseBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  notifItem:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14, borderBottomWidth: 1, borderBottomColor: C.borderLight },
  notifItemUnread: { backgroundColor: C.primaryGhost + '50' },
  notifIconBox:   { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  notifTitle:     { fontFamily: 'Poppins_500Medium', fontSize: 13, color: C.inkSecondary, marginBottom: 2 },
  notifBody:      { fontFamily: 'Poppins_400Regular', fontSize: 12, color: C.inkTertiary, marginBottom: 2 },
  notifTime:      { fontFamily: 'Poppins_400Regular', fontSize: 11, color: C.inkTertiary },
  notifDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary },
  clearBtn:       { margin: 20, paddingVertical: 12, borderRadius: R.full, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  clearBtnText:   { fontFamily: 'Poppins_500Medium', fontSize: 13, color: C.inkTertiary },

  // Tab Bar
  tabBar: { flexDirection: 'row', backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 24 : 8, ...SHADOW.sm },
  tabItem: { flex: 1, alignItems: 'center' },
  tabInner: { alignItems: 'center', position: 'relative', paddingTop: 4, gap: 3 },
  tabActiveIndicator: { position: 'absolute', top: -8, width: 32, height: 3, borderRadius: 2 },
  tabLabel:       { fontFamily: 'Poppins_400Regular', fontSize: 10, color: C.inkTertiary },
  tabLabelActive: { fontFamily: 'Poppins_500Medium', color: C.primary },
  tabBadge: { position: 'absolute', top: -2, right: -10, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: C.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabBadgeText: { fontFamily: 'Poppins_700Bold', fontSize: 9, color: '#FFF' },

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

  // Alerts
  alertsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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

  // Notif Row (dashboard)
  notifRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderRadius: R.md },
  notifRowIcon:  { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  notifRowTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: C.ink, marginBottom: 2 },
  notifRowBody:  { fontFamily: 'Poppins_400Regular', fontSize: 11, color: C.inkTertiary },
  notifRowTime:  { fontFamily: 'Poppins_400Regular', fontSize: 11, color: C.inkTertiary, minWidth: 40, textAlign: 'right' },

  // Chat Row (dashboard)
  chatRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  chatRowName: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: C.ink, marginBottom: 2 },
  chatRowMsg:  { fontFamily: 'Poppins_400Regular', fontSize: 12, color: C.inkTertiary },

  // Avatar
  avatar:    { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Poppins_700Bold' },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: C.success, borderWidth: 2, borderColor: C.surface },

  // Status Badge
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.full },
  statusDot:   { width: 6, height: 6, borderRadius: 3 },
  statusText:  { fontFamily: 'Poppins_500Medium', fontSize: 11 },
  statusDotRaw: { width: 6, height: 6, borderRadius: 3 },

  // Unread Badge
  unreadBadge:     { backgroundColor: C.primary, borderRadius: R.full, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  unreadBadgeText: { fontFamily: 'Poppins_700Bold', fontSize: 10, color: '#FFF' },

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
  btnPrimary:           { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: R.lg },
  btnPrimaryText:       { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#FFF' },
  btnDangerOutline:     { paddingHorizontal: 14, paddingVertical: 9, borderRadius: R.lg, borderWidth: 1, borderColor: C.danger + '60', backgroundColor: C.dangerBg },
  btnDangerOutlineText: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: C.danger },

  // Order Card
  orderCard: { overflow: 'hidden' },
  orderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  orderCardId:   { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: C.ink },
  orderCardDate: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: C.inkTertiary, marginTop: 2 },
  orderCardBody: { padding: 16, gap: 12 },
  orderClientRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderClientName:  { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: C.ink },
  orderClientEmail: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: C.inkTertiary },
  orderMeta:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderMetaText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: C.inkTertiary, flex: 1 },
  orderItems:    { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  orderItemChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.full, backgroundColor: C.primaryGhost, borderWidth: 1, borderColor: C.primary + '25' },
  orderItemChipText: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: C.primaryLight },
  orderCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: C.borderLight, paddingTop: 12, marginTop: 4 },
  orderCardTotal:   { fontFamily: 'Poppins_700Bold', fontSize: 16, color: C.primary },
  orderCardActions: { flexDirection: 'row', gap: 8 },

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
  toggleBtn:        { paddingHorizontal: 14, paddingVertical: 6, borderRadius: R.full },
  toggleBtnOn:      { backgroundColor: C.successBg },
  toggleBtnOff:     { backgroundColor: C.dangerBg },
  toggleBtnText:    { fontFamily: 'Poppins_500Medium', fontSize: 12 },
  toggleBtnTextOn:  { color: C.success },
  toggleBtnTextOff: { color: C.danger },
  editIconBtn:      { width: 32, height: 32, borderRadius: 16, backgroundColor: C.primaryGhost, alignItems: 'center', justifyContent: 'center' },

  // Blog Card
  blogCard: { overflow: 'hidden' },
  blogCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  blogStatusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: R.full },
  blogStatusText: { fontFamily: 'Poppins_500Medium', fontSize: 11 },
  blogDate:       { fontFamily: 'Poppins_400Regular', fontSize: 11, color: C.inkTertiary },
  blogTitle:      { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: C.ink, marginBottom: 4, lineHeight: 22 },
  blogAuthor:     { fontFamily: 'Poppins_400Regular', fontSize: 12, color: C.inkTertiary, marginBottom: 8, fontStyle: 'italic' },
  blogExcerpt:    { fontFamily: 'Poppins_400Regular', fontSize: 13, color: C.inkSecondary, lineHeight: 20, marginBottom: 10 },
  blogViewsRow:   { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
  blogViewsText:  { fontFamily: 'Poppins_400Regular', fontSize: 11, color: C.inkTertiary },
  blogActions:    { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 4 },
  blogToggleBtn:  { paddingVertical: 10, borderRadius: R.full, alignItems: 'center' },
  blogToggleBtnText: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: '#FFF' },
  blogEditBtn:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, paddingVertical: 10, borderRadius: R.full, backgroundColor: C.primaryGhost },
  blogEditBtnText: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: C.primary },

  // Chat
  chatListContainer: { width: IS_TABLET ? 320 : SCREEN_WIDTH, backgroundColor: C.surface, borderRightWidth: IS_TABLET ? 1 : 0, borderRightColor: C.border, flex: IS_TABLET ? undefined : 1 },
  chatListHeader:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  chatListTitle:     { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: C.ink },
  chatListItem:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: C.borderLight },
  chatListItemActive: { backgroundColor: C.primaryGhost },
  chatListNameRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  chatListName:      { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: C.ink },
  chatListMsg:       { fontFamily: 'Poppins_400Regular', fontSize: 12, color: C.inkTertiary, marginBottom: 3 },
  chatListStatus:    { fontFamily: 'Poppins_500Medium', fontSize: 11 },
  chatWindowHeader:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, ...SHADOW.xs },
  chatWindowName:    { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: C.ink },
  chatWindowSub:     { fontFamily: 'Poppins_400Regular', fontSize: 11, color: C.inkTertiary, marginTop: 1 },
  chatStatusBtn:     { paddingHorizontal: 12, paddingVertical: 7, borderRadius: R.full, marginLeft: 'auto' },
  chatStatusBtnText: { fontFamily: 'Poppins_500Medium', fontSize: 12 },
  messagesContent:   { padding: 16, gap: 12 },
  msgRow:       { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowAdmin:  { justifyContent: 'flex-end' },
  msgBubble:    { maxWidth: '72%', backgroundColor: C.surface, borderRadius: R.xl, borderBottomLeftRadius: 4, padding: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: C.border, ...SHADOW.xs },
  msgBubbleAdmin: { backgroundColor: C.primary, borderColor: C.primary, borderBottomLeftRadius: R.xl, borderBottomRightRadius: 4 },
  msgText:      { fontFamily: 'Poppins_400Regular', fontSize: 14, color: C.ink, lineHeight: 20 },
  msgTextAdmin: { color: '#FFF' },
  msgTime:      { fontFamily: 'Poppins_400Regular', fontSize: 10, color: C.inkTertiary, marginTop: 4, alignSelf: 'flex-end' },
  msgTimeAdmin: { color: 'rgba(255,255,255,0.65)' },
  msgInputBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, paddingBottom: Platform.OS === 'ios' ? 26 : 12 },
  msgInput:    { flex: 1, backgroundColor: C.surfaceAlt, borderRadius: R.full, paddingHorizontal: 18, paddingVertical: 10, fontFamily: 'Poppins_400Regular', fontSize: 14, color: C.ink, borderWidth: 1, borderColor: C.border },
  sendBtn:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  // Empty State
  emptyState:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
  emptyIconBox: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  emptyTitle:   { fontFamily: 'Poppins_600SemiBold', fontSize: 17, color: C.ink, textAlign: 'center' },
  emptySub:     { fontFamily: 'Poppins_400Regular', fontSize: 13, color: C.inkTertiary, textAlign: 'center' },
});