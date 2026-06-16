import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../contexts/UserContext';
import { useOrderStore } from '../../stores/useOrderStore';
import { useRouter } from 'expo-router';
import { getMyQuizResult } from '../../services/quizService';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';

const TABS = ['dados', 'pedidos', 'favoritos', 'capilar', 'configuracoes'];
const GREEN = '#2D5A45';

const DIAGNOSIS_LABELS = {
  hydration: 'Hidratação Intensiva',
  reconstruction: 'Reconstrução Capilar',
  nutrition: 'Nutrição Profunda',
  maintenance: 'Manutenção Preventiva',
};

const HAIR_TYPE_LABELS = {
  liso: 'Liso',
  ondulado: 'Ondulado',
  cacheado: 'Cacheado',
  crespo: 'Crespo',
};

const SEASON_LABELS = {
  verao: 'Verão',
  outono: 'Outono',
  inverno: 'Inverno',
  primavera: 'Primavera',
};

const STATUS = {
  pending: { label: 'Aguardando', color: '#f59e0b', step: 0 },
  confirmed: { label: 'Confirmado', color: '#3b82f6', step: 1 },
  shipped: { label: 'Enviado', color: '#8b5cf6', step: 2 },
  delivered: { label: 'Entregue', color: '#10b981', step: 3 },
  canceled: { label: 'Cancelado', color: '#ef4444', step: 4 },
};

const STEPS = ['Aguardando', 'Confirmado', 'Enviado', 'Entregue', 'Cancelado'];

