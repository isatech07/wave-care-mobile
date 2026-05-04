import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUser as updateUserApi, deleteUser as deleteUserApi } from '../services/userService';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser(); // ← recarrega o usuário salvo ao iniciar
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
    setUser(userData);
    await AsyncStorage.setItem('wavecare_user', JSON.stringify(userData));
  };

  const updateUser = async (updatedUser) => {
    try {
      await updateUserApi(updatedUser.id, {
        name:     updatedUser.name,
        email:    updatedUser.email,
        telefone: updatedUser.phone,  
        cidade:   updatedUser.city,   
      });
    } catch (e) {
      console.error('Erro ao atualizar usuário na API:', e);
    }

    setUser(updatedUser);
    await AsyncStorage.setItem('wavecare_user', JSON.stringify(updatedUser));
  };

  const toggleFavorite = async (product) => {
    if (!user || user.guest) return false;

    const currentFavorites = user.favorites || [];
    const isFavorite = currentFavorites.some(fav => fav.id === product.id);

    const newFavorites = isFavorite
      ? currentFavorites.filter(fav => fav.id !== product.id)
      : [...currentFavorites, {
          id:       product.id,
          name:     product.nome,
          price:    product.preco,
          image:    product.image,
          categoria: product.categoria,
          estacao:  product.estacao,
        }];

    const updatedUser = { ...user, favorites: newFavorites };
    await updateUser(updatedUser);
    return !isFavorite;
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['wavecare_user', 'wavecare_last_email']);
    setUser({ id: 'guest', guest: true, favorites: [] });
  };

  const deleteAccount = async () => {
  if (user?.id && !user.guest) {
    await deleteUserApi(user.id);
  }
  await AsyncStorage.multiRemove(['wavecare_user', 'wavecare_last_email']);
  setUser({ id: 'guest', guest: true, favorites: [] });
  };

  return (
<UserContext.Provider value={{ user, login, updateUser, toggleFavorite, logout, deleteAccount }}>{children}</UserContext.Provider>

  );
}

export const useUser = () => useContext(UserContext);