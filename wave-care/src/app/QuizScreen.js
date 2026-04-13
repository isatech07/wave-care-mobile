import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeInUp,
  FadeInDown,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import MenuMobile from "../components/MenuMobile";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#2D5A45",
  primaryDark: "#1E3D2F",
  primaryLight: "#3A7359",
  accent: "#C9A77C",
  accentLight: "#E4D4BC",
  background: "#FDFBF8",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F4F0",
  text: "#1C1C1C",
  textSecondary: "#5A5A5A",
  textMuted: "#8A8A8A",
  border: "#E8E4DF",
  borderLight: "#F0ECE7",
  success: "#2D5A45",
  summer: {
    primary: "#9B4B2D",
    light: "#D4815F",
    gradient: ["#9B4B2D", "#C76B45"],
  },
  autumn: {
    primary: "#5C6B3D",
    light: "#8B9B5D",
    gradient: ["#5C6B3D", "#7A8B5A"],
  },
  winter: {
    primary: "#2C3E50",
    light: "#5D6D7E",
    gradient: ["#2C3E50", "#4A5568"],
  },
  spring: {
    primary: "#8B4A6B",
    light: "#B87A9A",
    gradient: ["#8B4A6B", "#A66A8A"],
  },
};

const QUESTIONS = [
  {
    id: 1,
    question: "Em qual cidade do Litoral Norte você mora?",
    subtitle: "Cada região tem características climáticas únicas",
    options: [
      { label: "Caraguatatuba", value: "caraguatatuba" },
      { label: "São Sebastião", value: "sao-sebastiao" },
      { label: "Ilhabela", value: "ilhabela" },
      { label: "Ubatuba", value: "ubatuba" },
    ],
  },
  {
    id: 2,
    question: "Qual é o seu tipo de cabelo?",
    subtitle: "Selecione o que mais se aproxima da sua textura natural",
    options: [
      { label: "Liso", value: "liso" },
      { label: "Ondulado", value: "ondulado" },
      { label: "Cacheado", value: "cacheado" },
      { label: "Crespo", value: "crespo" },
    ],
  },
  {
    id: 3,
    question: "Com que frequência você vai à praia?",
    subtitle: "A exposição ao mar afeta diretamente a saúde do cabelo",
    options: [
      { label: "Quase todos os dias", value: "diario" },
      { label: "Fins de semana", value: "semanal" },
      { label: "Algumas vezes por mês", value: "mensal" },
      { label: "Raramente", value: "raro" },
    ],
  },
  {
    id: 4,
    question: "Como seu cabelo fica após a praia?",
    subtitle: "Observe a textura e aparência nas horas seguintes",
    options: [
      { label: "Ressecado e áspero", value: "ressecado" },
      { label: "Com muito frizz", value: "frizz" },
      { label: "Opaco e sem brilho", value: "opaco" },
      { label: "Fica normal", value: "normal" },
    ],
  },
  {
    id: 5,
    question: "Você lava o cabelo após entrar no mar?",
    subtitle: "O sal marinho pode causar danos se não for removido",
    options: [
      { label: "Sempre", value: "sempre" },
      { label: "Às vezes", value: "as-vezes" },
      { label: "Raramente", value: "raramente" },
      { label: "Nunca pensei nisso", value: "nunca" },
    ],
  },
  {
    id: 6,
    question: "Qual a condição atual do seu cabelo?",
    subtitle: "Seja sincera na avaliação",
    options: [
      { label: "Seco e quebradiço", value: "seco" },
      { label: "Oleoso na raiz", value: "misto" },
      { label: "Com pontas duplas", value: "danificado" },
      { label: "Saudável", value: "saudavel" },
    ],
  },
  {
    id: 7,
    question: "Faz algum tratamento químico?",
    subtitle: "Processos químicos alteram a estrutura capilar",
    options: [
      { label: "Coloração", value: "coloracao" },
      { label: "Progressiva", value: "progressiva" },
      { label: "Descoloração", value: "descoloracao" },
      { label: "Nenhum", value: "natural" },
    ],
  },
  {
    id: 8,
    question: "Qual sua principal queixa?",
    subtitle: "O que mais te incomoda no dia a dia",
    options: [
      { label: "Falta de hidratação", value: "hidratacao" },
      { label: "Frizz", value: "frizz" },
      { label: "Falta de definição", value: "definicao" },
      { label: "Queda ou quebra", value: "queda" },
    ],
  },
  {
    id: 9,
    question: "Em qual estação do ano estamos agora?",
    subtitle: "Isso vai definir o kit ideal para a época atual",
    options: [
      { label: "Verão", value: "verao", season: "verao" },
      { label: "Outono", value: "outono", season: "outono" },
      { label: "Inverno", value: "inverno", season: "inverno" },
      { label: "Primavera", value: "primavera", season: "primavera" },
    ],
  },
];

