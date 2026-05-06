import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs, useRouter } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';

export default function TabLayout() {
  const router = useRouter();
  const [seasonModalOpen, setSeasonModalOpen] = useState(false);

  const seasonOptions = [
    { key: 'verao', label: 'Verão', icon: 'sunny', color: '#F59E0B', route: '/(tabs)/verao' },
    { key: 'outono', label: 'Outono', icon: 'leaf', color: '#B45309', route: '/(tabs)/outono' },
    { key: 'inverno', label: 'Inverno', icon: 'snow', color: '#60A5FA', route: '/(tabs)/inverno' },
    { key: 'primavera', label: 'Primavera', icon: 'flower', color: '#EC4899', route: '/(tabs)/primavera' },
  ];

  const handleSeasonSelect = (route) => {
    setSeasonModalOpen(false);
    router.push(route);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#2D5A45',
          headerShown: false,
          tabBarStyle: {
            height: 65,
            paddingBottom: 5,
            paddingTop: 5,
          },

          tabBarLabelStyle: {
            fontFamily: 'Poppins_600SemiBold',
            fontSize: 11,
            textAlign: 'center',
          },

          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
      >
        <Tabs.Screen
          name="loja"
          options={{
            title: 'Loja',
            tabBarIcon: ({ color }) => (
              <FontAwesome size={20} name="shopping-bag" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="quiz"
          options={{
            title: 'Quiz',
            tabBarIcon: ({ color }) => (
              <FontAwesome size={20} name="question-circle" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <FontAwesome size={20} name="home" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="estacoes"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setSeasonModalOpen(true);
            },
          }}
          options={{
            title: 'Estações',
            tabBarIcon: ({ color }) => (
              <FontAwesome size={20} name="leaf" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => (
              <FontAwesome size={20} name="user" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="verao"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="outono"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="inverno"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="primavera"
          options={{
            href: null,
          }}
        />
      </Tabs>

      <Modal
        visible={seasonModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSeasonModalOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSeasonModalOpen(false)}>
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFillObject} />
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Escolha uma estação</Text>

            {seasonOptions.map((season) => (
              <TouchableOpacity
                key={season.key}
                style={styles.optionButton}
                activeOpacity={0.8}
                onPress={() => handleSeasonSelect(season.route)}
              >
                <View style={[styles.iconWrap, { backgroundColor: `${season.color}22` }]}>
                  <Ionicons name={season.icon} size={18} color={season.color} />
                </View>
                <Text style={styles.optionText}>{season.label}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  modalCard: {
    width: '84%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#2D5A45',
  },
});