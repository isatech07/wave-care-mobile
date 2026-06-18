// src/services/authService.js
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/users/login', { email, password });
    
    await AsyncStorage.setItem('wavecare_token', data.access_token);
    await AsyncStorage.setItem('wavecare_user', JSON.stringify(data.user)); // ← salva data.user, não data
    return data;
  },

  async register(name, email, password) {
    const { data } = await api.post('/users/register', { name, email, password });

    if (data.access_token) {
      await AsyncStorage.setItem('wavecare_token', data.access_token);
    }
    await AsyncStorage.setItem('wavecare_user', JSON.stringify(data.user || data));
    return data;
  },

  async logout() {
    await AsyncStorage.multiRemove(['wavecare_token', 'wavecare_user', 'wavecare_cart']);
  },

  async getToken() {
    return AsyncStorage.getItem('wavecare_token');
  },
};