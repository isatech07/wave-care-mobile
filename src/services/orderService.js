import api from './api';

export const orderService = {
  async createOrder(paymentMethod = 'card') {
    const { data } = await api.post('/order', { paymentMethod });
    return data;
  },
  async confirmPayment(orderId, paymentMethod) {
    const { data } = await api.put(`/order/${orderId}/pay`, { paymentMethod });
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