export default function Perfil() {
  const { user, logout, updateUser, deleteAccount } = useUser();
  const router = useRouter();
  const { orders, fetchOrders } = useOrderStore();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    PlayfairDisplay_700Bold,
  });

  const [modal, setModal] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: null,
    danger: false,
  });
  const [tab, setTab] = useState('dados');
  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar ?? null);
  const [filterStatus, setFilterStatus] = useState('all');

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.telefone ?? '',
    city: user?.cidade ?? '',
  });

  const [quizResult, setQuizResult] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    if (user?.id && !user.guest) {
      fetchOrders(user.id);
    }
  }, [user?.id]);

  const loadQuizResult = async () => {
    setQuizLoading(true);
    try {
      const cached = await AsyncStorage.getItem('wavecare_quiz_result');
      if (cached) setQuizResult(JSON.parse(cached));
      const remote = await getMyQuizResult();
      if (remote) {
        setQuizResult(remote);
        await AsyncStorage.setItem('wavecare_quiz_result', JSON.stringify(remote));
      }
    } catch (err) {
      console.log('Nenhum resultado de quiz encontrado:', err?.message);
    } finally {
      setQuizLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.guest) return;
    loadQuizResult();
  }, [user?.id]);

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user || user.guest) {
    return (
      <SafeAreaView style={styles.safeGuest}>
        <View style={styles.guestScreen}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={26}
              color={GREEN}
            />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
          <View style={styles.guestContent}>
            <View style={styles.guestIconCircle}>
              <Ionicons
                name="person-outline"
                size={48}
                color={GREEN}
              />
            </View>
            <Text style={styles.guestTitle}>Você está sem conta</Text>
            <Text style={styles.guestSubtitle}>
              Faça login para acessar seu perfil, pedidos e favoritos.
            </Text>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginBtnText}>Fazer Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => router.push('/cadastro')}
            >
              <Text style={styles.registerBtnText}>Criar Conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const getInitials = () =>
    user.name ? user.name.slice(0, 2).toUpperCase() : '?';

  const handleChangeAvatar = () => {
    Alert.alert('Foto de perfil', 'Escolha uma opção', [
      {
        text: 'Tirar foto',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Permissão negada', 'Precisamos de acesso à câmera.');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled) {
            const uri = result.assets[0].uri;
            setAvatar(uri);
            const updated = { ...user, avatar: uri };
            updateUser(updated);
            await AsyncStorage.setItem('wavecare_user', JSON.stringify(updated));
          }
        },
      },
      {
        text: 'Escolher da galeria',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Permissão negada', 'Precisamos de acesso à galeria.');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled) {
            const uri = result.assets[0].uri;
            setAvatar(uri);
            const updated = { ...user, avatar: uri };
            updateUser(updated);
            await AsyncStorage.setItem('wavecare_user', JSON.stringify(updated));
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const save = async () => {
    const updated = {
      ...user,
      name: form.name,
      email: form.email,
      telefone: form.phone,
      cidade: form.city,
    };
    try {
      await updateUser(updated);
      setEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso.');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil. Tente novamente.');
    }
  };

  const confirmLogout = () => {
    setModal({
      visible: true,
      title: 'Sair da conta',
      message: 'Deseja realmente sair da sua conta?',
      danger: true,
      onConfirm: async () => {
        setModal({ visible: false });
        await logout();
        router.replace('/seja-bem-vindo');
      },
    });
  };

  const confirmDeleteAccount = () => {
    setModal({
      visible: true,
      title: 'Excluir conta',
      message:
        'Esta ação é permanente e irreversível. Todos os seus dados serão apagados.',
      danger: true,
      onConfirm: async () => {
        setModal({ visible: false });
        try {
          await deleteAccount();
          router.replace('/seja-bem-vindo');
        } catch (e) {
          Alert.alert('Erro', 'Não foi possível excluir a conta. Tente novamente.');
        }
      },
    });
  };

  const renderDadosTab = () => {
    const USER_KEY_MAP = {
      name: 'name',
      email: 'email',
      phone: 'telefone',
      city: 'cidade',
    };
    return (
      <View style={styles.card}>
        {[
          {
            key: 'name',
            label: 'Nome',
            placeholder: 'Seu nome',
            keyboard: 'default',
          },
          {
            key: 'email',
            label: 'Email',
            placeholder: 'seu@email.com',
            keyboard: 'email-address',
          },
          {
            key: 'phone',
            label: 'Telefone',
            placeholder: '(00) 00000-0000',
            keyboard: 'phone-pad',
          },
          {
            key: 'city',
            label: 'Cidade',
            placeholder: 'Sua cidade',
            keyboard: 'default',
          },
        ].map(({ key, label, placeholder, keyboard }) => (
          <View key={key} style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={form[key]}
                onChangeText={(t) => setForm({ ...form, [key]: t })}
                placeholder={placeholder}
                keyboardType={keyboard}
                autoCapitalize={key === 'email' ? 'none' : 'sentences'}
              />
            ) : (
              <Text style={styles.fieldValue}>
                {user[USER_KEY_MAP[key]] || 'Não informado'}
              </Text>
            )}
          </View>
        ))}
        {editing ? (
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.btn, styles.btnSave]}
              onPress={save}
            >
              <Text style={styles.btnText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel]}
              onPress={() => setEditing(false)}
            >
              <Text style={[styles.btnText, { color: '#555' }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setEditing(true)}
            style={styles.editBtn}
          >
            <Ionicons
              name="create-outline"
              size={16}
              color={GREEN}
            />
            <Text style={styles.editText}>Editar dados</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

const renderPedidosTab = () => {
  if (!orders?.length) {
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="bag-outline"
          size={50}
          color="#ccc"
        />
        <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
        <TouchableOpacity
          style={styles.emptyAction}
          onPress={() => router.push('/(tabs)/loja')}
        >
          <Text style={styles.emptyActionText}>Ir para a loja</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filterOptions = [
    { key: 'all', label: 'Todos' },
    { key: 'pending', label: 'Pendentes' },
    { key: 'confirmed', label: 'Confirmados' },
    { key: 'shipped', label: 'Enviados' },
    { key: 'delivered', label: 'Entregues' },
  ].filter(
    (opt) =>
      opt.key === 'all' || orders.some((o) => o.status === opt.key)
  );

  const filtered =
    filterStatus === 'all'
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  const sortedOrders = [...filtered].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date || 0);
    const dateB = new Date(b.createdAt || b.date || 0);
    return dateA - dateB;
  });


  const getUserOrderNumber = (orderId) => {
    const allUserOrders = [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateA - dateB;
    });
    
    const index = allUserOrders.findIndex(
      (o) => (o.id === orderId) || (o._id === orderId)
    );
    
    return index >= 0 ? index + 1 : null;
  };

  const handleFinalizarPagamento = (order) => {
    router.push({
      pathname: '/pagamento',
      params: {
        orderId: order.id,
        resumo: JSON.stringify(order.items),
      },
    });
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {filterOptions.map((opt) => {
          const active = filterStatus === opt.key;
          const isPendingFilter =
            opt.key === 'pending' && orders.some((o) => o.status === 'pending');
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setFilterStatus(opt.key)}
              style={[
                styles.filterChip,
                active && styles.filterChipActive,
                isPendingFilter &&
                  !active &&
                  styles.filterChipPending,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                  isPendingFilter &&
                    !active &&
                    styles.filterChipTextPending,
                ]}
              >
                {opt.label}
                {isPendingFilter && !active ? ' ⚠' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filtered.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Nenhum pedido nessa categoria
          </Text>
        </View>
      )}

      {filtered.map((order, i) => {
        const config = STATUS[order.status] ?? STATUS.pending;
        const isPending = order.status === 'pending';
        const orderNumber = getUserOrderNumber(order.id);

        return (
          <View
            key={order.id ?? i}
            style={[
              styles.card,
              isPending && styles.cardPending,
            ]}
          >
            {isPending && (
              <View style={styles.pendingBanner}>
                <Ionicons
                  name="warning-outline"
                  size={14}
                  color="#92400e"
                />
                <Text style={styles.pendingBannerText}>
                  Pagamento pendente
                </Text>
              </View>
            )}

            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>
                Pedido #{orderNumber}
              </Text>
              <View style={[styles.badge, { backgroundColor: config.color }]}>
                <Text style={styles.badgeText}>{config.label}</Text>
              </View>
            </View>

            <View style={styles.timeline}>
              {STEPS.map((step, idx) => (
                <View key={idx} style={styles.timelineStep}>
                  <View
                    style={[
                      styles.timelineBar,
                      {
                        backgroundColor:
                          idx <= config.step ? GREEN : '#e0e0e0',
                      },
                    ]}
                  />
                  <Text style={styles.timelineLabel}>{step}</Text>
                </View>
              ))}
            </View>

            {order.items?.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Produtos:</Text>
                {order.items.map((item, idx) => (
                  <View key={idx} style={styles.productRow}>
                    <Text style={styles.productName}>
                      {item.product?.name}
                    </Text>
                    <Text style={styles.productPrice}>
                      R${' '}
                      {typeof item.price === 'number'
                        ? item.price.toFixed(2)
                        : item.price}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                R${' '}
                {typeof order.total === 'number'
                  ? order.total.toFixed(2)
                  : order.total}
              </Text>
            </View>

            {isPending && (
              <TouchableOpacity
                style={styles.finalizarBtn}
                onPress={() => handleFinalizarPagamento(order)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="card-outline"
                  size={18}
                  color="#fff"
                />
                <Text style={styles.finalizarBtnText}>
                  Finalizar pagamento
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
};

  const renderFavoritosTab = () => {
    if (!user.favorites?.length) {
      return (
        <View style={styles.emptyState}>
          <Ionicons
            name="heart-outline"
            size={50}
            color="#ccc"
          />
          <Text style={styles.emptyText}>Nenhum favorito ainda</Text>
          <TouchableOpacity
            style={styles.emptyAction}
            onPress={() => router.push('/(tabs)/loja')}
          >
            <Text style={styles.emptyActionText}>Explorar loja</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.grid}>
        {user.favorites.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.favoriteCard}
            onPress={() => router.push('/(tabs)/loja')}
            activeOpacity={0.8}
          >
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.favoriteImage}
              />
            ) : (
              <View style={styles.favoriteImagePlaceholder}>
                <Ionicons
                  name="image-outline"
                  size={32}
                  color="#ccc"
                />
              </View>
            )}
            <Text
              style={styles.favoriteName}
              numberOfLines={2}
            >
              {item.name ?? item}
            </Text>
            <Text style={styles.favoritePrice}>
              R${' '}
              {typeof item.price === 'number'
                ? item.price.toFixed(2)
                : item.price ?? '--'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCapilarTab = () => {
    if (quizLoading) {
      return (
        <View style={[styles.card, styles.quizLoadingCard]}>
          <ActivityIndicator
            size="large"
            color={GREEN}
          />
          <Text style={styles.quizLoadingText}>
            Carregando perfil capilar...
          </Text>
        </View>
      );
    }

    if (!quizResult) {
      return (
        <View style={styles.card}>
          <View style={styles.quizPrompt}>
            <View style={styles.quizIconCircle}>
              <Ionicons
                name="analytics-outline"
                size={36}
                color={GREEN}
              />
            </View>
            <Text style={styles.quizTitle}>
              Descubra seu perfil capilar
            </Text>
            <Text style={styles.quizSubtitle}>
              Responda algumas perguntas rápidas e receba recomendações
              personalizadas para o litoral norte.
            </Text>
            <TouchableOpacity
              style={styles.quizBtn}
              onPress={() => router.push('/(tabs)/quiz')}
            >
              <Text style={styles.quizBtnText}>Fazer Quiz</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const diagLabel =
      DIAGNOSIS_LABELS[quizResult.diagnosis] ?? quizResult.diagnosis ?? '—';
    const hairLabel =
      HAIR_TYPE_LABELS[quizResult.hairType] ?? quizResult.hairType ?? '—';
    const seasonLabel =
      SEASON_LABELS[quizResult.season] ?? quizResult.season ?? '—';
    const kitName = quizResult.recommendedKit ?? '—';
    const createdAt = quizResult.createdAt
      ? new Date(quizResult.createdAt).toLocaleDateString('pt-BR')
      : null;

    const rows = [
      {
        icon: 'water-outline',
        label: 'Diagnóstico',
        value: diagLabel,
      },
      {
        icon: 'git-compare-outline',
        label: 'Tipo de cabelo',
        value: hairLabel,
      },
      {
        icon: 'sunny-outline',
        label: 'Estação do quiz',
        value: seasonLabel,
      },
      {
        icon: 'bag-outline',
        label: 'Kit recomendado',
        value: kitName,
      },
    ];

    return (
      <View style={styles.card}>
        {rows.map(({ icon, label, value }) => (
          <View key={label} style={styles.hairRow}>
            <View style={styles.hairIconWrap}>
              <Ionicons
                name={icon}
                size={20}
                color={GREEN}
              />
            </View>
            <View style={styles.hairTextWrap}>
              <Text style={styles.hairLabel}>{label}</Text>
              <Text style={styles.hairValue}>{value}</Text>
            </View>
          </View>
        ))}
        {createdAt && (
          <Text style={styles.quizDate}>
            Realizado em {createdAt}
          </Text>
        )}
        <TouchableOpacity
          style={styles.refazerQuizBtn}
          onPress={() => router.push('/(tabs)/quiz')}
        >
          <Ionicons
            name="refresh-outline"
            size={16}
            color={GREEN}
          />
          <Text style={styles.refazerQuizText}>Refazer quiz</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderConfiguracoesTab = () => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.configItem}
        activeOpacity={0.8}
        onPress={() => setTab('dados')}
      >
        <Ionicons
          name="settings-outline"
          size={20}
          color={GREEN}
        />
        <Text style={styles.configText}>Editar perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.configItem}
        activeOpacity={0.8}
      >
        <Ionicons
          name="notifications-outline"
          size={20}
          color={GREEN}
        />
        <Text style={styles.configText}>Notificações</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.configItem}
        activeOpacity={0.8}
      >
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={GREEN}
        />
        <Text style={styles.configText}>Privacidade</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.configItem}
        activeOpacity={0.8}
        onPress={confirmLogout}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color="#d32f2f"
        />
        <Text style={[styles.configText, styles.configDangerText]}>
          Sair da conta
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.configItem}
        activeOpacity={0.8}
        onPress={confirmDeleteAccount}
      >
        <Ionicons
          name="trash-outline"
          size={20}
          color="#d32f2f"
        />
        <Text style={[styles.configText, styles.configDangerText]}>
          Excluir conta
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header com avatar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handleChangeAvatar}
            activeOpacity={0.8}
          >
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Ionicons
                name="camera"
                size={14}
                color="#fff"
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user.name || 'Usuário'}</Text>
          <Text style={styles.userEmail}>
            {user.email || 'email@exemplo.com'}
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t}
              style={styles.tabBtn}
              onPress={() => setTab(t)}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === t && styles.tabTextActive,
                ]}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
              {tab === t && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Conteúdo das tabs */}
        {tab === 'dados' && renderDadosTab()}
        {tab === 'pedidos' && renderPedidosTab()}
        {tab === 'favoritos' && renderFavoritosTab()}
        {tab === 'capilar' && renderCapilarTab()}
        {tab === 'configuracoes' && renderConfiguracoesTab()}
      </ScrollView>

      {/* Modal de confirmação */}
      {modal.visible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{modal.title}</Text>
            <Text style={styles.modalMessage}>{modal.message}</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalBtnCancel}
                onPress={() => setModal({ visible: false })}
              >
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtnConfirm,
                  modal.danger && styles.modalBtnDanger,
                ]}
                onPress={modal.onConfirm}
              >
                <Text style={styles.modalBtnConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Layout
  safe: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  safeGuest: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Guest Screen
  guestScreen: {
    flex: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 4,
  },
  backText: {
    color: GREEN,
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
  },
  guestContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 80,
  },
  guestIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e8f4f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  guestTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  loginBtn: {
    backgroundColor: GREEN,
    paddingVertical: 14,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginBtnText: {
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
  },
  registerBtn: {
    borderWidth: 1.5,
    borderColor: GREEN,
    paddingVertical: 13,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  registerBtnText: {
    color: GREEN,
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 12,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: GREEN,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#e8f4f1',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: GREEN,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#222',
  },
  userEmail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 8,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    position: 'relative',
  },
  tabText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#aaa',
  },
  tabTextActive: {
    color: GREEN,
    fontFamily: 'Poppins_700Bold',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 3,
    backgroundColor: GREEN,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPending: {
    borderWidth: 1.5,
    borderColor: '#f59e0b',
  },

  // Fields
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: 'Poppins_600SemiBold',
  },
  fieldValue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 10,
    fontSize: 14,
    color: '#222',
    backgroundColor: '#fafafa',
    fontFamily: 'Poppins_400Regular',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnSave: {
    backgroundColor: GREEN,
  },
  btnCancel: {
    backgroundColor: '#eee',
  },
  btnText: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
    fontSize: 14,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GREEN + '44',
    backgroundColor: GREEN + '0A',
  },
  editText: {
    color: GREEN,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },

  // Filtro de pedidos
  filterContainer: {
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: 'transparent',
  },
  filterChipActive: {
    borderColor: GREEN,
    backgroundColor: GREEN + '15',
  },
  filterChipPending: {
    borderColor: '#f59e0b',
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: '#888',
  },
  filterChipTextActive: {
    fontFamily: 'Poppins_700Bold',
    color: GREEN,
  },
  filterChipTextPending: {
    color: '#92400e',
  },

  // Pedido
  pendingBanner: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingBannerText: {
    fontSize: 12,
    color: '#92400e',
    fontFamily: 'Poppins_600SemiBold',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#222',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
  },
  timeline: {
    flexDirection: 'row',
    marginVertical: 14,
  },
  timelineStep: {
    flex: 1,
    alignItems: 'center',
  },
  timelineBar: {
    height: 4,
    width: '100%',
    marginBottom: 6,
    borderRadius: 2,
  },
  timelineLabel: {
    fontSize: 9,
    color: '#888',
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productName: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Poppins_400Regular',
  },
  productPrice: {
    fontSize: 14,
    color: GREEN,
    fontFamily: 'Poppins_500Medium',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#333',
  },
  totalValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: GREEN,
  },
  finalizarBtn: {
    marginTop: 14,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  finalizarBtnText: {
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
  },

  // Favoritos
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  favoriteCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  favoriteImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 8,
  },
  favoriteImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  favoriteName: {
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Poppins_500Medium',
  },
  favoritePrice: {
    fontSize: 13,
    color: GREEN,
    fontFamily: 'Poppins_600SemiBold',
  },

  // Capilar
  hairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  hairIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GREEN + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hairTextWrap: {
    flex: 1,
  },
  hairLabel: {
    fontSize: 11,
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontFamily: 'Poppins_600SemiBold',
  },
  hairValue: {
    fontSize: 15,
    color: '#222',
    fontFamily: 'Poppins_500Medium',
    marginTop: 2,
  },
  refazerQuizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GREEN + '44',
  },
  refazerQuizText: {
    color: GREEN,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  quizPrompt: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  quizIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GREEN + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  quizTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  quizSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  quizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: GREEN,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 25,
  },
  quizBtnText: {
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
  },
  quizLoadingCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  quizLoadingText: {
    marginTop: 12,
    color: '#888',
    fontFamily: 'Poppins_400Regular',
  },
  quizDate: {
    fontSize: 11,
    color: '#aaa',
    textAlign: 'right',
    marginTop: 4,
    fontFamily: 'Poppins_400Regular',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#aaa',
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  emptyAction: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: GREEN,
  },
  emptyActionText: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },

  // Configurações
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  configText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#333',
  },
  configDangerText: {
    color: '#d32f2f',
  },

  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    width: '85%',
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: '#222',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: 'Poppins_400Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  modalBtnCancelText: {
    color: '#555',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  modalBtnConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: GREEN,
    alignItems: 'center',
  },
  modalBtnDanger: {
    backgroundColor: '#d32f2f',
  },
  modalBtnConfirmText: {
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
});