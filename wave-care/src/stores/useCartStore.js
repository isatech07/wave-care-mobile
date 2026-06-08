import { create } from 'zustand';
import { cartService } from '../services/cartService';

export const useCartStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchCart: async (userId) => {
    set({ loading: true, error: null });
    try {
      const cart = await cartService.getCart(userId);
      set({ items: cart?.items ?? [] });
    } catch (e) {
      set({ error: 'Erro ao carregar carrinho' });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (userId, productId) => {
    try {
      await cartService.addItem(productId, 1);
      await get().fetchCart(userId);
    } catch (e) {
      set({ error: 'Erro ao adicionar item' });
      throw e;
    }
  },

  increaseItem: async (userId, cartItemId, currentQty) => {
    try {
      await cartService.updateQuantity(cartItemId, currentQty + 1);
      await get().fetchCart(userId);
    } catch (e) {
      set({ error: 'Erro ao atualizar item' });
    }
  },

  decreaseItem: async (userId, cartItemId, currentQty) => {
    try {
      if (currentQty <= 1) {
        await cartService.removeItem(cartItemId);
      } else {
        await cartService.updateQuantity(cartItemId, currentQty - 1);
      }
      await get().fetchCart(userId);
    } catch (e) {
      set({ error: 'Erro ao atualizar item' });
    }
  },

  removeItem: async (userId, cartItemId) => {
    try {
      await cartService.removeItem(cartItemId);
      await get().fetchCart(userId);
    } catch (e) {
      set({ error: 'Erro ao remover item' });
    }
  },

  clearCart: async (userId) => {
    try {
      await cartService.clearCart(userId);
      set({ items: [] });
    } catch (e) {
      set({ error: 'Erro ao limpar carrinho' });
    }
  },

  resetCart: () => {
    set({ items: [], loading: false, error: null });
  },

  total: () =>
    get().items.reduce(
      (sum, i) => sum + (i.product?.price ?? 0) * i.quantity,
      0
    ),

  itemCount: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
}));