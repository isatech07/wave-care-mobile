import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MenuMobile from '../components/MenuMobile';
import { useFonts, Poppins_400Regular, Poppins_500Medium } from '@expo-google-fonts/poppins';


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.72;
const CARD_GAP = 12;

/* Cores */ 
const COLORS = {
  green:      '#2D5A45',
  greenLight: '#3D7A5F',
  bg:         '#F7F5F0',
  white:      '#FFFFFF',
  dark:       '#1C1C1E',
  muted:      '#6B6B6B',
  star:       '#F59E0B',
};

/* Propaganda e Produtos */
const ESTACOES = [
  {
    key: 'verao',
    label: 'Verão',
    sub: 'Proteção Solar & Hidratação',
    bg: '#C17E42',
    image: require('../../assets/products/verao-produtos/propaganda-verao.jpg'),
  },
  {
    key: 'outono',
    label: 'Outono',
    sub: 'Fortalecimento Anti-queda',
    bg: '#7D5A3C',
    image: require('../../assets/products/outono-produtos/propaganda-outono.png'),
  },
  {
    key: 'inverno',
    label: 'Inverno',
    sub: 'Nutrição Profunda',
    bg: '#4A6FA5',
    image: require('../../assets/products/inverno-produtos/propaganda-inverno.png'),
  },
  {
    key: 'primavera',
    label: 'Primavera',
    sub: 'Leveza & Brilho',
    bg: '#A05C7B',
    image: require('../../assets/products/primavera-produtos/propaganda-primavera-2.png'),
  },
];

const PRODUTOS = [
  {
    id: '1',
    nome: 'Wave Care Golden Shine Oil',
    rating: 4.2,
    reviews: 98,
    desc: 'Óleo nutritivo leve com brilho instantâneo. Sela a cutícula, add pontas e realça a luminosidade natural dos fios sem pesar.',
    preco: 'R$44,90',
    volume: '100ml',
    cardBg: '#8B6355',
    image: require('../../assets/products/verao-produtos/verao-oleo.png'),
  },
  {
    id: '2',
    nome: 'Wave Care Autumn Curl Styling Jelly',
    rating: 4.8,
    reviews: 250,
    desc: 'A Geléia Estilizadora Autumn Wave define ondas e cachos sem frisar, controlando a frizz e garantindo movimento natural aos fios.',
    preco: 'R$36,90',
    volume: '500g',
    cardBg: '#5C7A4E',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200',
  },
  {
    id: '3',
    nome: 'Wave Care Primavera Bloom Leave-in Cream',
    rating: 4.8,
    reviews: 250,
    desc: 'A leave-in hidratante Autumn Bloom define ondas e cachos sem frisar, controlando o frizz e garantindo movimento natural aos fios.',
    preco: 'R$36,90',
    volume: '500g',
    cardBg: '#8B4F6E',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200',
  },
];

// ─── Componentes internos ─────────────────────────────────────────────────────

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Wave Care</Text>
    </View>
  );
}

