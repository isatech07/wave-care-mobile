import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../contexts/UserContext';
import { useCartStore } from '../stores/useCartStore';
import { useOrderStore } from '../stores/useOrderStore';

const GREEN = '#2D5A45';

const PAYMENT_OPTIONS = [
  {
    id: 'card',
    title: 'Cartão',
    sub: 'Crédito ou débito',
    icon: 'card-outline',
  },
  {
    id: 'pix',
    title: 'PIX',
    sub: 'Aprovação imediata',
    icon: 'qr-code-outline',
  },
  {
    id: 'boleto',
    title: 'Boleto',
    sub: '1 a 3 dias úteis',
    icon: 'barcode-outline',
  },
];

export default function Pagamento() {
  const router = useRouter();
  const { user } = useUser();
  const { createOrder, confirmPayment, loading } = useOrderStore();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [modal, setModal] = useState({ visible: false, type: '' });
  // type: 'confirm' | 'pending' | 'confirmed'
  const [currentOrder, setCurrentOrder] = useState(null);

  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalValue = useCartStore((state) =>
    state.items.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0)
  );

  const handleConfirm = async () => {
    if (!user || user.guest) {
      router.push('/login');
      return;
    }
    setModal({ visible: true, type: 'confirm' });
  };

  const handleFinalize = async () => {
    setModal({ visible: false, type: '' });
    try {
      // Cria o pedido como pending, passa o método escolhido
      const order = await createOrder(paymentMethod);
      setCurrentOrder(order);
      await clearCart(user.id);

      // PIX e Boleto ficam pendentes — mostra tela de pendente
      // Cartão confirma na hora
      if (paymentMethod === 'card') {
        const confirmed = await confirmPayment(order.id, paymentMethod);
        setCurrentOrder(confirmed);
        setModal({ visible: true, type: 'confirmed' });
      } else {
        setModal({ visible: true, type: 'pending' });
      }
    } catch (e) {
      console.log('[pagamento] erro:', e.message);
    }
  };

  const handleFinishPending = async () => {
    // Usuário clicou em "Já paguei" no modal de PIX/Boleto
    if (!currentOrder) return;
    try {
      await confirmPayment(currentOrder.id, paymentMethod);
      setModal({ visible: true, type: 'confirmed' });
    } catch (e) {
      console.log('[pagamento] erro ao confirmar:', e.message);
    }
  };

  const handleGoToOrders = () => {
    setModal({ visible: false, type: '' });
    router.replace('/(tabs)/perfil');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={GREEN} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finalizar Compra</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Resumo */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo do pedido</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemQty}>{item.quantity}x</Text>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.product?.name}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                R$ {((item.product?.price ?? 0) * item.quantity).toFixed(2).replace('.', ',')}
              </Text>
            </View>
          ))}
        </View>

        {/* Forma de pagamento */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Forma de pagamento</Text>
          {PAYMENT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.payOption, paymentMethod === opt.id && styles.payOptionActive]}
              onPress={() => setPaymentMethod(opt.id)}
              activeOpacity={0.8}
            >
              <View style={styles.payOptionLeft}>
                <View style={[styles.payIconBox, paymentMethod === opt.id && styles.payIconBoxActive]}>
                  <Ionicons name={opt.icon} size={20} color={paymentMethod === opt.id ? '#fff' : GREEN} />
                </View>
                <View>
                  <Text style={styles.payOptionTitle}>{opt.title}</Text>
                  <Text style={styles.payOptionSub}>{opt.sub}</Text>
                </View>
              </View>
              <View style={[styles.radio, paymentMethod === opt.id && styles.radioActive]}>
                {paymentMethod === opt.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}

          {/* Info extra por método */}
          {paymentMethod === 'pix' && (
            <View style={styles.methodInfo}>
              <Ionicons name="information-circle-outline" size={16} color={GREEN} />
              <Text style={styles.methodInfoText}>
                Após confirmar, você receberá a chave PIX para realizar o pagamento.
              </Text>
            </View>
          )}
          {paymentMethod === 'boleto' && (
            <View style={styles.methodInfo}>
              <Ionicons name="information-circle-outline" size={16} color={GREEN} />
              <Text style={styles.methodInfoText}>
                O boleto será gerado após a confirmação. Prazo de compensação: 1 a 3 dias úteis.
              </Text>
            </View>
          )}
        </View>

        {/* Total */}
        <View style={styles.card}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>R$ {totalValue.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Frete</Text>
            <Text style={[styles.totalValue, { color: GREEN }]}>Grátis</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>R$ {totalValue.toFixed(2).replace('.', ',')}</Text>
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
          onPress={handleConfirm}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.confirmBtnText}>Confirmar Pedido</Text>
          }
        </TouchableOpacity>
      </View>

      {/* ── Modal confirmar ── */}
      {modal.visible && modal.type === 'confirm' && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Confirmar pedido</Text>
            <Text style={styles.modalMessage}>
              Total: R$ {totalValue.toFixed(2).replace('.', ',')}{'  '}
              Pagamento: {PAYMENT_OPTIONS.find(o => o.id === paymentMethod)?.title}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setModal({ visible: false, type: '' })}>
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleFinalize}>
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.modalBtnConfirmText}>Confirmar</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* ── Modal pendente (PIX/Boleto) ── */}
      {modal.visible && modal.type === 'pending' && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIcon}>
              <Ionicons name="time-outline" size={40} color="#f59e0b" />
            </View>
            <Text style={styles.modalTitle}>Pedido recebido!</Text>
            <Text style={styles.modalMessage}>
              Seu pedido foi criado e está aguardando a confirmação do pagamento via{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {paymentMethod === 'pix' ? 'PIX' : 'Boleto'}
              </Text>.
              {'\n\n'}
              Você pode acompanhar o status na aba <Text style={{ fontWeight: 'bold' }}>Pedidos</Text> do seu perfil.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={handleFinishPending}>
                <Text style={styles.modalBtnCancelText}>Já paguei</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={handleGoToOrders}>
                <Text style={styles.modalBtnConfirmText}>Ver pedidos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* ── Modal confirmado ── */}
      {modal.visible && modal.type === 'confirmed' && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIcon}>
              <Ionicons name="checkmark-circle-outline" size={40} color={GREEN} />
            </View>
            <Text style={styles.modalTitle}>Pagamento confirmado!</Text>
            <Text style={styles.modalMessage}>
              Seu pedido foi confirmado com sucesso e está sendo processado.
            </Text>
            <TouchableOpacity style={[styles.modalBtnConfirm, { marginTop: 4 }]} onPress={handleGoToOrders}>
              <Text style={styles.modalBtnConfirmText}>Ver meus pedidos</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f0' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  scroll: { padding: 16, gap: 16, paddingBottom: 120 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1C1C1E', marginBottom: 14 },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
  itemQty: { fontWeight: '700', color: GREEN, fontSize: 13, minWidth: 24 },
  itemName: { fontSize: 13, color: '#333', flex: 1 },
  itemPrice: { fontWeight: '600', fontSize: 13, color: '#1C1C1E' },
  payOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#eee', marginBottom: 10,
  },
  payOptionActive: { borderColor: GREEN, backgroundColor: GREEN + '08' },
  payOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  payIconBox: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: GREEN + '15', justifyContent: 'center', alignItems: 'center',
  },
  payIconBoxActive: { backgroundColor: GREEN },
  payOptionTitle: { fontWeight: '600', fontSize: 14, color: '#1C1C1E' },
  payOptionSub: { fontSize: 12, color: '#888' },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: '#ccc', justifyContent: 'center', alignItems: 'center',
  },
  radioActive: { borderColor: GREEN },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: GREEN },
  methodInfo: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: GREEN + '0D', borderRadius: 10, padding: 12, marginTop: 4,
  },
  methodInfoText: { flex: 1, fontSize: 12, color: '#444', lineHeight: 18 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { fontSize: 14, color: '#888' },
  totalValue: { fontWeight: '600', fontSize: 14, color: '#1C1C1E' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  grandLabel: { fontWeight: '700', fontSize: 16, color: '#1C1C1E' },
  grandValue: { fontWeight: '700', fontSize: 20, color: GREEN },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#eee',
  },
  confirmBtn: {
    backgroundColor: GREEN, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
  },
  confirmBtnText: { fontWeight: '700', color: '#fff', fontSize: 16 },
  modalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', zIndex: 999,
  },
  modalBox: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    marginHorizontal: 32, width: '85%',
  },
  modalIcon: { alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#222', marginBottom: 10, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 24, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 10 },
  modalBtnCancel: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#eee', alignItems: 'center',
  },
  modalBtnCancelText: { color: '#555', fontWeight: '600', fontSize: 14 },
  modalBtnConfirm: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: GREEN, alignItems: 'center',
  },
  modalBtnConfirmText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});