import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MenuMobile from '../components/MenuMobile';
import LojaScreen from './LojaScreen';
import QuizScreen from './QuizScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;

const COLORS = {
  primary: '#2D5A45',
  background: '#FCFBFA',
  card: '#FFFFFF',
  text: '#1C1C1E',
  muted: '#8E8E93',
  border: '#F0EDED',
  accent: '#F0F7F4',
};

const ESTACOES = [
  { key: 'verao', label: 'Verão', sub: 'Proteção & Hidratação', image: require('../../assets/products/verao-produtos/propaganda-verao.jpg') },
  { key: 'outono', label: 'Outono', sub: 'Fortalecimento Anti-queda', image: require('../../assets/products/outono-produtos/propaganda-outono.png') },
  { key: 'inverno', label: 'Inverno', sub: 'Nutrição Profunda', image: require('../../assets/products/inverno-produtos/propaganda-inverno.png') },
];

const PRODUTOS = [
  { id: '1', nome: 'Wave Care Golden Shine Oil', preco: 'R$44,90', desc: 'Brilho e proteção térmica.', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
  { id: '2', nome: 'Autumn Curl Styling Jelly', preco: 'R$36,90', desc: 'Definição para ondas e cachos.', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400' },
];

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Wave Care</Text>
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
      </TouchableOpacity>
    </View>
  );
}

function QuizCard({ onPress }) {
  return (
    <TouchableOpacity 
      style={styles.quizCard} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      <View style={styles.quizIconBg}>
        <Ionicons name="sparkles" size={22} color={COLORS.primary} />
      </View>
      <View style={styles.quizTextContent}>
        <Text style={styles.quizCardTitle}>Consultoria IA</Text>
        <Text style={styles.quizCardSub}>Descubra o kit ideal para sua curvatura.</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
    </TouchableOpacity>
  );
}

function HomeContent({ onQuizPress, onEstacaoPress }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.heroContainer}>
        <Image source={require('../../assets/banner-home.png')} style={styles.heroImage} />
        <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent']} style={styles.heroOverlay}>
         
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sua Estação</Text>
        <FlatList
          data={ESTACOES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.estacaoCard}
              onPress={() => onEstacaoPress(item.label)}
            >
              <Image source={item.image} style={styles.estacaoImg} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.estacaoGradient}>
                <Text style={styles.estacaoLabel}>{item.label}</Text>
                <Text style={styles.estacaoSub}>{item.sub}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      </View>

      <QuizCard onPress={onQuizPress} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mais Amados</Text>
        {PRODUTOS.map((p) => (
          <View key={p.id} style={styles.produtoCard}>
            <Image source={{ uri: p.image }} style={styles.produtoImg} />
            <View style={styles.produtoInfo}>
              <Text style={styles.produtoNome}>{p.nome}</Text>
              <View style={styles.produtoFooter}>
                <Text style={styles.produtoPreco}>{p.preco}</Text>
                <TouchableOpacity style={styles.addBtn}>
                  <Ionicons name="add" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default function HomeScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedEstacao, setSelectedEstacao] = useState(null);

  const handleTabChange = (tabKey, estacao = null) => {
    setActiveTab(tabKey);
    if (estacao) {
      setSelectedEstacao(estacao);
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return (
          <HomeContent 
            onQuizPress={() => handleTabChange('quiz')}
            onEstacaoPress={(estacao) => handleTabChange('loja', estacao)}
          />
        );
      case 'loja':
        return <LojaScreen estacaoFilter={selectedEstacao} />;
     
     case 'quiz':
  return <QuizScreen />;  
  
  case 'estacoes':
        return (
          <View style={styles.placeholderContainer}>
            <Ionicons name="leaf-outline" size={64} color={COLORS.muted} />
            <Text style={styles.placeholderText}>
              Produtos da {selectedEstacao || 'Estação'}
            </Text>
          </View>
        );
      case 'perfil':
        return (
          <View style={styles.placeholderContainer}>
            <Ionicons name="person-outline" size={64} color={COLORS.muted} />
            <Text style={styles.placeholderText}>Perfil</Text>
          </View>
        );
      default:
        return <HomeContent onQuizPress={() => handleTabChange('quiz')} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {activeTab === 'home' && <Header />}
      
      {renderContent()}
      
      <MenuMobile activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: COLORS.background,
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: COLORS.primary 
  },
  iconButton: {
    padding: 4,
  },
  heroContainer: { 
    marginHorizontal: 20, 
    height: 160, 
    borderRadius: 24, 
    overflow: 'hidden', 
    marginBottom: 25 
  },
  heroImage: { 
    width: '100%', 
    height: '100%', 
    position: 'absolute' 
  },
  heroOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20 
  },
  heroTitle: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  section: { 
    marginBottom: 25 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: COLORS.text, 
    marginLeft: 20, 
    marginBottom: 15 
  },
  estacaoCard: { 
    width: CARD_WIDTH, 
    height: 160, 
    marginRight: 15, 
    borderRadius: 20, 
    overflow: 'hidden' 
  },
  estacaoImg: { 
    width: '100%', 
    height: '100%' 
  },
  estacaoGradient: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: '60%', 
    justifyContent: 'flex-end', 
    padding: 15 
  },
  estacaoLabel: { 
    color: '#FFF', 
    fontSize: 18, 
    fontWeight: '700' 
  },
  estacaoSub: { 
    color: 'rgba(255,255,255,0.8)', 
    fontSize: 12 
  },
  quizCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.card, 
    marginHorizontal: 20, 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 30, 
    borderWidth: 1, 
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quizIconBg: { 
    width: 45, 
    height: 45, 
    borderRadius: 12, 
    backgroundColor: COLORS.accent, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  quizTextContent: { 
    flex: 1 
  },
  quizCardTitle: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: COLORS.text 
  },
  quizCardSub: { 
    fontSize: 12, 
    color: COLORS.muted 
  },
  produtoCard: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.card, 
    marginHorizontal: 20, 
    marginBottom: 12, 
    borderRadius: 20, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  produtoImg: { 
    width: 70, 
    height: 70, 
    borderRadius: 12 
  },
  produtoInfo: { 
    flex: 1, 
    marginLeft: 12, 
    justifyContent: 'space-between' 
  },
  produtoNome: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: COLORS.text 
  },
  produtoFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  produtoPreco: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: COLORS.primary 
  },
  addBtn: { 
    backgroundColor: COLORS.primary, 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    textAlign: 'center',
  },
});