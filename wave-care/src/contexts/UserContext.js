import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUser as updateUserApi, deleteUser as deleteUserApi, getUserById } from '../services/userService';
import { authService } from '../services/authService';
import { useCartStore } from '../stores/useCartStore';
import { useOrderStore } from '../stores/useOrderStore';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const resetCart = useCartStore((state) => state.resetCart);
  const resetOrders = useOrderStore((state) => state.resetOrders);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('wavecare_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser({ id: 'guest', guest: true, favorites: [] });
      }
    } catch (e) {
      setUser({ id: 'guest', guest: true, favorites: [] });
    }
  };

  const login = async (userData) => {
    await AsyncStorage.removeItem('wavecare_user');
    
    try {
      // Busca dados completos incluindo telefone e cidade
      const { data } = await getUserById(userData.id);
      const fullUser = { ...userData, ...data };
      setUser(fullUser);
      await AsyncStorage.setItem('wavecare_user', JSON.stringify(fullUser));
    } catch (e) {
      // Fallback: salva o que veio do login
      setUser(userData);
      await AsyncStorage.setItem('wavecare_user', JSON.stringify(userData));
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
      await AsyncStorage.setItem('wavecare_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Erro ao buscar dados atualizados do usuário:', e);
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      await updateUserApi(updatedUser.id, {
        name:     updatedUser.name,
        email:    updatedUser.email,
        telefone: updatedUser.telefone, // ← já vem certo agora
        cidade:   updatedUser.cidade,   // ← já vem certo agora
      });
      setUser(updatedUser);
      await AsyncStorage.setItem('wavecare_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Erro ao atualizar usuário na API:', e);
      throw e;
    }
  };

  const toggleFavorite = async (product) => {
    if (!user || user.guest) return false;

    const currentFavorites = user.favorites || [];
    const isFavorite = currentFavorites.some(fav => fav.id === product.id);

    const newFavorites = isFavorite
      ? currentFavorites.filter(fav => fav.id !== product.id)
      : [...currentFavorites, {
          id:       product.id,
          name:     product.name,
          price:    product.price,
          image:    product.image,
          category: product.category,
          season:   product.season,
        }];

    const updatedUser = { ...user, favorites: newFavorites };
    await updateUser(updatedUser);
    return !isFavorite;
  };

 const logout = async () => {
  console.log('[logout] iniciando...');
  try {
    await authService.logout();
    console.log('[logout] authService.logout() OK');
  } catch (e) {
    console.log('[logout] authService falhou, limpando manualmente:', e.message);
    await AsyncStorage.multiRemove(['wavecare_token', 'wavecare_user', 'wavecare_cart']);
  }
  resetCart();
  resetOrders();
  setUser({ id: 'guest', guest: true, favorites: [] });
  console.log('[logout] estado limpo, user virou guest');
};

  const deleteAccount = async () => {
    console.log('[deleteAccount] iniciando, user.id:', user?.id);
    
    try {
      // 1. PRIMEIRO deleta na API (ainda com token válido)
      if (user?.id && !user.guest) {
        console.log('[deleteAccount] chamando API DELETE /users/' + user.id);
        await deleteUserApi(user.id);
        console.log('[deleteAccount] API DELETE OK');
      }
    } catch (error) {
      console.log('[deleteAccount] erro na API:', error.response?.status, error.message);
      // Continua mesmo com erro
    } finally {
      // 2. SÓ DEPOIS limpa tudo localmente
      console.log('[deleteAccount] limpando local...');
      await authService.logout(); // remove token do AsyncStorage
      await AsyncStorage.multiRemove(['wavecare_token', 'wavecare_user', 'wavecare_cart']);
      resetCart();
      resetOrders();
      setUser({ id: 'guest', guest: true, favorites: [] });
      console.log('[deleteAccount] concluído');
    }
  };

  return (
  <UserContext.Provider value={{ 
      user, 
      login, 
      updateUser, 
      toggleFavorite, 
      logout,        // ← está aqui?
      deleteAccount, // ← está aqui?
      refreshUser 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);