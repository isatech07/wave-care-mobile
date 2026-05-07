import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  background: '#f7f5f2',
  green: '#023c33',
  greenLight: '#045c4f',
  greenMuted: '#0a7a6a',
  gold: '#c9b99a',
  white: '#ffffff',
  dark: '#1a1a1a',
  darkSoft: '#2d2d2d',
  gray: '#888888',
  lightGray: '#cccccc',
  red: '#e53935',
};

function CartSheet({ visible, cart, onClose, onAdd, onRemove, onDelete }) {
  const total = cart.reduce((sum, item) => sum + (item.preco || item.price || 0) * item.qty, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);

  if (!visible) return null;

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.cartOverlay}>
      <TouchableOpacity style={styles.cartBackdrop} onPress={onClose} activeOpacity={1} />
      <Animated.View entering={SlideInUp.duration(400).springify().damping(18)} exiting={SlideOutDown.duration(300)} style={styles.cartSheet}>
        <View style={styles.cartHandle} />
        <View style={styles.cartHeader}>
          <View>
            <Text style={styles.cartTitle}>Minha Sacola</Text>
            {itemCount > 0 && (
              <Text style={styles.cartItemCount}>{itemCount} {itemCount === 1 ? 'item' : 'itens'}</Text>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.cartCloseBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color={COLORS.dark} />
          </TouchableOpacity>
        </View>

        {cart.length === 0 ? (
          <View style={styles.cartEmpty}>
            <View style={styles.cartEmptyIcon}>
              <Ionicons name="cart-outline" size={40} color={COLORS.lightGray} />
            </View>
            <Text style={styles.cartEmptyTitle}>Sua sacola está vazia</Text>
            <Text style={styles.cartEmptyText}>Adicione produtos para começar</Text>
            <TouchableOpacity style={styles.cartEmptyBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cartEmptyBtnText}>Explorar produtos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
              {cart.map((item, index) => (
                <Animated.View key={item.id || item.name} entering={FadeInDown.delay(index * 80).springify()} style={styles.cartItem}>
                  <Image source={item.image} style={styles.cartItemImage} contentFit="cover" />
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName} numberOfLines={1}>{item.nome || item.name}</Text>
                    <Text style={styles.cartItemCategory}>{item.categoria || 'Produto'}</Text>
                    <Text style={styles.cartItemPrice}>R$ {((item.preco || item.price || 0) * item.qty).toFixed(2)}</Text>
                    <View style={styles.cartQtyRow}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => onRemove(item.id || item.name)} activeOpacity={0.7}>
                        <Ionicons name="remove" size={14} color={COLORS.green} />
                      </TouchableOpacity>
                      <View style={styles.qtyDisplay}>
                        <Text style={styles.qtyText}>{item.qty}</Text>
                      </View>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => onAdd(item)} activeOpacity={0.7}>
                        <Ionicons name="add" size={14} color={COLORS.green} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id || item.name)} activeOpacity={0.7}>
                    <Ionicons name="trash-outline" size={16} color={COLORS.red} />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>

            <View style={styles.cartFooter}>
              <View style={styles.cartFooterDivider} />
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.subtotalValue}>R$ {total.toFixed(2)}</Text>
              </View>
              <View style={styles.shippingRow}>
                <Text style={styles.shippingLabel}>Frete</Text>
                <Text style={styles.shippingFree}>Grátis</Text>
              </View>
              <View style={styles.totalDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.85}>
                <LinearGradient colors={[COLORS.green, COLORS.greenLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.checkoutGradient}>
                  <Text style={styles.checkoutBtnText}>Finalizar Compra</Text>
                  <View style={styles.checkoutArrow}>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.green} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cartOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  cartBackdrop: {
    flex: 1,
  },
  cartSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    maxHeight: '85%',
  },
  cartHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.gray,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  cartTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: COLORS.dark,
  },
  cartItemCount: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 2,
  },
  cartCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  cartEmptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cartEmptyTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.dark,
    marginBottom: 8,
  },
  cartEmptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 24,
  },
  cartEmptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: COLORS.green,
  },
  cartEmptyBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.white,
  },
  cartList: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  cartItemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.dark,
    marginBottom: 4,
  },
  cartItemCategory: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
  },
  cartItemPrice: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: COLORS.green,
    marginBottom: 8,
  },
  cartQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyDisplay: {
    width: 32,
    alignItems: 'center',
  },
  qtyText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.dark,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.red + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: COLORS.white,
  },
  cartFooterDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginBottom: 16,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subtotalLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.gray,
  },
  subtotalValue: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: COLORS.dark,
  },
  shippingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shippingLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: COLORS.gray,
  },
  shippingFree: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.green,
  },
  totalDivider: {
    height: 1,
    backgroundColor: COLORS.green + '20',
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  totalLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.dark,
  },
  totalValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: COLORS.green,
  },
  checkoutBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  checkoutBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: COLORS.white,
  },
  checkoutArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CartSheet;
