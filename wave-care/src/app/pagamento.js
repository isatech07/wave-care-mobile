import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../contexts/UserContext';
import { useCartStore } from '../stores/useCartStore';
import { useOrderStore } from '../stores/useOrderStore';

const GREEN = '#2D5A45';

export default function Pagamento() {
  const router = useRouter();
  const { user } = useUser();
  const { createOrder, loading } = useOrderStore();
  const [paymentMethod, setPaymentMethod] = useState('card');

  const items = useCartStore((state) => state.items);
  const totalValue = useCartStore((state) =>
    state.items.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0)
  );

  const [modal, setModal] = useState({ visible: false });

  const handleConfirm = async () => {
    if (!user || user.guest) {
      router.push('/login');
      return;
    }
    setModal({ visible: true });
  };

const handleFinalize = async () => {
  setModal({ visible: false });
  try {
    await createOrder(user.id);
    router.replace('/(tabs)/home');  // ← rota completa
  } catch (e) {
    console.log('[pagamento] erro:', e.message);
  }
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Forma de pagamento</Text>

          <TouchableOpacity
            style={[styles.payOption, paymentMethod === 'card' && styles.payOptionActive]}
            onPress={() => setPaymentMethod('card')}
            activeOpacity={0.8}
          >
            <View style={styles.payOptionLeft}>
              <View style={[styles.payIconBox, paymentMethod === 'card' && styles.payIconBoxActive]}>
                <Ionicons name="card-outline" size={20} color={paymentMethod === 'card' ? '#fff' : GREEN} />
              </View>
              <View>
                <Text style={styles.payOptionTitle}>Cartão</Text>
                <Text style={styles.payOptionSub}>Crédito ou débito</Text>
              </View>
            </View>
            <View style={[styles.radio, paymentMethod === 'card' && styles.radioActive]}>
              {paymentMethod === 'card' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.payOption, paymentMethod === 'cash' && styles.payOptionActive]}
            onPress={() => setPaymentMethod('cash')}
            activeOpacity={0.8}
          >
            <View style={styles.payOptionLeft}>
              <View style={[styles.payIconBox, paymentMethod === 'cash' && styles.payIconBoxActive]}>
                <Ionicons name="cash-outline" size={20} color={paymentMethod === 'cash' ? '#fff' : GREEN} />
              </View>
              <View>
                <Text style={styles.payOptionTitle}>Dinheiro</Text>
                <Text style={styles.payOptionSub}>Pagamento na entrega</Text>
              </View>
            </View>
            <View style={[styles.radio, paymentMethod === 'cash' && styles.radioActive]}>
              {paymentMethod === 'cash' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        </View>

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

        {modal.visible && (
    <View style={styles.modalOverlay}>
      <View style={styles.modalBox}>
        <Text style={styles.modalTitle}>Confirmar pedido</Text>
        <Text style={styles.modalMessage}>
          Total: R$ {totalValue.toFixed(2).replace('.', ',')}{'  '}
          Pagamento: {paymentMethod === 'card' ? 'Cartão' : 'Dinheiro'}
        </Text>
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={styles.modalBtnCancel}
            onPress={() => setModal({ visible: false })}
          >
            <Text style={styles.modalBtnCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalBtnConfirm}
            onPress={handleFinalize}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.modalBtnConfirmText}>Confirmar</Text>
            }
          </TouchableOpacity>
        </View>
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
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
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
  fontWeight: 'bold',
  color: '#222',
  marginBottom: 10,
},
modalMessage: {
  fontSize: 14,
  color: '#555',
  lineHeight: 22,
  marginBottom: 24,
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
  fontWeight: '600',
  fontSize: 14,
},
modalBtnConfirm: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 10,
  backgroundColor: GREEN,
  alignItems: 'center',
},
modalBtnConfirmText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 14,
},
});