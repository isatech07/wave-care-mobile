import { create } from 'zustand';
import { orderService } from '../services/orderService';

export const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async (userId) => {
    set({ loading: true, error: null });
    try {
      const orders = await orderService.getUserOrders(userId);
      set({ orders });
    } catch (e) {
      set({ error: 'Erro ao carregar pedidos' });
    } finally {
      set({ loading: false });
    }
  },

  createOrder: async (paymentMethod = 'card') => {
    set({ loading: true, error: null });
    try {
      const order = await orderService.createOrder(paymentMethod);
      set((state) => ({ orders: [order, ...state.orders] }));
      return order;
    } catch (e) {
      set({ error: 'Erro ao criar pedido' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  confirmPayment: async (orderId, paymentMethod) => {
    set({ loading: true, error: null });
    try {
      const confirmed = await orderService.confirmPayment(orderId, paymentMethod);
      set((state) => ({
        orders: state.orders.map((o) => o.id === orderId ? confirmed : o),
      }));
      return confirmed;
    } catch (e) {
      set({ error: 'Erro ao confirmar pagamento' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  resetOrders: () => set({ orders: [], loading: false, error: null }),
}));