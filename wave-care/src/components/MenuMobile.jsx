import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ACTIVE_COLOR = '#2D5A45';
const INACTIVE_COLOR = '#ABABAB';
const HOME_BG = '#2D5A45';

const ESTACOES = [
  { label: 'Verão',     icon: 'sunny',      activeColor: '#F59E0B' },
  { label: 'Outono',    icon: 'leaf',       activeColor: '#B45309' },
  { label: 'Inverno',   icon: 'snow',       activeColor: '#3B82F6' },
  { label: 'Primavera', icon: 'flower',     activeColor: '#EC4899' },
];

const TABS = [
  { key: 'loja',     label: 'Loja',     icon: 'bag-handle' },
  { key: 'quiz',     label: 'Quiz',     icon: 'help-circle' },
  { key: 'home',     label: 'Home',     icon: 'home',   center: true },
  { key: 'estacoes', label: 'Estações', icon: 'leaf' },
  { key: 'perfil',   label: 'Perfil',   icon: 'person' },
];

/**
 * MenuMobile
 *
 * Props:
 *   activeTab   {string}    – chave da aba ativa (ex: 'home', 'loja')
 *   onTabChange {function}  – callback(tabKey, estacaoLabel?)
 */
export default function MenuMobile({ activeTab = 'home', onTabChange }) {
  const [showEstacoes, setShowEstacoes]   = useState(false);
  const [activeEstacao, setActiveEstacao] = useState(null);

  const handlePress = (tab) => {
    if (tab.key === 'estacoes') {
      setShowEstacoes(true);
      return;
    }
    onTabChange?.(tab.key);
  };

  const handleSelectEstacao = (estacao) => {
  setActiveEstacao(estacao.label);
  setShowEstacoes(false);
  onTabChange?.('loja', estacao.label); 
};

  const isEstacaoActive = activeTab === 'estacoes';

  return (
    <>
      {/* ── BARRA DE NAVEGAÇÃO ── */}
      <View style={styles.container}>
        {TABS.map((tab) => {
          if (tab.center) {
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.centerWrapper}
                onPress={() => handlePress(tab)}
                activeOpacity={0.85}
              >
                <View style={[
                  styles.centerButton,
                  activeTab === 'home' && styles.centerButtonActive,
                ]}>
                  <Ionicons name={tab.icon} size={26} color="#fff" />
                </View>
              </TouchableOpacity>
            );
          }

          const isActive =
            activeTab === tab.key ||
            (tab.key === 'estacoes' && isEstacaoActive);

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => handlePress(tab)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.icon : `${tab.icon}-outline`}
                size={22}
                color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.key === 'estacoes' && activeEstacao
                  ? activeEstacao
                  : tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── BOTTOM SHEET DE ESTAÇÕES ── */}
      <Modal
        visible={showEstacoes}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowEstacoes(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowEstacoes(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>

            <View style={styles.handle} />

            <Text style={styles.sheetTitle}>Escolha uma estação</Text>

            {ESTACOES.map((estacao) => {
              const selected = activeEstacao === estacao.label;
              return (
                <TouchableOpacity
                  key={estacao.label}
                  style={[styles.estacaoItem, selected && styles.estacaoItemSelected]}
                  onPress={() => handleSelectEstacao(estacao)}
                  activeOpacity={0.75}
                >
                  <View style={[
                    styles.estacaoIconWrapper,
                    { backgroundColor: estacao.activeColor + '22' },
                  ]}>
                    <Ionicons
                      name={estacao.icon}
                      size={20}
                      color={estacao.activeColor}
                    />
                  </View>
                  <Text style={[styles.estacaoLabel, selected && styles.estacaoLabelSelected]}>
                    {estacao.label}
                  </Text>
                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={ACTIVE_COLOR}
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              );
            })}

          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ── Barra ──────────────────────────────────────────────
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    color: INACTIVE_COLOR,
    fontWeight: '400',
  },
  labelActive: {
    color: ACTIVE_COLOR,
    fontWeight: '600',
  },

  // ── Botão central (Home) ────────────────────────────────
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
    marginTop: -24,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: HOME_BG,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: HOME_BG,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  centerButtonActive: {
    shadowOpacity: 0.6,
    transform: [{ scale: 1.05 }],
  },

  // ── Overlay + Sheet ─────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // ── Itens do Sheet ──────────────────────────────────────
  estacaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  estacaoItemSelected: {
    backgroundColor: '#2D5A450D',
  },
  estacaoIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estacaoLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  estacaoLabelSelected: {
    color: ACTIVE_COLOR,
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 'auto',
  },
});