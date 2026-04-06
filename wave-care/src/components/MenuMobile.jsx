import React, { useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const TABS = [
  { key: 'home',   icon: 'home-outline',        iconActive: 'home' },
  { key: 'explore',icon: 'compass-outline',      iconActive: 'compass' },
  { key: 'search', icon: 'search-outline',       iconActive: 'search' },
  { key: 'cart',   icon: 'bag-handle-outline',   iconActive: 'bag-handle' },
];

const ACTIVE_COLOR   = '#3EA89B';   // teal, igual ao da imagem
const INACTIVE_COLOR = '#8A8F9E';
const BAR_BG         = '#C8CDD8';   // cinza azulado do mock
const CONTAINER_BG   = '#2B2D35';   // fundo escuro ao redor

export default function MenuMobile({ onTabChange }) {
  const [activeTab, setActiveTab] = useState('home');
  const scales = useRef(TABS.map(() => new Animated.Value(1))).current;

  const handlePress = (key, index) => {
    setActiveTab(key);
    onTabChange?.(key);

    // pop animation
    Animated.sequence([
      Animated.timing(scales[index], {
        toValue: 0.78,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scales[index], {
        toValue: 1,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {TABS.map((tab, index) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onPress={() => handlePress(tab.key, index)}
              style={styles.tabButton}
            >
              <Animated.View
                style={[
                  styles.iconWrap,
                  isActive && styles.iconWrapActive,
                  { transform: [{ scale: scales[index] }] },
                ]}
              >
                <Ionicons
                  name={isActive ? tab.iconActive : tab.icon}
                  size={24}
                  color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
                />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: CONTAINER_BG,
    paddingHorizontal: 12,
    paddingBottom: 8,
    paddingTop: 6,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: BAR_BG,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    // sombra sutil
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(62,168,155,0.13)',
  },
});