function HeroBanner({ onQuiz, onLoja }) {
  return (
    <View style={styles.heroBanner}>
      {/* Troque por <Image source={require('../assets/hero.jpg')} style={styles.heroImage} /> */}
      <Image source={require('../../assets/banner-home.png')} style={styles.heroImage} />
      <View style={styles.heroOverlay}>
      </View>
      <View style={styles.heroBtns}>
        <TouchableOpacity style={styles.btnPrimary} onPress={onQuiz} activeOpacity={0.85}>
          <Ionicons name="sparkles" size={15} color="#fff" />
          <Text style={styles.btnPrimaryText}>Descubra seu tipo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={onLoja} activeOpacity={0.8}>
          <Text style={styles.btnSecondaryText}>Explorar Loja</Text>
          <Ionicons name="arrow-forward" size={15} color={COLORS.dark} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EstacaoCard({ item, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.estacaoCard, { width: CARD_WIDTH }]}
      activeOpacity={0.9}
      onPress={() => onPress(item)}
    >
      <Image source={item.image} style={styles.estacaoImage} resizeMode="cover" />
      <View style={[styles.estacaoGradient, { backgroundColor: item.bg + 'CC' }]} />
      <View style={styles.estacaoContent}>
        <Text style={styles.estacaoLabel}>{item.label}</Text>
        <Text style={styles.estacaoSub}>{item.sub}</Text>
        <TouchableOpacity style={styles.estacaoBtn} onPress={() => onPress(item)}>
          <Text style={styles.estacaoBtnText}>Ver produtos</Text>
          <Ionicons name="arrow-forward" size={13} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function KitsPorEstacao({ onEstacaoPress }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Kits por Estação</Text>
      <Text style={styles.sectionSub}>
        Cada Estação pede um cuidado diferente.{'\n'}Encontre o ideal para seus fios.
      </Text>
      <FlatList
        data={ESTACOES}
        keyExtractor={(i) => i.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselList}
        ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
        renderItem={({ item }) => (
          <EstacaoCard item={item} onPress={onEstacaoPress} />
        )}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
      />
    </View>
  );
}

function StarRating({ rating, reviews }) {
  return (
    <View style={styles.starRow}>
      <Ionicons name="star" size={13} color={COLORS.star} />
      <Text style={styles.ratingText}>{rating}</Text>
      <Text style={styles.reviewsText}>({reviews})</Text>
    </View>
  );
}

function ProdutoCard({ item, onAdicionar }) {
  return (
    <View style={[styles.produtoCard, { backgroundColor: item.cardBg }]}>
      <Image
        source={{ uri: item.image }}
        style={styles.produtoImage}
        resizeMode="cover"
      />
      <View style={styles.produtoInfo}>
        <Text style={styles.produtoNome} numberOfLines={2}>{item.nome}</Text>
        <StarRating rating={item.rating} reviews={item.reviews} />
        <Text style={styles.produtoDesc} numberOfLines={2}>{item.desc}</Text>
        <View style={styles.produtoFooter}>
          <Text style={styles.produtoPreco}>
            {item.preco}
            <Text style={styles.produtoVolume}> – {item.volume}</Text>
          </Text>
          <TouchableOpacity
            style={styles.adicionarBtn}
            onPress={() => onAdicionar(item)}
            activeOpacity={0.85}
          >
            <Text style={styles.adicionarText}>Adicionar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function ProdutosDestaque({ onAdicionar }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Produtos em Destaque</Text>
      <Text style={styles.sectionSub}>Os mais amados pela comunidade WaveCare</Text>
      {PRODUTOS.map((p) => (
        <ProdutoCard key={p.id} item={p} onAdicionar={onAdicionar} />
      ))}
    </View>
  );
}

function QuizCTA({ onPress }) {
  return (
    <View style={styles.quizSection}>
      <Ionicons name="sparkles" size={28} color={COLORS.green} />
      <Text style={styles.quizTitle}>Descubra seu tipo de cabelo</Text>
      <Text style={styles.quizSub}>
        Faça o nosso quiz inteligente e receba recomendações personalizadas{'\n'}para seu tipo de fio e estação
      </Text>
      <TouchableOpacity style={styles.quizBtn} onPress={onPress} activeOpacity={0.85}>
        <Ionicons name="sparkles" size={15} color="#fff" />
        <Text style={styles.quizBtnText}>Fazer o Quiz</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabChange = (tab, estacao) => {
    setActiveTab(tab);
    // Navegar para outras telas:
    // if (tab === 'loja') navigation.navigate('Loja');
    // if (tab === 'quiz') navigation.navigate('Quiz');
    // if (tab === 'estacoes') navigation.navigate('Estacoes', { estacao });
    // if (tab === 'perfil') navigation.navigate('Perfil');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <Header />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroBanner
          onQuiz={() => handleTabChange('quiz')}
          onLoja={() => handleTabChange('loja')}
        />

        <KitsPorEstacao
          onEstacaoPress={(estacao) => handleTabChange('estacoes', estacao.label)}
        />

        <ProdutosDestaque
          onAdicionar={(produto) => {
            // lógica de carrinho aqui
            console.log('Adicionado:', produto.nome);
          }}
        />

        <QuizCTA onPress={() => handleTabChange('quiz')} />

        <View style={{ height: 20 }} />
      </ScrollView>

      <MenuMobile activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },

  // Header
  header: {
    backgroundColor: '#9FA8B0',
    paddingVertical: 14,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // Hero
  heroBanner: {
    width: '100%',
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 24,
    left: 20,
  },
  heroLogo: {
    fontSize: 26,
    fontWeight: '300',
    color: COLORS.white,
    fontStyle: 'italic',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroBtns: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    gap: 10,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.green,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
  },
  btnSecondaryText: {
    color: COLORS.dark,
    fontSize: 14,
    fontWeight: '500',
  },

  // Sections
  section: {
    paddingTop: 28,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 6,
  },
  sectionSub: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
    marginBottom: 18,
  },

  // Carrossel de Estações
  carouselList: {
    paddingRight: 20,
  },
  estacaoCard: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
  },
  estacaoImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  estacaoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  estacaoContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  estacaoLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  estacaoSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 10,
  },
  estacaoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  estacaoBtnText: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  // Produtos
  produtoCard: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    minHeight: 130,
  },
  produtoImage: {
    width: 110,
    height: '100%',
  },
  produtoInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  produtoNome: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 19,
    marginBottom: 4,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '500',
  },
  reviewsText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  produtoDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 15,
    marginBottom: 10,
    flex: 1,
  },
  produtoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  produtoPreco: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  produtoVolume: {
    fontWeight: '400',
    fontSize: 12,
  },
  adicionarBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  adicionarText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '500',
  },

  // Quiz CTA
  quizSection: {
    margin: 20,
    marginTop: 10,
    padding: 24,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E4DF',
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
  quizSub: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  quizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.green,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 50,
  },
  quizBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});