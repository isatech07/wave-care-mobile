import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
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
    </Tabs>
  );
}