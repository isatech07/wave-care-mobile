import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  getUserById,
} from '../services/userService';
import { authService } from '../services/authService';
import { router } from 'expo-router';
import { useCartStore } from '../stores/useCartStore';
import { useOrderStore } from '../stores/useOrderStore';

const UserContext = createContext();

const GUEST_USER = {
  id: 'guest',
  guest: true,
  favorites: [],
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const resetCart = useCartStore((state) => state.resetCart);
  const resetOrders = useOrderStore((state) => state.resetOrders);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('wavecare_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(GUEST_USER);
      }
    } catch (error) {
      setUser(GUEST_USER);
    }
  };

  // ---------- LOGIN (funcional, com admin e usuário comum) ----------
  const login = async (userData, token, typedEmail) => {
    try {
      await AsyncStorage.setItem('wavecare_token', token);

      const finalUser = {
        ...userData,
        email: typedEmail || userData.email,
        favorites: userData.favorites || [],
      };

      if (finalUser.id && finalUser.id !== 'guest') {
        try {
          const { data } = await getUserById(finalUser.id, token);
          Object.assign(finalUser, data);
        } catch (err) {
          console.log('Erro ao buscar dados completos:', err);
        }
      }

      setUser(finalUser);
      await AsyncStorage.setItem('wavecare_user', JSON.stringify(finalUser));

      const isAdmin = (typedEmail || finalUser.email)?.toLowerCase() === 'admin@wavecare.com';

      // Pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => {
        if (isAdmin) {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/(tabs)/home');
        }
      }, 100);
    } catch (error) {
      console.log('[login] erro crítico:', error);
      const isAdmin = typedEmail?.toLowerCase() === 'admin@wavecare.com';
      setTimeout(() => {
        if (isAdmin) {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/(tabs)/home');
        }
      }, 100);
    }
  };

  // ---------- LOGOUT ROBUSTO (com fallback para web) ----------
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.log('[logout] erro ao chamar authService.logout:', error?.message);
    } finally {
      // Limpa storage
      await AsyncStorage.multiRemove(['wavecare_token', 'wavecare_user', 'wavecare_cart']);
      resetCart();
      resetOrders();
      setUser(GUEST_USER);

      // Tenta navegar com o router do Expo
      try {
        router.replace('/seja-bem-vindo');
      } catch (e) {
        console.log('[logout] router.replace falhou:', e?.message);
      }

      // Fallback para web (garante o redirecionamento mesmo se o router falhar)
      if (typeof window !== 'undefined' && window.location) {
        try {
          window.location.href = '/seja-bem-vindo';
        } catch (we) {
          console.log('[logout] fallback window.location falhou:', we?.message);
        }
      }
    }
  };

  // ---------- DELETE ACCOUNT (chama logout ao final) ----------
  const deleteAccount = async () => {
    try {
      if (user?.id && !user?.guest) {
        await deleteUserApi(user.id);
      }
    } catch (error) {
      console.log('[deleteAccount]', error?.message);
    } finally {
      await logout();
    }
  };

  // ---------- DEMAIS FUNÇÕES (refresh, update, toggleFavorite) ----------
  const refreshUser = async () => {
    if (!user || user.guest || !user.id) return;
    try {
      const token = await AsyncStorage.getItem('wavecare_token');
      const { data } = await getUserById(user.id, token);
      const updatedUser = { ...data, favorites: user.favorites || [] };
      setUser(updatedUser);
      await AsyncStorage.setItem('wavecare_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      await updateUserApi(updatedUser.id, {
        name: updatedUser.name,
        email: updatedUser.email,
        telefone: updatedUser.telefone,
        cidade: updatedUser.cidade,
      });
      setUser(updatedUser);
      await AsyncStorage.setItem('wavecare_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  const toggleFavorite = async (product) => {
    if (!user || user.guest) return false;
    const favorites = user.favorites || [];
    const isFavorite = favorites.some((fav) => fav.id === product.id);
    const updatedFavorites = isFavorite
      ? favorites.filter((fav) => fav.id !== product.id)
      : [...favorites, {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          season: product.season,
        }];
    const updatedUser = { ...user, favorites: updatedFavorites };
    await updateUser(updatedUser);
    return !isFavorite;
  };

  const isAdmin = user?.email?.toLowerCase() === 'admin@wavecare.com';

  return (
    <UserContext.Provider
      value={{
        user,
        isAdmin,
        login,
        logout,
        refreshUser,
        updateUser,
        toggleFavorite,
        deleteAccount,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);