const SEASONAL_PRODUCTS = {
  verao: {
    name: "Summer Protection",
    season: "Verão",
    color: COLORS.summer,
    benefits: ["Proteção UV", "Hidratação Intensa", "Anti-sal marinho", "Brilho Duradouro"],
    products: [
      "Shampoo Summer Protection",
      "Condicionador Summer",
      "Máscara de Hidratação",
      "Leave-in com FPS",
      "Óleo Finalizador"
    ],
    description: "Kit completo para proteger seus cabelos durante os dias quentes de verão. Fórmula com filtro UV e agentes anti-sal marinho.",
    filterSeason: "Verão",
  },
  outono: {
    name: "Autumn Bloom",
    season: "Outono",
    color: COLORS.autumn,
    benefits: ["Nutrição Profunda", "Fortalecimento", "Brilho Intenso", "Controle de Frizz"],
    products: [
      "Shampoo Autumn Bloom",
      "Condicionador Autumn",
      "Máscara Nutritiva",
      "Óleo de Argan",
      "Creme para Pentear"
    ],
    description: "Nutrição profunda para fortalecer os fios durante a mudança de estação. Repõe lipídios e devolve a vitalidade.",
    filterSeason: "Outono",
  },
  inverno: {
    name: "Winter Complete",
    season: "Inverno",
    color: COLORS.winter,
    benefits: ["Hidratação Profunda", "Proteção Térmica", "Antifrizz", "Brilho Duradouro"],
    products: [
      "Shampoo Winter Complete",
      "Condicionador Winter",
      "Máscara Hidratante",
      "Leave-in Protetor",
      "Sérum Antifrizz"
    ],
    description: "Hidratação intensiva para combater o ressecamento típico do inverno. Protege os fios do vento e baixas temperaturas.",
    filterSeason: "Inverno",
  },
  primavera: {
    name: "Primavera Bloom",
    season: "Primavera",
    color: COLORS.spring,
    benefits: ["Definição Natural", "Leveza", "Hidratação Equilibrada", "Ativação de Cachos"],
    products: [
      "Shampoo Primavera Bloom",
      "Condicionador Revitalizante",
      "Máscara de Definição",
      "Gelatina Modeladora",
      "Leave-in Cremoso"
    ],
    description: "Revitalização e definição natural para cabelos ondulados e cacheados. Traz leveza e movimento aos fios.",
    filterSeason: "Primavera",
  },
};

function OptionCard({ option, index, onPress, isSelected, letter }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80).duration(400)}
      style={animatedStyle}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        activeOpacity={1}
      >
        <View style={[styles.optionCard, isSelected && styles.optionCardSelected]}>
          <View style={[styles.optionLetter, isSelected && styles.optionLetterSelected]}>
            <Text style={[styles.optionLetterText, isSelected && styles.optionLetterTextSelected]}>
              {letter}
            </Text>
          </View>
          <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
            {option.label}
          </Text>
          <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
            {isSelected && <View style={styles.radioInner} />}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function ProductItem({ product, index }) {
  return (
    <Animated.View
      entering={FadeInUp.delay(500 + index * 80).duration(400)}
      style={styles.productItem}
    >
      <View style={styles.productDot} />
      <Text style={styles.productItemText}>{product}</Text>
    </Animated.View>
  );
}

