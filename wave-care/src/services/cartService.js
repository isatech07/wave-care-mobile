import api from './api';

export const cartService = {
async addItem(userId, productId, quantity = 1) {
  const { data } = await api.post('/cart', { userId, productId, quantity });
  return data;
},

  async getCart(userId) {
    const { data } = await api.get(`/cart/${userId}`);
    return data;
  },

  async updateQuantity(cartItemId, quantity) {
    const { data } = await api.put(`/cart/${cartItemId}`, { quantity });
    return data;
  },

  async removeItem(cartItemId) {
    const { data } = await api.delete(`/cart/${cartItemId}`);
    return data;
  },

  async clearCart(userId) {
    const { data } = await api.delete(`/cart/clear/${userId}`);
    return data;
  },
};