import React, { useState } from 'react';
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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../contexts/UserContext';
import { useNavigation } from '@react-navigation/native';

const TABS = ['dados', 'pedidos', 'favoritos', 'capilar'];
const GREEN = '#2D5A45';

export default function PerfilScreen() {
  const { user, logout, updateUser } = useUser();
  const navigation = useNavigation();

  const [tab, setTab]         = useState('dados');
  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar]   = useState(user?.avatar ?? null);

  const [form, setForm] = useState({
    name:  user?.name  ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    city:  user?.city  ?? '',
  });

  // ─── Tela de convidado ────────────────────────────────────────────────────
  if (!user || user.guest) {
    return (
      <SafeAreaView style={styles.safeGuest}>
        <View style={styles.guestScreen}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color={GREEN} />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <View style={styles.guestContent}>
            <View style={styles.guestIconCircle}>
              <Ionicons name="person-outline" size={48} color={GREEN} />
            </View>
            <Text style={styles.guestTitle}>Você está sem conta</Text>
            <Text style={styles.guestSubtitle}>
              Faça login para acessar seu perfil, pedidos e favoritos.
            </Text>
            <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginBtnText}>Fazer Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Cadastro')}>
              <Text style={styles.registerBtnText}>Criar Conta</Text>
            </TouchableOpacity>
          </View>
        </View>

      </SafeAreaView>
    );
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const getInitials = () =>
    user.name ? user.name.slice(0, 2).toUpperCase() : '?';

  const STATUS = {
    aguardando: { label: 'Aguardando', color: '#f59e0b', step: 0 },
    confirmado: { label: 'Confirmado', color: '#3b82f6', step: 1 },
    enviado:    { label: 'Enviado',    color: '#8b5cf6', step: 2 },
    entregue:   { label: 'Entregue',   color: '#10b981', step: 3 },
  };
  const STEPS = ['Aguardando', 'Confirmado', 'Enviado', 'Entregue'];

  // ─── Troca de foto ────────────────────────────────────────────────────────
  const handleChangeAvatar = () => {
    Alert.alert(
      'Foto de perfil',
      'Escolha uma opção',
      [
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
      ],
    );
  };

  // ─── Salvar dados ─────────────────────────────────────────────────────────
  const save = async () => {
    const updated = { ...user, ...form };
    updateUser(updated);
    await AsyncStorage.setItem('wavecare_user', JSON.stringify(updated));
    setEditing(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['wavecare_guest', 'wavecare_last_email']);
    logout();
    navigation.navigate('Welcome');
  };

  // ─── Aba Dados ────────────────────────────────────────────────────────────
  const renderDadosTab = () => (
    <View style={styles.card}>
      {[
        { key: 'name',  label: 'Nome',    placeholder: 'Seu nome',        keyboard: 'default' },
        { key: 'email', label: 'Email',   placeholder: 'seu@email.com',   keyboard: 'email-address' },
        { key: 'phone', label: 'Telefone',placeholder: '(00) 00000-0000', keyboard: 'phone-pad' },
        { key: 'city',  label: 'Cidade',  placeholder: 'Sua cidade',      keyboard: 'default' },
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
            <Text style={styles.fieldValue}>{user[key] || 'Não informado'}</Text>
          )}
        </View>
      ))}

      {editing ? (
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={save}>
            <Text style={styles.btnText}>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setEditing(false)}>
            <Text style={[styles.btnText, { color: '#555' }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setEditing(true)} style={styles.editBtn}>
          <Ionicons name="create-outline" size={16} color={GREEN} />
          <Text style={styles.editText}>Editar dados</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ─── Aba Pedidos ──────────────────────────────────────────────────────────
  const renderPedidosTab = () => {
    if (!user.orders?.length) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="bag-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
          <TouchableOpacity style={styles.emptyAction} onPress={() => navigation.navigate('Loja')}>
            <Text style={styles.emptyActionText}>Ir para a loja</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        {user.orders.map((order, i) => {
          const config = STATUS[order.status ?? 'aguardando'] ?? STATUS.aguardando;
          return (
            <View key={i} style={styles.card}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Pedido #{order.id ?? i + 1}</Text>
                <View style={[styles.badge, { backgroundColor: config.color }]}>
                  <Text style={styles.badgeText}>{config.label}</Text>
                </View>
              </View>

              <View style={styles.timeline}>
                {STEPS.map((step, idx) => (
                  <View key={idx} style={styles.timelineStep}>
                    <View style={[
                      styles.timelineBar,
                      { backgroundColor: idx <= config.step ? GREEN : '#e0e0e0' },
                    ]} />
                    <Text style={styles.timelineLabel}>{step}</Text>
                  </View>
                ))}
              </View>

              {order.products?.length > 0 && (
                <View>
                  <Text style={styles.sectionTitle}>Produtos:</Text>
                  {order.products.map((p, idx) => (
                    <View key={idx} style={styles.productRow}>
                      <Text style={styles.productName}>{p.name ?? p}</Text>
                      <Text style={styles.productPrice}>
                        R$ {typeof p.price === 'number' ? p.price.toFixed(2) : p.price}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>
                  R$ {typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // ─── Aba Favoritos ────────────────────────────────────────────────────────
  const renderFavoritosTab = () => {
    if (!user.favorites?.length) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Nenhum favorito ainda</Text>
          <TouchableOpacity style={styles.emptyAction} onPress={() => navigation.navigate('Loja')}>
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
            onPress={() => navigation.navigate('Loja', { itemId: item.id })}
            activeOpacity={0.8}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.favoriteImage} />
            ) : (
              <View style={styles.favoriteImagePlaceholder}>
                <Ionicons name="image-outline" size={32} color="#ccc" />
              </View>
            )}
            <Text style={styles.favoriteName} numberOfLines={2}>{item.name ?? item}</Text>
            <Text style={styles.favoritePrice}>
              R$ {typeof item.price === 'number' ? item.price.toFixed(2) : item.price ?? '--'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // ─── Aba Capilar ─────────────────────────────────────────────────────────
  const renderCapilarTab = () => (
    <View style={styles.card}>
      {user.hairProfile ? (
        <>
          {[
            { icon: 'water-outline',       label: 'Tipo de cabelo', value: user.hairProfile.type },
            { icon: 'git-compare-outline', label: 'Porosidade',     value: user.hairProfile.porosity },
            { icon: 'copy-outline',        label: 'Densidade',      value: user.hairProfile.density },
          ].map(({ icon, label, value }) => (
            <View key={label} style={styles.hairRow}>
              <View style={styles.hairIconWrap}>
                <Ionicons name={icon} size={20} color={GREEN} />
              </View>
              <View style={styles.hairTextWrap}>
                <Text style={styles.hairLabel}>{label}</Text>
                <Text style={styles.hairValue}>{value}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.refazerQuizBtn}
            onPress={() => navigation.navigate('Quiz')}
          >
            <Ionicons name="refresh-outline" size={16} color={GREEN} />
            <Text style={styles.refazerQuizText}>Refazer quiz</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.quizPrompt}>
          <View style={styles.quizIconCircle}>
            <Ionicons name="analytics-outline" size={36} color={GREEN} />
          </View>
          <Text style={styles.quizTitle}>Descubra seu perfil capilar</Text>
          <Text style={styles.quizSubtitle}>
            Responda algumas perguntas rápidas e receba recomendações personalizadas.
          </Text>
          <TouchableOpacity style={styles.quizBtn} onPress={() => navigation.navigate('Quiz')}>
            <Text style={styles.quizBtnText}>Fazer Quiz</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // ─── Render principal ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header com avatar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={handleChangeAvatar} activeOpacity={0.8}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{user.name || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{user.email || 'email@exemplo.com'}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity key={t} style={styles.tabBtn} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
              {tab === t && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Conteúdo da aba */}
        {tab === 'dados'     && renderDadosTab()}
        {tab === 'pedidos'   && renderPedidosTab()}
        {tab === 'favoritos' && renderFavoritosTab()}
        {tab === 'capilar'   && renderCapilarTab()}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#d32f2f" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

  // ─── Guest ────────────────────────────────────────────────────────────────
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
    fontWeight: '500',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  guestSubtitle: {
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    fontSize: 15,
  },

  // ─── Header ───────────────────────────────────────────────────────────────
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
    fontWeight: 'bold',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  userEmail: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },

  // ─── Tabs ─────────────────────────────────────────────────────────────────
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  tabText: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: '500',
  },
  tabTextActive: {
    color: GREEN,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: GREEN,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },

  // ─── Card genérico ────────────────────────────────────────────────────────
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

  // ─── Dados ────────────────────────────────────────────────────────────────
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldValue: {
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
    fontWeight: '600',
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
    fontWeight: '600',
    fontSize: 14,
  },

  // ─── Pedidos ──────────────────────────────────────────────────────────────
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontWeight: 'bold',
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
    fontWeight: 'bold',
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
  },
  sectionTitle: {
    fontWeight: '600',
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
  },
  productPrice: {
    fontSize: 14,
    color: GREEN,
    fontWeight: '500',
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
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 15,
    color: GREEN,
  },

  // ─── Favoritos ────────────────────────────────────────────────────────────
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
  },
  favoritePrice: {
    fontSize: 13,
    color: GREEN,
    fontWeight: '600',
  },

  // ─── Capilar ──────────────────────────────────────────────────────────────
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
  },
  hairValue: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
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
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  quizSubtitle: {
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
    fontWeight: 'bold',
    fontSize: 15,
  },

  // ─── Empty states ─────────────────────────────────────────────────────────
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
    fontWeight: '600',
    fontSize: 14,
  },

  // ─── Logout ───────────────────────────────────────────────────────────────
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#fff3f3',
  },
  logoutText: {
    color: '#d32f2f',
    fontWeight: '600',
    fontSize: 15,
  },
});