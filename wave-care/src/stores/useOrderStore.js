import { create } from 'zustand';
import { orderService } from '../services/orderService';

export const useOrderStore = create((set) => ({
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

  createOrder: async (userId) => {
    set({ loading: true, error: null });
    try {
      const order = await orderService.createOrder(userId);
      set((state) => ({ orders: [order, ...state.orders] }));
      return order;
    } catch (e) {
      set({ error: 'Erro ao criar pedido' });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
}));