import api from './api';

export const orderService = {
  async createOrder(userId) {
    const { data } = await api.post(`/order/${userId}`);
    return data;
  },

  async getUserOrders(userId) {
    const { data } = await api.get(`/order/user/${userId}`);
    return data;
  },

  async getOrder(orderId) {
    const { data } = await api.get(`/order/${orderId}`);
    return data;
  },
};