export default function QuizScreen({ navigation, onTabChange, setActiveTab }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(((step + 1) / QUESTIONS.length) * 100, { duration: 400 });
  }, [step]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  function handleAnswer(option) {
    setSelectedOption(option.value);

    setTimeout(() => {
      const newAnswers = { ...answers, [step + 1]: option };
      setAnswers(newAnswers);

      if (step + 1 < QUESTIONS.length) {
        setStep(step + 1);
        setSelectedOption(null);
      } else {
        const selectedSeason = option.season || option.value;
        const product = SEASONAL_PRODUCTS[selectedSeason];
        setResult({ season: selectedSeason, product, answers: newAnswers });
        setFinished(true);
      }
    }, 250);
  }

  function restartQuiz() {
    setStep(0);
    setAnswers({});
    setFinished(false);
    setSelectedOption(null);
    setResult(null);
    progress.value = 0;
  }

  function goBack() {
    if (step > 0) {
      setStep(step - 1);
      setSelectedOption(null);
    }
  }

  function goToLoja(seasonFilter = null) {
    if (setActiveTab) {
      setActiveTab('loja');
      if (seasonFilter && onTabChange) {
        onTabChange('loja', seasonFilter);
      } else if (onTabChange) {
        onTabChange('loja');
      }
    } else if (navigation) {
      navigation.navigate('Home', { screen: 'Loja', params: { estacaoFilter: seasonFilter } });
    }
  }

  const letters = ["A", "B", "C", "D"];

  if (finished && result) {
    const product = result.product;
    const seasonColors = product.color.gradient;
    
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.resultContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(500)} style={styles.resultHero}>
            <LinearGradient
              colors={seasonColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.resultHeroGradient}
            >
              <Text style={styles.resultBadge}>Kit Recomendado</Text>
              <Text style={styles.resultProductName}>{product.name}</Text>
              <Text style={styles.resultSeason}>{product.season}</Text>
              <Text style={styles.resultDescription}>{product.description}</Text>
            </LinearGradient>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.benefitsSection}>
            <Text style={styles.sectionTitle}>Benefícios do Kit</Text>
            <View style={styles.benefitsGrid}>
              {product.benefits.map((benefit, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInUp.delay(250 + index * 80).duration(400)}
                  style={styles.benefitCard}
                >
                  <LinearGradient
                    colors={seasonColors}
                    style={styles.benefitIcon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.benefitIconText}>✓</Text>
                  </LinearGradient>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(450).duration(400)} style={styles.productsSection}>
            <Text style={styles.sectionTitle}>Produtos Inclusos</Text>
            <View style={styles.productsList}>
              {product.products.map((prod, index) => (
                <ProductItem key={index} product={prod} index={index} />
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(700).duration(400)}>
            <TouchableOpacity
              style={styles.shopButton}
              activeOpacity={0.9}
              onPress={() => goToLoja(product.filterSeason)}
            >
              <LinearGradient
                colors={seasonColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shopButtonGradient}
              >
                <Text style={styles.shopButtonText}>Comprar Kit {product.name}</Text>
                <Text style={styles.shopButtonArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(800).duration(400)}>
            <TouchableOpacity
              style={styles.storeButton}
              activeOpacity={0.9}
              onPress={() => goToLoja()}
            >
              <View style={styles.storeButtonContent}>
                <Text style={styles.storeButtonText}>Explorar todos os produtos</Text>
                <Text style={styles.storeButtonArrow}>→</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.restartButton}
            onPress={restartQuiz}
            activeOpacity={0.7}
          >
            <Text style={styles.restartText}>Refazer diagnóstico</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentQuestion = QUESTIONS[step];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goBack}
          disabled={step === 0}
          activeOpacity={0.7}
        >
          <Text style={[styles.backText, step === 0 && styles.backTextDisabled]}>
            ←
          </Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Wave Care</Text>
        </View>

        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>{step + 1}/{QUESTIONS.length}</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          key={step}
          entering={SlideInRight.duration(300)}
          exiting={SlideOutLeft.duration(200)}
          style={styles.questionSection}
        >
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          <Text style={styles.questionSubtitle}>{currentQuestion.subtitle}</Text>
        </Animated.View>

        <View style={styles.optionsSection}>
          {currentQuestion.options.map((option, index) => (
            <OptionCard
              key={option.value}
              option={option}
              index={index}
              letter={letters[index]}
              onPress={() => handleAnswer(option)}
              isSelected={selectedOption === option.value}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerLine} />
        <Text style={styles.footerText}>Litoral Norte SP</Text>
        
      </View>
      <MenuMobile />
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 24,
    color: COLORS.text,
    fontWeight: "300",
  },
  backTextDisabled: {
    color: COLORS.textMuted,
  },
  logoContainer: {
    flex: 1,
    alignItems: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    letterSpacing: 1,
  },
  stepIndicator: {
    width: 44,
    alignItems: "flex-end",
  },
  stepText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  progressBar: {
    height: 2,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 20,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  questionSection: {
    marginBottom: 40,
  },
  questionText: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    lineHeight: 36,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  questionSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  optionsSection: {
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceAlt,
  },
  optionLetter: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionLetterSelected: {
    backgroundColor: COLORS.primary,
  },
  optionLetterText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  optionLetterTextSelected: {
    color: COLORS.surface,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerLine: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textMuted,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  resultContainer: {
    paddingBottom: 40,
  },
  resultHero: {
    marginBottom: 24,
  },
  resultHeroGradient: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  resultBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  resultProductName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  resultSeason: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 16,
  },
  resultDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 20,
  },
  benefitsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  benefitsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  benefitCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  benefitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitIconText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  benefitText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
  },
  productsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  productsList: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  productDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  productItemText: {
    fontSize: 15,
    color: COLORS.text,
  },
  shopButton: {
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  shopButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 12,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  shopButtonArrow: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  storeButton: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  storeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  storeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.primary,
  },
  storeButtonArrow: {
    fontSize: 16,
    color: COLORS.primary,
  },
  restartButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  restartText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});