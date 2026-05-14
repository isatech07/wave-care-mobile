import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUser as updateUserApi, deleteUser as deleteUserApi } from '../services/userService';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    loadUser();
    loadCart();
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

  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem('wavecare_cart');
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      setCart([]);
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
    await AsyncStorage.multiRemove(['wavecare_user', 'wavecare_last_email']);
    setUser({ id: 'guest', guest: true, favorites: [] });
  };

  const addToCart = async (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id || i.name === product.name);
      if (existing) {
        const updated = prev.map(i => (i.id === product.id || i.name === product.name) ? { ...i, qty: i.qty + 1 } : i);
        AsyncStorage.setItem('wavecare_cart', JSON.stringify(updated));
        return updated;
      }
      const newCart = [...prev, { ...product, qty: 1 }];
      AsyncStorage.setItem('wavecare_cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = async (id) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id || i.name === id);
      if (existing && existing.qty === 1) {
        const updated = prev.filter(i => i.id !== id && i.name !== id);
        AsyncStorage.setItem('wavecare_cart', JSON.stringify(updated));
        return updated;
      }
      const updated = prev.map(i => (i.id === id || i.name === id) ? { ...i, qty: i.qty - 1 } : i);
      AsyncStorage.setItem('wavecare_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteFromCart = async (id) => {
    setCart(prev => {
      const updated = prev.filter(i => i.id !== id && i.name !== id);
      AsyncStorage.setItem('wavecare_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = async () => {
    setCart([]);
    await AsyncStorage.removeItem('wavecare_cart');
  };

  const addOrder = async (orderData) => {
    if (!user || user.guest) return;

    const newOrder = {
      id: orderData.id || Date.now(),
      products: orderData.products || [],
      total: orderData.total || 0,
      status: orderData.status || 'aguardando',
      date: orderData.date || new Date().toISOString(),
    };

    const updatedOrders = user.orders ? [...user.orders, newOrder] : [newOrder];
    const updatedUser = { ...user, orders: updatedOrders };

    setUser(updatedUser);
    await AsyncStorage.setItem('wavecare_user', JSON.stringify(updatedUser));
  };

  const deleteAccount = async () => {
    try {
      if (user?.id && !user.guest) {
        await deleteUserApi(user.id);
      }
      await AsyncStorage.multiRemove(['wavecare_user', 'wavecare_last_email', 'wavecare_cart']);
      setUser({ id: 'guest', guest: true, favorites: [] });
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      throw error;
    }
  };

  return (
<UserContext.Provider value={{ user, cart, login, updateUser, toggleFavorite, logout, deleteAccount, addToCart, removeFromCart, deleteFromCart, clearCart, addOrder }}>{children}</UserContext.Provider>

  );
}

export const useUser = () => useContext(UserContext);