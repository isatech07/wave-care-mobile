import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  getUserById,
} from '../services/userService';
import { authService } from '../services/authService';
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
      console.error('Erro ao carregar usuário:', error);
      setUser(GUEST_USER);
    }
  };

  const login = async (userData) => {
    try {
      await AsyncStorage.removeItem('wavecare_user');

      const { data } = await getUserById(userData.id);

      const fullUser = {
        ...userData,
        ...data,
      };

      setUser(fullUser);

      await AsyncStorage.setItem(
        'wavecare_user',
        JSON.stringify(fullUser)
      );
    } catch (error) {
      console.log(
        '[login] usando dados retornados pelo login:',
        error?.message
      );

      setUser(userData);

      await AsyncStorage.setItem(
        'wavecare_user',
        JSON.stringify(userData)
      );
    }
  };

  const refreshUser = async () => {
    if (!user || user.guest || !user.id) return;

    try {
      const { data } = await getUserById(user.id);

      const updatedUser = {
        ...data,
        favorites: user.favorites || [],
      };

      setUser(updatedUser);

      await AsyncStorage.setItem(
        'wavecare_user',
        JSON.stringify(updatedUser)
      );
    } catch (error) {
      console.error(
        'Erro ao atualizar dados do usuário:',
        error
      );
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

      await AsyncStorage.setItem(
        'wavecare_user',
        JSON.stringify(updatedUser)
      );
    } catch (error) {
      console.error(
        'Erro ao atualizar usuário:',
        error
      );
      throw error;
    }
  };

  const toggleFavorite = async (product) => {
    if (!user || user.guest) return false;

    const favorites = user.favorites || [];

    const isFavorite = favorites.some(
      (fav) => fav.id === product.id
    );

    const updatedFavorites = isFavorite
      ? favorites.filter((fav) => fav.id !== product.id)
      : [
          ...favorites,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            season: product.season,
          },
        ];

    const updatedUser = {
      ...user,
      favorites: updatedFavorites,
    };

    await updateUser(updatedUser);

    return !isFavorite;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.log(
        '[logout] erro ao sair:',
        error?.message
      );
    } finally {
      await AsyncStorage.multiRemove([
        'wavecare_token',
        'wavecare_user',
        'wavecare_cart',
      ]);

      resetCart();
      resetOrders();

      setUser(GUEST_USER);
    }
  };

  const deleteAccount = async () => {
    try {
      if (user?.id && !user?.guest) {
        await deleteUserApi(user.id);
      }
    } catch (error) {
      console.log(
        '[deleteAccount]',
        error?.response?.status,
        error?.message
      );
    } finally {
      await logout();
    }
  };

  // ADMIN FIXO POR EMAIL
  const isAdmin =
    user?.email?.toLowerCase() ===
    'admin@wavecare.com';

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