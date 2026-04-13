// contexts/UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('wavecare_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  const updateUser = async (updatedUser) => {
    setUser(updatedUser);
    await AsyncStorage.setItem('wavecare_user', JSON.stringify(updatedUser));
  };

  const toggleFavorite = async (product) => {
    if (!user || user.guest) {
      // Se for convidado, redireciona para login
      return false;
    }

    const currentFavorites = user.favorites || [];
    const isFavorite = currentFavorites.some(fav => fav.id === product.id);
    
    let newFavorites;
    if (isFavorite) {
      newFavorites = currentFavorites.filter(fav => fav.id !== product.id);
    } else {
      newFavorites = [...currentFavorites, {
        id: product.id,
        name: product.nome,
        price: product.preco,
        image: product.image,
        categoria: product.categoria,
        estacao: product.estacao
      }];
    }
    
    const updatedUser = { ...user, favorites: newFavorites };
    await updateUser(updatedUser);
    return !isFavorite; // Retorna true se adicionou, false se removeu
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, updateUser, toggleFavorite, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);