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
      } else {
        // Usuário convidado padrão
        setUser({ 
          id: 'guest', 
          guest: true, 
          favorites: [],
          name: 'Convidado',
          email: 'convidado@wavecare.com'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setUser({ id: 'guest', guest: true, favorites: [] });
    }
  };

  const updateUser = async (updatedUser) => {
    setUser(updatedUser);
    await AsyncStorage.setItem('wavecare_user', JSON.stringify(updatedUser));
  };

  const toggleFavorite = async (product) => {
    if (!user || user.guest) {
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
    return !isFavorite;
  };

  const logout = () => {
    setUser({ id: 'guest', guest: true, favorites: [] });
  };

  return (
    <UserContext.Provider value={{ user, updateUser, toggleFavorite, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);